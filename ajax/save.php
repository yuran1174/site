<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/app.php';

use App\Application\GameSave\GameSaveController;
use App\Application\GameSave\GameSaveService;
use App\Http\ApiResponse;
use App\Infrastructure\Database\DatabaseManager;
use App\Infrastructure\Persistence\GameSaveRepository;
use App\Infrastructure\Persistence\LeaderboardRepository;
use App\Infrastructure\Persistence\UserRepository;

\App\Bootstrap\AppBootstrap::bootApi();

if (!isset($_SESSION['user_id'])) {
    ApiResponse::error('Not authenticated', 401);
}

$connection = DatabaseManager::connection();
$service = new GameSaveService(
    new GameSaveRepository($connection),
    new LeaderboardRepository($connection),
    new UserRepository($connection),
);

$controller = new GameSaveController($service);
$controller->handle(
    $_SERVER['REQUEST_METHOD'],
    (int) $_SESSION['user_id'],
    (string) ($_SESSION['username'] ?? ''),
    $_SERVER['REQUEST_METHOD'] === 'POST' ? (app_request_json() ?: $_POST) : [],
    $_GET,
);
