<?php
declare(strict_types=1);

namespace App\Bootstrap;

final class AppBootstrap
{
    private static bool $booted = false;

    public static function boot(bool $startSession = true): void
    {
        if (!self::$booted) {
            $rootPath = dirname(__DIR__, 2);
            Environment::load($rootPath);
            Config::load($rootPath);
            date_default_timezone_set((string) Config::get('app.timezone', 'Europe/Moscow'));
            self::$booted = true;
        }

        if ($startSession) {
            self::startSession();
        }
    }

    private static function startSession(): void
    {
        if (function_exists('app_start_session')) {
            app_start_session();
            return;
        }

        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }
    }
}
