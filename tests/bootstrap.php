<?php

declare(strict_types=1);

$rootPath = dirname(__DIR__);
$autoloadPath = $rootPath . '/vendor/autoload.php';

if (is_file($autoloadPath)) {
    require_once $autoloadPath;
} else {
    spl_autoload_register(static function (string $class) use ($rootPath): void {
        $prefix = 'App\\';
        if (!str_starts_with($class, $prefix)) {
            return;
        }

        $path = $rootPath . '/src/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
        if (is_file($path)) {
            require_once $path;
        }
    });
}

require_once $rootPath . '/security.php';

$tmpRoot = $rootPath . '/storage/tmp';
if (!is_dir($tmpRoot)) {
    mkdir($tmpRoot, 0755, true);
}

$sessionPath = $tmpRoot . '/sessions';
if (!is_dir($sessionPath)) {
    mkdir($sessionPath, 0755, true);
}

ini_set('sys_temp_dir', $tmpRoot);
ini_set('session.save_path', $sessionPath);
