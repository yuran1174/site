<?php
declare(strict_types=1);

namespace App\Infrastructure\Database;

use App\Bootstrap\Config;
use PDO;

final class DatabaseManager
{
    private static ?PDO $connection = null;

    public static function connection(): PDO
    {
        if (self::$connection !== null) {
            return self::$connection;
        }

        $rootPath = dirname(__DIR__, 3);
        $relativePath = (string) Config::get('database.path', 'db/game.sqlite');
        $databasePath = $rootPath . '/' . ltrim(str_replace('\\', '/', $relativePath), '/');
        $directory = dirname($databasePath);

        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        self::$connection = new PDO('sqlite:' . $databasePath);
        self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        SchemaInitializer::initialize(self::$connection);

        return self::$connection;
    }
}
