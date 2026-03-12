<?php

declare(strict_types=1);

namespace App\Application\GameSave;

use App\Http\ApiResponse;
use RuntimeException;

final class GameSaveController
{
    public function __construct(private readonly GameSaveService $service) {}

    public function handle(string $method, int $userId, string $username, array $input, array $get): never
    {
        $action = (string) ($input['action'] ?? $get['action'] ?? '');
        $identityBase = $userId . '|' . app_client_ip();

        switch ($action) {
            case 'save':
                if ($method !== 'POST') {
                    ApiResponse::error('Method not allowed', 405);
                }

                $this->requireCsrf('save');
                $this->rateLimitOrFail('save:save', 120, 60, 'save', $identityBase);

                $rawData = $input['data'] ?? '';
                if (!is_string($rawData) || $rawData === '') {
                    $this->logAndFail('malformed_save_payload', 'No data', 422, ['action' => 'save']);
                }

                $parsed = json_decode($rawData, true);
                if (!is_array($parsed)) {
                    $this->logAndFail('malformed_save_payload', 'Invalid JSON', 422, ['action' => 'save']);
                }

                try {
                    ApiResponse::success($this->service->save($userId, $username, $parsed));
                } catch (RuntimeException $e) {
                    $this->logAndFail('save_failed', $e->getMessage(), 500, ['action' => 'save']);
                }

            case 'load':
                $this->rateLimitOrFail('save:load', 120, 60, 'load', $identityBase);
                ApiResponse::success($this->service->loadPayload($userId));

                // no break
            case 'buy_prestige':
                if ($method !== 'POST') {
                    ApiResponse::error('Method not allowed', 405);
                }

                $this->requireCsrf('buy_prestige');
                $this->rateLimitOrFail('save:buy_prestige', 30, 60, 'buy_prestige', $identityBase);

                $itemId = trim((string) ($input['id'] ?? ''));
                if ($itemId === '') {
                    $this->logAndFail('prestige_buy_invalid', 'No item id', 422, ['action' => 'buy_prestige']);
                }

                try {
                    ApiResponse::success($this->service->buyPrestige($userId, $username, $itemId));
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
                    $this->logAndFail($event, $message, $status, ['item' => $itemId]);
                }

            case 'minigame_reward':
                if ($method !== 'POST') {
                    ApiResponse::error('Method not allowed', 405);
                }

                $this->requireCsrf('minigame_reward');
                $this->rateLimitOrFail('save:minigame_reward', 20, 60, 'minigame_reward', $identityBase);

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

                ApiResponse::success($this->service->applyMinigameReward($userId, $username, $bugs, $loc, $oo));

                // no break
            case 'dungeon_clear':
                if ($method !== 'POST') {
                    ApiResponse::error('Method not allowed', 405);
                }

                $this->requireCsrf('dungeon_clear');
                $this->rateLimitOrFail('save:dungeon_clear', 10, 300, 'dungeon_clear', $identityBase);

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

                ApiResponse::success($this->service->applyDungeonClear($userId, $username, $loc, $oo));

                // no break
            default:
                $this->logAndFail('save_unknown_action', 'Unknown action', 400, ['action' => $action]);
        }
    }

    private function requireCsrf(string $action): void
    {
        if (app_verify_csrf()) {
            return;
        }

        $this->logAndFail('csrf_failed', 'CSRF token invalid', 403, ['action' => $action]);
    }

    private function rateLimitOrFail(string $scope, int $limit, int $windowSeconds, string $action, string $identity): void
    {
        $result = app_rate_limit($scope, $limit, $windowSeconds, $identity);
        if (($result['allowed'] ?? false) === true) {
            return;
        }

        $this->logAndFail('rate_limited', 'Слишком много запросов. Попробуй позже.', 429, [
            'action' => $action,
            'scope' => $scope,
            'retry_after' => (int) ($result['retry_after'] ?? 0),
        ]);
    }

    private function logAndFail(string $event, string $message, int $status = 400, array $context = []): never
    {
        app_security_log($event, array_merge(['endpoint' => 'save'], $context));
        ApiResponse::error($message, $status);
    }
}
