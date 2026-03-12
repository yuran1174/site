<?php
declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\Leaderboard\LeaderboardRecord;
use PDO;

final class LeaderboardRepository
{
    public function __construct(private readonly PDO $db)
    {
    }

    public function findByUserId(int $userId): ?LeaderboardRecord
    {
        $stmt = $this->db->prepare('SELECT account_level, dungeon_clears FROM leaderboard WHERE user_id = ?');
        $stmt->execute([$userId]);
        $row = $stmt->fetch();

        if (!is_array($row)) {
            return null;
        }

        return new LeaderboardRecord(
            $userId,
            (int) ($row['account_level'] ?? 1),
            (int) ($row['dungeon_clears'] ?? 0),
        );
    }

    public function upsert(
        int $userId,
        string $username,
        float $totalLoc,
        int $prestigeCount,
        int $accountLevel,
        int $dungeonClears,
    ): void {
        $stmt = $this->db->prepare('
            INSERT INTO leaderboard (user_id, username, total_loc, prestige_count, account_level, dungeon_clears, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, strftime(\'%s\',\'now\'))
            ON CONFLICT(user_id) DO UPDATE SET
                username       = excluded.username,
                total_loc      = excluded.total_loc,
                prestige_count = excluded.prestige_count,
                account_level  = excluded.account_level,
                dungeon_clears = excluded.dungeon_clears,
                updated_at     = excluded.updated_at
        ');
        $stmt->execute([$userId, $username, $totalLoc, $prestigeCount, $accountLevel, $dungeonClears]);
    }
}
