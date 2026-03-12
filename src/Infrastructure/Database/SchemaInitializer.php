<?php

declare(strict_types=1);

namespace App\Infrastructure\Database;

use App\Bootstrap\Config;
use PDO;

final class SchemaInitializer
{
    public static function initialize(PDO $db): void
    {
        $rootPath = dirname(__DIR__, 3);
        $migrationsPath = (string) Config::get('database.migrations_path', 'migrations');
        $resolvedPath = $rootPath . '/' . ltrim(str_replace('\\', '/', $migrationsPath), '/');

        $runner = new MigrationRunner($db, $resolvedPath);
        $runner->migrate();
    }
}
