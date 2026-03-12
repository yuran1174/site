<?php
declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\Auth\UserData;
use PDO;

final class UserRepository
{
    public function __construct(private readonly PDO $db)
    {
    }

    public function findMetaById(int $userId): ?array
    {
        $stmt = $this->db->prepare('SELECT created_at, last_seen FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $row = $stmt->fetch();

        return is_array($row) ? $row : null;
    }

    public function findByUsername(string $username): ?UserData
    {
        $stmt = $this->db->prepare('SELECT id, username, password_hash FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $row = $stmt->fetch();

        if (!is_array($row)) {
            return null;
        }

        return new UserData(
            (int) $row['id'],
            (string) $row['username'],
            (string) $row['password_hash'],
        );
    }

    public function create(string $username, string $passwordHash): UserData
    {
        $stmt = $this->db->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        $stmt->execute([$username, $passwordHash]);

        return new UserData(
            (int) $this->db->lastInsertId(),
            $username,
            $passwordHash,
        );
    }

    public function updateLastSeen(int $userId): void
    {
        $stmt = $this->db->prepare('UPDATE users SET last_seen = strftime(\'%s\',\'now\') WHERE id = ?');
        $stmt->execute([$userId]);
    }
}
