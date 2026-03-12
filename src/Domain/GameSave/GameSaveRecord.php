<?php
declare(strict_types=1);

namespace App\Domain\GameSave;

final class GameSaveRecord
{
    public function __construct(
        public readonly int $userId,
        public readonly string $saveData,
        public readonly int $updatedAt,
    ) {
    }
}
