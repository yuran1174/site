<?php
declare(strict_types=1);

namespace App\Domain\Auth;

final class UserData
{
    public function __construct(
        public readonly int $id,
        public readonly string $username,
        public readonly string $passwordHash,
    ) {
    }
}
