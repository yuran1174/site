<?php
declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\GameSave\GameSaveRecord;
use PDO;

final class GameSaveRepository
{
    public function __construct(private readonly PDO $db)
    {
    }

    public function findByUserId(int $userId): ?GameSaveRecord
    {
        $stmt = $this->db->prepare('SELECT save_data, updated_at FROM game_saves WHERE user_id = ?');
        $stmt->execute([$userId]);
        $row = $stmt->fetch();

        if (!is_array($row)) {
            return null;
        }

        return new GameSaveRecord(
            $userId,
            (string) $row['save_data'],
            (int) ($row['updated_at'] ?? 0),
        );
    }

    public function upsert(int $userId, string $saveData): void
    {
        $stmt = $this->db->prepare('
            INSERT INTO game_saves (user_id, save_data, updated_at)
            VALUES (?, ?, strftime(\'%s\',\'now\'))
            ON CONFLICT(user_id) DO UPDATE SET
                save_data  = excluded.save_data,
                updated_at = excluded.updated_at
        ');
        $stmt->execute([$userId, $saveData]);
    }
}
