<?php
declare(strict_types=1);

namespace App\Bootstrap;

final class AppBootstrap
{
    private static bool $initialized = false;
    private static string $projectRoot = '';

    public static function bootPage(): void
    {
        self::initialize();
    }

    public static function bootWeb(): void
    {
        self::initialize();
        app_start_session();
    }

    public static function bootApi(): void
    {
        self::initialize();
        app_start_session();
        header('Content-Type: application/json; charset=utf-8');
    }

    public static function projectRoot(): string
    {
        self::initialize();
        return self::$projectRoot;
    }

    private static function initialize(): void
    {
        if (self::$initialized) {
            return;
        }

        self::$projectRoot = dirname(__DIR__, 2);

        require_once self::$projectRoot . '/security.php';
        require_once self::$projectRoot . '/db.php';

        error_reporting(E_ALL);
        ini_set('display_errors', '0');
        ini_set('log_errors', '1');

        self::$initialized = true;
    }
}
