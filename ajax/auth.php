<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap/app.php';

\App\Bootstrap\AppBootstrap::bootApi();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    if ($action === 'me') {
        echo json_encode([
            'loggedIn'  => isset($_SESSION['user_id']),
            'username'  => htmlspecialchars($_SESSION['username'] ?? ''),
            'userId'    => (int)($_SESSION['user_id'] ?? 0),
            'csrfToken' => app_csrf_token(),
        ]);
        exit;
    }
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

function auth_json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function auth_require_csrf(string $action): void
{
    if (app_verify_csrf()) {
        return;
    }

    app_security_log('csrf_failed', ['endpoint' => 'auth', 'action' => $action]);
    auth_json_response(['error' => 'CSRF token invalid'], 403);
}

function auth_limit_or_fail(string $scope, int $limit, int $windowSeconds, string $action, ?string $identity = null): void
{
    $result = app_rate_limit($scope, $limit, $windowSeconds, $identity);
    if (($result['allowed'] ?? false) === true) {
        return;
    }

    app_security_log('rate_limited', [
        'endpoint' => 'auth',
        'action' => $action,
        'scope' => $scope,
        'retry_after' => $result['retry_after'] ?? 0,
    ]);

    auth_json_response([
        'error' => 'Слишком много запросов. Попробуй позже.',
        'retryAfter' => (int)($result['retry_after'] ?? 60),
    ], 429);
}

$input  = app_request_json();
$action = $input['action'] ?? $_POST['action'] ?? '';
$db     = DB::get();

switch ($action) {

    case 'login': {
        auth_require_csrf('login');
        auth_limit_or_fail('auth:login', 10, 300, 'login');

        $username = trim($input['username'] ?? $_POST['username'] ?? '');
        $password = $input['password'] ?? $_POST['password'] ?? '';

        if ($username === '' || $password === '') {
            app_security_log('auth_validation_failed', ['action' => 'login', 'reason' => 'empty_fields']);
            auth_json_response(['error' => 'Заполни все поля'], 422);
        }

        $stmt = $db->prepare('SELECT id, username, password_hash FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            app_security_log('auth_login_failed', ['username' => $username]);
            auth_json_response(['error' => 'Неверный логин или пароль'], 401);
        }

        // Update last_seen
        $upd = $db->prepare('UPDATE users SET last_seen = strftime(\'%s\',\'now\') WHERE id = ?');
        $upd->execute([$user['id']]);

        session_regenerate_id(true);
        $_SESSION['user_id']  = (int)$user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));

        auth_json_response([
            'success' => true,
            'username' => htmlspecialchars($user['username']),
            'csrfToken' => app_csrf_token(),
        ]);
    }

    case 'register': {
        auth_require_csrf('register');
        auth_limit_or_fail('auth:register', 5, 600, 'register');

        $username = trim($input['username'] ?? $_POST['username'] ?? '');
        $password = $input['password'] ?? $_POST['password'] ?? '';
        $confirm  = $input['confirm']  ?? $_POST['confirm']  ?? '';

        if ($username === '' || $password === '') {
            app_security_log('auth_validation_failed', ['action' => 'register', 'reason' => 'empty_fields']);
            auth_json_response(['error' => 'Заполни все поля'], 422);
        }
        if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
            app_security_log('auth_validation_failed', ['action' => 'register', 'reason' => 'bad_username', 'username' => $username]);
            auth_json_response(['error' => 'Логин: 3–20 символов, только буквы, цифры, _'], 422);
        }
        if (strlen($password) < 6) {
            app_security_log('auth_validation_failed', ['action' => 'register', 'reason' => 'short_password', 'username' => $username]);
            auth_json_response(['error' => 'Пароль минимум 6 символов'], 422);
        }
        if ($password !== $confirm) {
            app_security_log('auth_validation_failed', ['action' => 'register', 'reason' => 'password_mismatch', 'username' => $username]);
            auth_json_response(['error' => 'Пароли не совпадают'], 422);
        }

        // Check if username taken
        $check = $db->prepare('SELECT id FROM users WHERE username = ?');
        $check->execute([$username]);
        if ($check->fetch()) {
            app_security_log('auth_register_duplicate', ['username' => $username]);
            auth_json_response(['error' => 'Этот логин уже занят'], 409);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $ins  = $db->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        $ins->execute([$username, $hash]);
        $userId = (int)$db->lastInsertId();

        session_regenerate_id(true);
        $_SESSION['user_id']  = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));

        auth_json_response([
            'success' => true,
            'username' => htmlspecialchars($username),
            'csrfToken' => app_csrf_token(),
        ]);
    }

    case 'logout': {
        auth_require_csrf('logout');
        auth_limit_or_fail('auth:logout', 20, 300, 'logout', session_id() . '|' . app_client_ip());

        $_SESSION = [];
        session_destroy();
        auth_json_response(['success' => true]);
    }

    default:
        app_security_log('auth_unknown_action', ['action' => $action]);
        auth_json_response(['error' => 'Unknown action'], 400);
}
