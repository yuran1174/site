<?php

declare(strict_types=1);

namespace App\Bootstrap;

final class Config
{
    private static array $items = [];
    private static bool $loaded = false;

    public static function load(string $rootPath): void
    {
        if (self::$loaded) {
            return;
        }

        $configDir = $rootPath . '/config';
        $paths = glob($configDir . '/*.php') ?: [];
        sort($paths);

        foreach ($paths as $path) {
            $file = pathinfo($path, PATHINFO_FILENAME);

            $config = require $path;
            if (is_array($config)) {
                self::$items[$file] = $config;
            }
        }

        self::$loaded = true;
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        $segments = explode('.', $key);
        $value = self::$items;

        foreach ($segments as $segment) {
            if (!is_array($value) || !array_key_exists($segment, $value)) {
                return $default;
            }
            $value = $value[$segment];
        }

        return $value;
    }
}
