<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/app.php';

use App\Application\GameSave\GameSaveService;
use App\Http\ApiResponse;

\App\Bootstrap\AppBootstrap::bootApi();

if (!isset($_SESSION['user_id'])) {
    ApiResponse::error('Not authenticated', 401);
}

$userId = (int) $_SESSION['user_id'];
$username = (string) ($_SESSION['username'] ?? '');
$service = new GameSaveService(DB::get());
$method = $_SERVER['REQUEST_METHOD'];
$input = $method === 'POST' ? (app_request_json() ?: $_POST) : [];
$action = (string) ($input['action'] ?? $_GET['action'] ?? '');

function save_json(array $payload, int $status = 200): never
{
    ApiResponse::json($payload, $status);
}

function save_log_and_fail(string $event, string $message, int $status = 400, array $context = []): never
{
    app_security_log($event, array_merge(['endpoint' => 'save'], $context));
    save_json(['error' => $message], $status);
}

function save_require_csrf(string $action): void
{
    if (app_verify_csrf()) {
        return;
    }

    save_log_and_fail('csrf_failed', 'CSRF token invalid', 403, ['action' => $action]);
}

function save_rate_limit_or_fail(string $scope, int $limit, int $windowSeconds, string $action, string $identity): void
{
    $result = app_rate_limit($scope, $limit, $windowSeconds, $identity);
    if (($result['allowed'] ?? false) === true) {
        return;
    }

    save_log_and_fail('rate_limited', 'Слишком много запросов. Попробуй позже.', 429, [
        'action' => $action,
        'scope' => $scope,
        'retry_after' => (int) ($result['retry_after'] ?? 0),
    ]);
}

$identityBase = $userId . '|' . app_client_ip();

switch ($action) {
    case 'save': {
        if ($method !== 'POST') {
            save_json(['error' => 'Method not allowed'], 405);
        }

        save_require_csrf('save');
        save_rate_limit_or_fail('save:save', 120, 60, 'save', $identityBase);

        $rawData = $input['data'] ?? '';
        if (!is_string($rawData) || $rawData === '') {
            save_log_and_fail('malformed_save_payload', 'No data', 422, ['action' => 'save']);
        }

        $parsed = json_decode($rawData, true);
        if (!is_array($parsed)) {
            save_log_and_fail('malformed_save_payload', 'Invalid JSON', 422, ['action' => 'save']);
        }

        try {
            $existingRow = $service->readRow($userId);
            $existingData = $service->parseExisting($existingRow);
            $sanitized = $service->sanitizePayload($parsed, $existingData);

            $service->touchUser($userId);
            $service->upsertRow($userId, $sanitized);
            $accountLevel = $service->updateLeaderboard($userId, $username, $sanitized);

            ApiResponse::success(['accountLevel' => $accountLevel]);
        } catch (RuntimeException $e) {
            save_log_and_fail('save_failed', $e->getMessage(), 500, ['action' => 'save']);
        }
    }

    case 'load': {
        save_rate_limit_or_fail('save:load', 120, 60, 'load', $identityBase);
        ApiResponse::success($service->loadPayload($userId));
    }

    case 'buy_prestige': {
        if ($method !== 'POST') {
            save_json(['error' => 'Method not allowed'], 405);
        }

        save_require_csrf('buy_prestige');
        save_rate_limit_or_fail('save:buy_prestige', 30, 60, 'buy_prestige', $identityBase);

        $itemId = trim((string) ($input['id'] ?? ''));
        if ($itemId === '') {
            save_log_and_fail('prestige_buy_invalid', 'No item id', 422, ['action' => 'buy_prestige']);
        }

        try {
            ApiResponse::success($service->buyPrestige($userId, $username, $itemId));
        } catch (RuntimeException $e) {
            $message = $e->getMessage();
            $event = match ($message) {
                'No save found' => 'prestige_buy_missing_save',
                'Unknown item' => 'prestige_buy_invalid',
                default => 'prestige_buy_denied',
            };
            $status = match ($message) {
                'No save found' => 409,
                default => 422,
            };
            save_log_and_fail($event, $message, $status, ['item' => $itemId]);
        }
    }

    case 'minigame_reward': {
        if ($method !== 'POST') {
            save_json(['error' => 'Method not allowed'], 405);
        }

        save_require_csrf('minigame_reward');
        save_rate_limit_or_fail('save:minigame_reward', 20, 60, 'minigame_reward', $identityBase);

        $bugsRaw = (int) ($input['bugs'] ?? 0);
        $locRaw = (float) ($input['loc'] ?? 0);
        $ooRaw = (int) ($input['oo'] ?? 0);

        $bugs = max(0, min($bugsRaw, 100));
        $loc = max(0, min($locRaw, 10000));
        $oo = max(0, min($ooRaw, 1));

        if ($bugs !== $bugsRaw || $loc !== $locRaw || $oo !== $ooRaw) {
            app_security_log('reward_capped', [
                'action' => 'minigame_reward',
                'bugs_raw' => $bugsRaw,
                'loc_raw' => $locRaw,
                'oo_raw' => $ooRaw,
            ]);
        }

        ApiResponse::success($service->applyMinigameReward($userId, $username, $bugs, $loc, $oo));
    }

    case 'dungeon_clear': {
        if ($method !== 'POST') {
            save_json(['error' => 'Method not allowed'], 405);
        }

        save_require_csrf('dungeon_clear');
        save_rate_limit_or_fail('save:dungeon_clear', 10, 300, 'dungeon_clear', $identityBase);

        $locRaw = (float) ($input['loc'] ?? 0);
        $ooRaw = (int) ($input['oo'] ?? 0);
        $loc = max(0, min($locRaw, 500000));
        $oo = max(0, min($ooRaw, 3));

        if ($loc !== $locRaw || $oo !== $ooRaw) {
            app_security_log('reward_capped', [
                'action' => 'dungeon_clear',
                'loc_raw' => $locRaw,
                'oo_raw' => $ooRaw,
            ]);
        }

        ApiResponse::success($service->applyDungeonClear($userId, $username, $loc, $oo));
    }

    default:
        save_log_and_fail('save_unknown_action', 'Unknown action', 400, ['action' => $action]);
}
