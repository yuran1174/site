<?php

declare(strict_types=1);

namespace App\Bootstrap;

final class AppBootstrap
{
    private static bool $initialized = false;
    private static string $projectRoot = '';

    public static function boot(): void
    {
        self::bootPage();
    }

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

        Environment::load(self::$projectRoot);
        Config::load(self::$projectRoot);

        require_once self::$projectRoot . '/security.php';

        error_reporting(E_ALL);
        ini_set('display_errors', Config::get('app.display_errors', false) ? '1' : '0');
        ini_set('log_errors', Config::get('app.log_errors', true) ? '1' : '0');

        $timezone = (string) Config::get('app.timezone', 'Europe/Moscow');
        if ($timezone !== '') {
            date_default_timezone_set($timezone);
        }

        self::$initialized = true;
    }
}
