<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/app.php';

use App\Application\Auth\AuthService;
use App\Http\ApiResponse;

\App\Bootstrap\AppBootstrap::bootApi();

function auth_json_response(array $payload, int $status = 200): never
{
    ApiResponse::json($payload, $status);
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
        'retryAfter' => (int) ($result['retry_after'] ?? 60),
    ], 429);
}

$service = new AuthService(DB::get());

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    if ($action === 'me') {
        auth_json_response($service->me());
    }

    http_response_code(405);
    auth_json_response(['error' => 'Method not allowed'], 405);
}

$input = app_request_json();
$action = $input['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'login': {
        auth_require_csrf('login');
        auth_limit_or_fail('auth:login', 10, 300, 'login');

        try {
            ApiResponse::success($service->login(
                (string) ($input['username'] ?? $_POST['username'] ?? ''),
                (string) ($input['password'] ?? $_POST['password'] ?? '')
            ));
        } catch (RuntimeException $e) {
            $message = $e->getMessage();
            $status = $message === 'Неверный логин или пароль' ? 401 : 422;
            $reason = $message === 'Заполни все поля' ? 'empty_fields' : 'invalid_credentials';
            app_security_log($message === 'Неверный логин или пароль' ? 'auth_login_failed' : 'auth_validation_failed', [
                'action' => 'login',
                'reason' => $reason,
                'username' => (string) ($input['username'] ?? $_POST['username'] ?? ''),
            ]);
            ApiResponse::error($message, $status);
        }
    }

    case 'register': {
        auth_require_csrf('register');
        auth_limit_or_fail('auth:register', 5, 600, 'register');

        try {
            ApiResponse::success($service->register(
                (string) ($input['username'] ?? $_POST['username'] ?? ''),
                (string) ($input['password'] ?? $_POST['password'] ?? ''),
                (string) ($input['confirm'] ?? $_POST['confirm'] ?? '')
            ));
        } catch (RuntimeException $e) {
            $message = $e->getMessage();
            $username = (string) ($input['username'] ?? $_POST['username'] ?? '');
            $status = match ($message) {
                'Этот логин уже занят' => 409,
                default => 422,
            };
            $event = $message === 'Этот логин уже занят' ? 'auth_register_duplicate' : 'auth_validation_failed';
            app_security_log($event, [
                'action' => 'register',
                'username' => $username,
                'reason' => match ($message) {
                    'Заполни все поля' => 'empty_fields',
                    'Логин: 3–20 символов, только буквы, цифры, _' => 'bad_username',
                    'Пароль минимум 6 символов' => 'short_password',
                    'Пароли не совпадают' => 'password_mismatch',
                    default => 'duplicate_username',
                },
            ]);
            ApiResponse::error($message, $status);
        }
    }

    case 'logout': {
        auth_require_csrf('logout');
        auth_limit_or_fail('auth:logout', 20, 300, 'logout', session_id() . '|' . app_client_ip());
        $service->logout();
        ApiResponse::success();
    }

    default:
        app_security_log('auth_unknown_action', ['action' => $action]);
        ApiResponse::error('Unknown action', 400);
}
