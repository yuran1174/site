<?php

declare(strict_types=1);

$root = dirname(__DIR__, 2);
$targets = [
    $root . '/ajax',
    $root . '/bootstrap',
    $root . '/config',
    $root . '/src',
    $root . '/tests',
    $root . '/auth.php',
    $root . '/db.php',
    $root . '/dungeon.php',
    $root . '/game.php',
    $root . '/idle.php',
    $root . '/index.php',
    $root . '/leaderboard.php',
    $root . '/minigame.php',
    $root . '/profile.php',
    $root . '/security.php',
];

$files = [];
foreach ($targets as $target) {
    if (is_dir($target)) {
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($target));
        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getExtension() === 'php') {
                $files[] = $file->getPathname();
            }
        }
        continue;
    }

    if (is_file($target)) {
        $files[] = $target;
    }
}

sort($files);
$failed = false;

foreach ($files as $file) {
    $command = escapeshellarg(PHP_BINARY) . ' -l ' . escapeshellarg($file);
    exec($command, $output, $exitCode);
    if ($exitCode !== 0) {
        $failed = true;
        fwrite(STDERR, implode(PHP_EOL, $output) . PHP_EOL);
    }
}

if ($failed) {
    exit(1);
}

fwrite(STDOUT, 'PHP lint passed for ' . count($files) . ' files.' . PHP_EOL);
