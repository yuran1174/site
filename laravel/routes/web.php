<?php

use App\Http\Controllers\Legacy\AuthApiController;
use App\Http\Controllers\Legacy\AuthPageController;
use App\Http\Controllers\Legacy\DungeonPageController;
use App\Http\Controllers\Legacy\GamePageController;
use App\Http\Controllers\Legacy\IdlePageController;
use App\Http\Controllers\Legacy\LandingPageController;
use App\Http\Controllers\Legacy\LeaderboardPageController;
use App\Http\Controllers\Legacy\MinigamePageController;
use App\Http\Controllers\Legacy\PageController;
use App\Http\Controllers\Legacy\ProfilePageController;
use App\Http\Controllers\Legacy\SaveApiController;
use App\Http\Controllers\Legacy\SeasonOnePageController;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingPageController::class);
Route::get('/index.php', LandingPageController::class);
Route::get('/auth.php', AuthPageController::class);
Route::get('/idle.php', IdlePageController::class);
Route::get('/profile.php', ProfilePageController::class);
Route::get('/leaderboard.php', LeaderboardPageController::class);
Route::get('/game.php', GamePageController::class);
Route::get('/dungeon.php', DungeonPageController::class);
Route::get('/minigame.php', MinigamePageController::class);
Route::get('/season1.php', SeasonOnePageController::class);

Route::middleware([
    'legacy.compat',
    'legacy.action',
    'legacy.csrf',
    'legacy.throttle',
    'legacy.validate',
])->match(['GET', 'POST'], '/ajax/auth.php', AuthApiController::class);

Route::middleware([
    'legacy.compat:legacy-runtime',
    'legacy.action',
    'legacy.auth',
    'legacy.csrf',
    'legacy.throttle',
    'legacy.validate',
])->match(['GET', 'POST'], '/ajax/save.php', SaveApiController::class);
