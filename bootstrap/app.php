<?php
declare(strict_types=1);

$autoloadPath = dirname(__DIR__) . '/vendor/autoload.php';
if (is_file($autoloadPath)) {
    require_once $autoloadPath;
}

if (!class_exists(\App\Bootstrap\AppBootstrap::class)) {
    require_once dirname(__DIR__) . '/src/Bootstrap/AppBootstrap.php';
}
