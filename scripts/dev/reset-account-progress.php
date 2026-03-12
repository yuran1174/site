<?php

declare(strict_types=1);

use App\Infrastructure\Database\DatabaseManager;
use App\Infrastructure\Persistence\GameSaveRepository;
use App\Infrastructure\Persistence\LeaderboardRepository;
use App\Infrastructure\Persistence\UserRepository;

require_once dirname(__DIR__, 2) . '/bootstrap/app.php';

$options = getopt('', ['username:', 'user-id:', 'help']);

if (isset($options['help'])) {
    printUsage();
    exit(0);
}

$username = isset($options['username']) ? trim((string) $options['username']) : '';
$userIdOption = isset($options['user-id']) ? (int) $options['user-id'] : 0;

if ($username === '' && $userIdOption <= 0) {
    fwrite(STDERR, "[reset-account] Укажи --username=<login> или --user-id=<id>.\n\n");
    printUsage();
    exit(1);
}

$db = DatabaseManager::connection();
$users = new UserRepository($db);
$saves = new GameSaveRepository($db);
$leaderboard = new LeaderboardRepository($db);

$targetUserId = $userIdOption;
$targetUsername = $username;

if ($targetUserId > 0) {
    if ($targetUsername === '') {
        $stmt = $db->prepare('SELECT username FROM users WHERE id = ?');
        $stmt->execute([$targetUserId]);
        $row = $stmt->fetch();

        if (!is_array($row)) {
            fwrite(STDERR, "[reset-account] Пользователь с id {$targetUserId} не найден.\n");
            exit(1);
        }

        $targetUsername = (string) $row['username'];
    }
} else {
    $user = $users->findByUsername($targetUsername);
    if ($user === null) {
        fwrite(STDERR, "[reset-account] Пользователь '{$targetUsername}' не найден.\n");
        exit(1);
    }

    $targetUserId = $user->id;
    $targetUsername = $user->username;
}

$saveExists = $saves->findByUserId($targetUserId) !== null;
$leaderboardExists = $leaderboard->findByUserId($targetUserId) !== null;

$saves->deleteByUserId($targetUserId);
$leaderboard->deleteByUserId($targetUserId);

fwrite(STDOUT, "[reset-account] Сброшен серверный прогресс аккаунта '{$targetUsername}' (id {$targetUserId}).\n");
fwrite(
    STDOUT,
    sprintf(
        "[reset-account] Удалено: save=%s, leaderboard=%s.\n",
        $saveExists ? 'yes' : 'no',
        $leaderboardExists ? 'yes' : 'no',
    ),
);
fwrite(
    STDOUT,
    "[reset-account] Важно: очисти localStorage в браузере (ключ 'kodikofee_save'), иначе клиент может снова отправить старый прогресс на сервер.\n",
);

function printUsage(): void
{
    fwrite(STDOUT, "Сброс прогресса аккаунта в dev-режиме.\n");
    fwrite(STDOUT, "Примеры:\n");
    fwrite(STDOUT, "  composer dev:reset-account -- --username=tester\n");
    fwrite(STDOUT, "  composer dev:reset-account -- --user-id=1\n");
}
