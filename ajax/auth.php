<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/app.php';

use App\Application\Auth\AuthController;
use App\Application\Auth\AuthService;
use App\Infrastructure\Persistence\UserRepository;

\App\Bootstrap\AppBootstrap::bootApi();

$service = new AuthService(new UserRepository(DB::get()));
$controller = new AuthController($service);
$controller->handle($_SERVER['REQUEST_METHOD'], app_request_json(), $_POST, $_GET);
