<?php
declare(strict_types=1);

namespace App\Domain\Leaderboard;

final class LeaderboardRecord
{
    public function __construct(
        public readonly int $userId,
        public readonly int $accountLevel,
        public readonly int $dungeonClears,
    ) {
    }
}
