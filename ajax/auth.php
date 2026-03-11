<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

// Handle GET logout redirect
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    if ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        header('Location: ../idle.php');
        exit;
    }
    if ($action === 'me') {
        echo json_encode([
            'loggedIn'  => isset($_SESSION['user_id']),
            'username'  => htmlspecialchars($_SESSION['username'] ?? ''),
            'userId'    => (int)($_SESSION['user_id'] ?? 0),
        ]);
        exit;
    }
    echo json_encode(['error' => 'Bad request']);
    exit;
}

// POST handlers
$input  = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? $_POST['action'] ?? '';
$db     = DB::get();

switch ($action) {

    case 'login': {
        $username = trim($input['username'] ?? $_POST['username'] ?? '');
        $password = $input['password'] ?? $_POST['password'] ?? '';

        if ($username === '' || $password === '') {
            echo json_encode(['error' => 'Заполни все поля']);
            exit;
        }

        $stmt = $db->prepare('SELECT id, username, password_hash FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            echo json_encode(['error' => 'Неверный логин или пароль']);
            exit;
        }

        // Update last_seen
        $upd = $db->prepare('UPDATE users SET last_seen = strftime(\'%s\',\'now\') WHERE id = ?');
        $upd->execute([$user['id']]);

        session_regenerate_id(true);
        $_SESSION['user_id']  = (int)$user['id'];
        $_SESSION['username'] = $user['username'];

        echo json_encode(['success' => true, 'username' => htmlspecialchars($user['username'])]);
        exit;
    }

    case 'register': {
        $username = trim($input['username'] ?? $_POST['username'] ?? '');
        $password = $input['password'] ?? $_POST['password'] ?? '';
        $confirm  = $input['confirm']  ?? $_POST['confirm']  ?? '';

        if ($username === '' || $password === '') {
            echo json_encode(['error' => 'Заполни все поля']);
            exit;
        }
        if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
            echo json_encode(['error' => 'Логин: 3–20 символов, только буквы, цифры, _']);
            exit;
        }
        if (strlen($password) < 6) {
            echo json_encode(['error' => 'Пароль минимум 6 символов']);
            exit;
        }
        if ($password !== $confirm) {
            echo json_encode(['error' => 'Пароли не совпадают']);
            exit;
        }

        // Check if username taken
        $check = $db->prepare('SELECT id FROM users WHERE username = ?');
        $check->execute([$username]);
        if ($check->fetch()) {
            echo json_encode(['error' => 'Этот логин уже занят']);
            exit;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $ins  = $db->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        $ins->execute([$username, $hash]);
        $userId = (int)$db->lastInsertId();

        session_regenerate_id(true);
        $_SESSION['user_id']  = $userId;
        $_SESSION['username'] = $username;

        echo json_encode(['success' => true, 'username' => htmlspecialchars($username)]);
        exit;
    }

    case 'logout': {
        $_SESSION = [];
        session_destroy();
        echo json_encode(['success' => true]);
        exit;
    }

    default:
        echo json_encode(['error' => 'Unknown action']);
        exit;
}
