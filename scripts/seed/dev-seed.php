<?php

declare(strict_types=1);

$rootPath = dirname(__DIR__, 2);
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

use App\Application\GameSave\GameSaveService;
use App\Infrastructure\Database\SchemaInitializer;
use App\Infrastructure\Persistence\GameSaveRepository;
use App\Infrastructure\Persistence\LeaderboardRepository;
use App\Infrastructure\Persistence\UserRepository;

$dbPath = 'db/game.sqlite';
foreach (array_slice($argv, 1) as $argument) {
    if (str_starts_with($argument, '--db=')) {
        $dbPath = substr($argument, 5);
    }
}

$databasePath = $rootPath . '/' . ltrim(str_replace('\\', '/', $dbPath), '/');
$databaseDir = dirname($databasePath);
if (!is_dir($databaseDir)) {
    mkdir($databaseDir, 0755, true);
}

$pdo = new PDO('sqlite:' . $databasePath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
SchemaInitializer::initialize($pdo);

$service = new GameSaveService(
    new GameSaveRepository($pdo),
    new LeaderboardRepository($pdo),
    new UserRepository($pdo),
);

$profilesPath = $rootPath . '/storage/seed/profiles/*.json';
$profiles = glob($profilesPath);
if ($profiles === false || $profiles === []) {
    throw new RuntimeException('Seed profiles not found');
}

$pdo->beginTransaction();

foreach ($profiles as $profilePath) {
    $raw = file_get_contents($profilePath);
    if ($raw === false) {
        throw new RuntimeException('Cannot read seed profile: ' . basename($profilePath));
    }

    $profile = json_decode($raw, true);
    if (!is_array($profile)) {
        throw new RuntimeException('Invalid seed profile JSON: ' . basename($profilePath));
    }

    $username = trim((string) ($profile['username'] ?? ''));
    $password = (string) ($profile['password'] ?? 'devpass123');
    $save = is_array($profile['save'] ?? null) ? $profile['save'] : [];

    if ($username === '') {
        throw new RuntimeException('Seed profile must contain username: ' . basename($profilePath));
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $existingId = $stmt->fetchColumn();
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    if ($existingId === false) {
        $insert = $pdo->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        $insert->execute([$username, $passwordHash]);
        $userId = (int) $pdo->lastInsertId();
    } else {
        $userId = (int) $existingId;
        $update = $pdo->prepare(
            'UPDATE users SET password_hash = ?, last_seen = strftime(\'%s\',\'now\') WHERE id = ?'
        );
        $update->execute([$passwordHash, $userId]);
    }

    $payload = array_replace_recursive($service->defaultData(), $save);
    $existing = $service->parseExisting($service->readRow($userId));
    $sanitized = $service->sanitizePayload($payload, $existing);

    $service->upsertRow($userId, $sanitized);
    $service->updateLeaderboard($userId, $username, $sanitized);
    $service->touchUser($userId);
}

$pdo->commit();

echo 'Seeded ' . count($profiles) . ' profiles into ' . $dbPath . PHP_EOL;
