<?php
declare(strict_types=1);

$finder = PhpCsFixer\Finder::create()
    ->in([
        __DIR__ . '/ajax',
        __DIR__ . '/bootstrap',
        __DIR__ . '/config',
        __DIR__ . '/src',
        __DIR__ . '/tests',
    ])
    ->append([
        __DIR__ . '/auth.php',
        __DIR__ . '/db.php',
        __DIR__ . '/dungeon.php',
        __DIR__ . '/game.php',
        __DIR__ . '/idle.php',
        __DIR__ . '/index.php',
        __DIR__ . '/leaderboard.php',
        __DIR__ . '/minigame.php',
        __DIR__ . '/profile.php',
        __DIR__ . '/security.php',
    ])
    ->name('*.php');

return (new PhpCsFixer\Config())
    ->setRiskyAllowed(false)
    ->setRules([
        '@PER-CS' => true,
        'array_syntax' => ['syntax' => 'short'],
        'no_unused_imports' => true,
        'single_quote' => true,
    ])
    ->setFinder($finder);
