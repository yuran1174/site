<?php
declare(strict_types=1);

$autoloadPath = dirname(__DIR__) . '/vendor/autoload.php';
if (is_file($autoloadPath)) {
    require_once $autoloadPath;
} else {
    spl_autoload_register(static function (string $class): void {
        $prefix = 'App\\';
        if (!str_starts_with($class, $prefix)) {
            return;
        }

        $path = dirname(__DIR__) . '/src/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
        if (is_file($path)) {
            require_once $path;
        }
    });
}

if (!class_exists(\App\Bootstrap\AppBootstrap::class)) {
    require_once dirname(__DIR__) . '/src/Bootstrap/AppBootstrap.php';
}
