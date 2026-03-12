<?php

declare(strict_types=1);

namespace App\Application\Auth;

use App\Infrastructure\Persistence\UserRepository;
use RuntimeException;

final class AuthService
{
    public function __construct(private readonly UserRepository $users) {}

    public function login(string $username, string $password): array
    {
        $username = trim($username);
        if ($username === '' || $password === '') {
            throw new RuntimeException('Заполни все поля');
        }

        $user = $this->users->findByUsername($username);
        if ($user === null || !password_verify($password, $user->passwordHash)) {
            throw new RuntimeException('Неверный логин или пароль');
        }

        $this->users->updateLastSeen($user->id);

        session_regenerate_id(true);
        $_SESSION['user_id'] = $user->id;
        $_SESSION['username'] = $user->username;
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));

        return [
            'username' => htmlspecialchars($user->username),
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
        if ($this->users->findByUsername($username) !== null) {
            throw new RuntimeException('Этот логин уже занят');
        }

        $user = $this->users->create($username, password_hash($password, PASSWORD_BCRYPT));

        session_regenerate_id(true);
        $_SESSION['user_id'] = $user->id;
        $_SESSION['username'] = $user->username;
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));

        return [
            'username' => htmlspecialchars($user->username),
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
