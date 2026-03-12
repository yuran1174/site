<?php

declare(strict_types=1);

namespace App\Application\Auth;

use PDO;
use RuntimeException;

final class AuthService
{
    public function __construct(private readonly PDO $db) {}

    public function login(string $username, string $password): array
    {
        $username = trim($username);
        if ($username === '' || $password === '') {
            throw new RuntimeException('Заполни все поля');
        }

        $stmt = $this->db->prepare('SELECT id, username, password_hash FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            throw new RuntimeException('Неверный логин или пароль');
        }

        $this->db->prepare('UPDATE users SET last_seen = strftime(\'%s\',\'now\') WHERE id = ?')
            ->execute([$user['id']]);

        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));

        return [
            'username' => htmlspecialchars($user['username']),
            'csrfToken' => function_exists('app_csrf_token') ? app_csrf_token() : (string) $_SESSION['_csrf_token'],
        ];
    }

    public function register(string $username, string $password, string $confirm): array
    {
        $username = trim($username);

        if ($username === '' || $password === '') {
            throw new RuntimeException('Заполни все поля');
        }
        if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
            throw new RuntimeException('Логин: 3–20 символов, только буквы, цифры, _');
        }
        if (strlen($password) < 6) {
            throw new RuntimeException('Пароль минимум 6 символов');
        }
        if ($password !== $confirm) {
            throw new RuntimeException('Пароли не совпадают');
        }

        $check = $this->db->prepare('SELECT id FROM users WHERE username = ?');
        $check->execute([$username]);
        if ($check->fetch()) {
            throw new RuntimeException('Этот логин уже занят');
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $this->db->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        $stmt->execute([$username, $hash]);
        $userId = (int) $this->db->lastInsertId();

        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));

        return [
            'username' => htmlspecialchars($username),
            'csrfToken' => function_exists('app_csrf_token') ? app_csrf_token() : (string) $_SESSION['_csrf_token'],
        ];
    }

    public function logout(): void
    {
        $_SESSION = [];
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }
    }

    public function me(): array
    {
        return [
            'loggedIn' => isset($_SESSION['user_id']),
            'username' => htmlspecialchars($_SESSION['username'] ?? ''),
            'userId' => (int) ($_SESSION['user_id'] ?? 0),
            'csrfToken' => function_exists('app_csrf_token') ? app_csrf_token() : '',
        ];
    }
}
