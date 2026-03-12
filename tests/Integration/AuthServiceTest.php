<?php

declare(strict_types=1);

namespace Tests\Integration;

use App\Application\Auth\AuthService;
use App\Infrastructure\Persistence\UserRepository;
use RuntimeException;
use Tests\Support\DatabaseTestCase;

final class AuthServiceTest extends DatabaseTestCase
{
    public function testRegisterCreatesUserAndSession(): void
    {
        $service = new AuthService(new UserRepository($this->db));

        $result = $service->register('tester_1', 'secret123', 'secret123');

        self::assertSame('tester_1', html_entity_decode($result['username']));
        self::assertSame('tester_1', $_SESSION['username'] ?? null);
        self::assertNotEmpty($_SESSION['_csrf_token'] ?? '');

        $user = $this->db->query('SELECT username FROM users')->fetch();
        self::assertSame('tester_1', $user['username']);
    }

    public function testRegisterRejectsDuplicateUsername(): void
    {
        $hash = password_hash('secret123', PASSWORD_BCRYPT);
        $stmt = $this->db->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        $stmt->execute(['taken_name', $hash]);

        $service = new AuthService(new UserRepository($this->db));

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Этот логин уже занят');
        $service->register('taken_name', 'secret123', 'secret123');
    }

    public function testLoginStartsSessionForExistingUser(): void
    {
        $hash = password_hash('secret123', PASSWORD_BCRYPT);
        $stmt = $this->db->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        $stmt->execute(['tester_2', $hash]);

        $service = new AuthService(new UserRepository($this->db));
        $result = $service->login('tester_2', 'secret123');

        self::assertSame('tester_2', html_entity_decode($result['username']));
        self::assertSame('tester_2', $_SESSION['username'] ?? null);
        self::assertGreaterThan(0, (int) ($_SESSION['user_id'] ?? 0));
    }

    public function testLoginRejectsWrongPassword(): void
    {
        $hash = password_hash('secret123', PASSWORD_BCRYPT);
        $stmt = $this->db->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        $stmt->execute(['tester_3', $hash]);

        $service = new AuthService(new UserRepository($this->db));

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Неверный логин или пароль');
        $service->login('tester_3', 'wrong-pass');
    }

    public function testLogoutClearsSession(): void
    {
        $_SESSION['user_id'] = 77;
        $_SESSION['username'] = 'tester_4';

        $service = new AuthService(new UserRepository($this->db));
        $service->logout();

        self::assertSame([], $_SESSION);
    }
}
