<?php

declare(strict_types=1);

use App\Infrastructure\Database\DatabaseManager;

class DB
{
    public static function get(): PDO
    {
        return DatabaseManager::connection();
    }
}
