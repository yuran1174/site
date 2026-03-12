<?php

declare(strict_types=1);

namespace App\Application\GameSave;

use App\Domain\GameSave\GameSaveRecord;
use App\Domain\Leaderboard\LeaderboardRecord;
use App\Infrastructure\Persistence\GameSaveRepository;
use App\Infrastructure\Persistence\LeaderboardRepository;
use App\Infrastructure\Persistence\UserRepository;
use RuntimeException;

final class GameSaveService
{
    private const PRESTIGE_SHOP_ITEMS = [
        'coffee_iv' => ['cost' => 1, 'maxLevel' => 5],
        'veteran' => ['cost' => 2, 'maxLevel' => 1],
        'discount' => ['cost' => 3, 'maxLevel' => 3],
        'automator' => ['cost' => 4, 'maxLevel' => 1],
        'legacy' => ['cost' => 5, 'maxLevel' => 1, 'requiresPrestige' => 3],
        'ai_assist' => ['cost' => 8, 'maxLevel' => 1, 'requiresPrestige' => 5],
        'offline_boost' => ['cost' => 2, 'maxLevel' => 3],
        'event_luck' => ['cost' => 3, 'maxLevel' => 2],
    ];

    public function __construct(
        private readonly GameSaveRepository $gameSaves,
        private readonly LeaderboardRepository $leaderboard,
        private readonly UserRepository $users,
    ) {}

    public function readRow(int $userId): ?GameSaveRecord
    {
        return $this->gameSaves->findByUserId($userId);
    }

    public function defaultData(): array
    {
        return [
            'loc' => 0.0,
            'totalLoc' => 0.0,
            'locThisRun' => 0.0,
            'totalClicks' => 0,
            'buildings' => [],
            'upgrades' => [],
            'achievements' => [],
            'prestige' => 0,
            'prestigeMulti' => 1.0,
            'prestigePoints' => 0,
            'totalPrestigePoints' => 0,
            'prestigeShop' => [],
            'eventCount' => 0,
            'maxOffline' => 0,
            'story' => [],
            'dungeonClears' => 0,
            'lastSave' => $this->nowMs(),
            'version' => 3,
        ];
    }

    public function parseExisting(?GameSaveRecord $row): array
    {
        if ($row === null) {
            return $this->defaultData();
        }

        $decoded = json_decode($row->saveData, true);
        return is_array($decoded) ? $decoded : $this->defaultData();
    }

    public function save(int $userId, string $username, array $parsed): array
    {
        $existingRow = $this->readRow($userId);
        $existingData = $this->parseExisting($existingRow);
        $sanitized = $this->sanitizePayload($parsed, $existingData);

        $this->touchUser($userId);
        $this->upsertRow($userId, $sanitized);
        $accountLevel = $this->updateLeaderboard($userId, $username, $sanitized);

        return ['accountLevel' => $accountLevel];
    }

    public function sanitizePayload(array $parsed, array $existing): array
    {
        $clean = $this->defaultData();

        $clean['loc'] = $this->floatValue($parsed['loc'] ?? 0, 0, 1.0e18);
        $clean['totalLoc'] = $this->floatValue($parsed['totalLoc'] ?? 0, 0, 1.0e18);
        $clean['locThisRun'] = $this->floatValue($parsed['locThisRun'] ?? 0, 0, 1.0e18);
        $clean['totalClicks'] = $this->intValue($parsed['totalClicks'] ?? 0, 0, 1000000000);
        $clean['buildings'] = $this->intMap($parsed['buildings'] ?? [], 64, 1000000);
        $clean['upgrades'] = $this->boolMap($parsed['upgrades'] ?? [], 256);
        $clean['achievements'] = $this->boolMap($parsed['achievements'] ?? [], 512);
        $clean['prestige'] = $this->intValue($parsed['prestige'] ?? 0, 0, 1000);
        $clean['prestigeMulti'] = round((float) pow(1.5, $clean['prestige']), 8);
        $clean['prestigePoints'] = $this->intValue($parsed['prestigePoints'] ?? 0, 0, 100000);
        $clean['totalPrestigePoints'] = $this->intValue($parsed['totalPrestigePoints'] ?? 0, 0, 100000);
        $clean['prestigeShop'] = $this->normalizePrestigeShop($parsed['prestigeShop'] ?? []);
        $clean['eventCount'] = $this->intValue($parsed['eventCount'] ?? 0, 0, 1000000);
        $clean['maxOffline'] = $this->intValue($parsed['maxOffline'] ?? 0, 0, 86400);
        $clean['story'] = $this->boolMap($parsed['story'] ?? [], 128);
        $clean['dungeonClears'] = $this->intValue($parsed['dungeonClears'] ?? 0, 0, 10000);
        $clean['lastSave'] = $this->intValue($parsed['lastSave'] ?? $this->nowMs(), 0, $this->nowMs() + 300000);
        $clean['version'] = $this->intValue($parsed['version'] ?? 3, 1, 999);

        if ($clean['loc'] > $clean['totalLoc']) {
            $clean['loc'] = $clean['totalLoc'];
        }
        if ($clean['locThisRun'] > $clean['totalLoc']) {
            $clean['locThisRun'] = $clean['totalLoc'];
        }

        $allowedMaxOffline = $this->allowedMaxOfflineSeconds($clean['prestigeShop']);
        if ($clean['maxOffline'] > $allowedMaxOffline) {
            $this->securityLog('suspicious_save_max_offline', [
                'incoming' => $clean['maxOffline'],
                'allowed' => $allowedMaxOffline,
            ]);
            $clean['maxOffline'] = $allowedMaxOffline;
        }

        $existingPrestige = $this->intValue($existing['prestige'] ?? 0, 0, 1000);
        if ($clean['prestige'] > $existingPrestige + 3) {
            $this->securityLog('suspicious_save_prestige_jump', [
                'existing' => $existingPrestige,
                'incoming' => $clean['prestige'],
            ]);
            $clean['prestige'] = $existingPrestige + 3;
            $clean['prestigeMulti'] = round((float) pow(1.5, $clean['prestige']), 8);
        }

        $existingDungeonClears = $this->intValue($existing['dungeonClears'] ?? 0, 0, 10000);
        if ($clean['dungeonClears'] > $existingDungeonClears + 3) {
            $this->securityLog('suspicious_save_dungeon_jump', [
                'existing' => $existingDungeonClears,
                'incoming' => $clean['dungeonClears'],
            ]);
            $clean['dungeonClears'] = $existingDungeonClears + 3;
        }

        $existingTotalOo = $this->intValue($existing['totalPrestigePoints'] ?? 0, 0, 100000);
        if ($clean['totalPrestigePoints'] > $existingTotalOo + 100) {
            $this->securityLog('suspicious_save_oo_jump', [
                'existing' => $existingTotalOo,
                'incoming' => $clean['totalPrestigePoints'],
            ]);
            $clean['totalPrestigePoints'] = $existingTotalOo + 100;
        }

        if ($clean['prestigePoints'] > $clean['totalPrestigePoints']) {
            $this->securityLog('suspicious_save_prestige_points_balance', [
                'prestigePoints' => $clean['prestigePoints'],
                'totalPrestigePoints' => $clean['totalPrestigePoints'],
            ]);
            $clean['prestigePoints'] = $clean['totalPrestigePoints'];
        }

        return $this->reconcileWithExisting($clean, $existing);
    }

    public function upsertRow(int $userId, array $saveData): void
    {
        $json = json_encode($saveData, JSON_UNESCAPED_UNICODE);
        if ($json === false) {
            throw new RuntimeException('Save encoding failed');
        }

        $this->gameSaves->upsert($userId, $json);
    }

    public function updateLeaderboard(int $userId, string $username, array $saveData): int
    {
        $totalLoc = max(0, (float) ($saveData['totalLoc'] ?? 0));
        $prestigeCount = max(0, (int) ($saveData['prestige'] ?? 0));
        $locPts = (int) (log10(max(10, $totalLoc)) * 2);
        $prestPts = $prestigeCount * 10;
        $achPts = count(array_filter((array) ($saveData['achievements'] ?? []))) * 2;
        $dungPts = (int) ($saveData['dungeonClears'] ?? 0) * 3;
        $accountLevel = max(1, (int) (($locPts + $prestPts + $achPts + $dungPts) / 5));
        $dungeonClears = max(0, (int) ($saveData['dungeonClears'] ?? 0));

        $this->leaderboard->upsert($userId, $username, $totalLoc, $prestigeCount, $accountLevel, $dungeonClears);

        return $accountLevel;
    }

    public function touchUser(int $userId): void
    {
        $this->users->updateLastSeen($userId);
    }

    public function loadPayload(int $userId): array
    {
        $row = $this->readRow($userId);
        if ($row === null) {
            return ['data' => null];
        }

        $lb = $this->leaderboard->findByUserId($userId);

        return [
            'data' => $row->saveData,
            'accountLevel' => $lb instanceof LeaderboardRecord ? $lb->accountLevel : 1,
            'dungeonClears' => $lb instanceof LeaderboardRecord ? $lb->dungeonClears : 0,
        ];
    }

    public function buyPrestige(int $userId, string $username, string $itemId): array
    {
        $itemId = trim($itemId);
        if ($itemId === '') {
            throw new RuntimeException('No item id');
        }

        $shopItems = self::PRESTIGE_SHOP_ITEMS;

        if (!isset($shopItems[$itemId])) {
            throw new RuntimeException('Unknown item');
        }

        $row = $this->readRow($userId);
        if ($row === null) {
            throw new RuntimeException('No save found');
        }

        $saveData = $this->parseExisting($row);
        $item = $shopItems[$itemId];
        $oo = $this->intValue($saveData['prestigePoints'] ?? 0, 0, 100000);
        $prestige = $this->intValue($saveData['prestige'] ?? 0, 0, 1000);
        $shopOwned = is_array($saveData['prestigeShop'] ?? null) ? $saveData['prestigeShop'] : [];
        $currentLevel = $this->intValue($shopOwned[$itemId] ?? 0, 0, 10);

        if (isset($item['requiresPrestige']) && $prestige < $item['requiresPrestige']) {
            throw new RuntimeException('Требуется престиж ' . $item['requiresPrestige']);
        }
        if ($currentLevel >= $item['maxLevel']) {
            throw new RuntimeException('Максимальный уровень');
        }
        if ($oo < $item['cost']) {
            throw new RuntimeException('Недостаточно Очков Опыта');
        }

        $saveData['prestigePoints'] = $oo - $item['cost'];
        $saveData['prestigeShop'][$itemId] = $currentLevel + 1;
        $saveData['lastSave'] = $this->nowMs();

        $this->upsertRow($userId, $saveData);
        $this->updateLeaderboard($userId, $username, $saveData);

        return [
            'newLevel' => $currentLevel + 1,
            'remainingOO' => (int) $saveData['prestigePoints'],
        ];
    }

    public function applyMinigameReward(int $userId, string $username, int $bugs, float $loc, int $oo): array
    {
        $saveData = $this->parseExisting($this->readRow($userId));
        $saveData['loc'] = $this->floatValue(($saveData['loc'] ?? 0) + max(0, min($loc, 10000)), 0, 1.0e18);
        $saveData['totalLoc'] = $this->floatValue(($saveData['totalLoc'] ?? 0) + max(0, min($loc, 10000)), 0, 1.0e18);
        if ($oo > 0) {
            $cappedOo = max(0, min($oo, 1));
            $saveData['prestigePoints'] = $this->intValue(($saveData['prestigePoints'] ?? 0) + $cappedOo, 0, 100000);
            $saveData['totalPrestigePoints'] = $this->intValue(($saveData['totalPrestigePoints'] ?? 0) + $cappedOo, 0, 100000);
        }
        $saveData['lastSave'] = $this->nowMs();

        $this->upsertRow($userId, $saveData);
        $this->updateLeaderboard($userId, $username, $saveData);

        return ['applied' => true];
    }

    public function applyDungeonClear(int $userId, string $username, float $loc, int $oo): array
    {
        $saveData = $this->parseExisting($this->readRow($userId));
        $cappedLoc = max(0, min($loc, 500000));
        $cappedOo = max(0, min($oo, 3));

        $saveData['dungeonClears'] = $this->intValue(($saveData['dungeonClears'] ?? 0) + 1, 0, 10000);
        $saveData['loc'] = $this->floatValue(($saveData['loc'] ?? 0) + $cappedLoc, 0, 1.0e18);
        $saveData['totalLoc'] = $this->floatValue(($saveData['totalLoc'] ?? 0) + $cappedLoc, 0, 1.0e18);
        $saveData['locThisRun'] = $this->floatValue(($saveData['locThisRun'] ?? 0) + $cappedLoc, 0, 1.0e18);
        if ($cappedOo > 0) {
            $saveData['prestigePoints'] = $this->intValue(($saveData['prestigePoints'] ?? 0) + $cappedOo, 0, 100000);
            $saveData['totalPrestigePoints'] = $this->intValue(($saveData['totalPrestigePoints'] ?? 0) + $cappedOo, 0, 100000);
        }
        $saveData['lastSave'] = $this->nowMs();

        $this->upsertRow($userId, $saveData);
        $this->updateLeaderboard($userId, $username, $saveData);

        return [
            'applied' => true,
            'dungeonClears' => (int) $saveData['dungeonClears'],
        ];
    }

    private function floatValue(mixed $value, float $min, float $max): float
    {
        if (!is_numeric($value)) {
            return $min;
        }

        return max($min, min($max, (float) $value));
    }

    private function intValue(mixed $value, int $min, int $max): int
    {
        if (!is_numeric($value)) {
            return $min;
        }

        return max($min, min($max, (int) $value));
    }

    private function boolMap(mixed $value, int $maxItems): array
    {
        if (!is_array($value)) {
            return [];
        }

        $clean = [];
        foreach ($value as $key => $enabled) {
            if (count($clean) >= $maxItems) {
                break;
            }
            if (!is_string($key) || !preg_match('/^[a-zA-Z0-9_]{1,64}$/', $key)) {
                continue;
            }
            $clean[$key] = (bool) $enabled;
        }

        return $clean;
    }

    private function intMap(mixed $value, int $maxItems, int $maxValue): array
    {
        if (!is_array($value)) {
            return [];
        }

        $clean = [];
        foreach ($value as $key => $amount) {
            if (count($clean) >= $maxItems) {
                break;
            }
            if (!is_string($key) || !preg_match('/^[a-zA-Z0-9_]{1,64}$/', $key)) {
                continue;
            }
            $clean[$key] = $this->intValue($amount, 0, $maxValue);
        }

        return $clean;
    }

    private function normalizePrestigeShop(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        $clean = [];
        foreach (self::PRESTIGE_SHOP_ITEMS as $itemId => $item) {
            $incoming = $this->intValue($value[$itemId] ?? 0, 0, 10);
            if ($incoming <= 0) {
                continue;
            }

            $maxLevel = (int) $item['maxLevel'];
            if ($incoming > $maxLevel) {
                $this->securityLog('suspicious_save_shop_level', [
                    'itemId' => $itemId,
                    'incoming' => $incoming,
                    'allowed' => $maxLevel,
                ]);
            }

            $clean[$itemId] = min($incoming, $maxLevel);
        }

        return $clean;
    }

    private function reconcileWithExisting(array $clean, array $existing): array
    {
        $incomingCurrentOo = $clean['prestigePoints'];
        $incomingTotalOo = $clean['totalPrestigePoints'];

        $clean['totalLoc'] = max(
            $clean['totalLoc'],
            $this->floatValue($existing['totalLoc'] ?? 0, 0, 1.0e18),
        );
        $clean['totalClicks'] = max(
            $clean['totalClicks'],
            $this->intValue($existing['totalClicks'] ?? 0, 0, 1000000000),
        );
        $clean['eventCount'] = max(
            $clean['eventCount'],
            $this->intValue($existing['eventCount'] ?? 0, 0, 1000000),
        );
        $clean['prestige'] = max(
            $clean['prestige'],
            $this->intValue($existing['prestige'] ?? 0, 0, 1000),
        );
        $clean['prestigeMulti'] = round((float) pow(1.5, $clean['prestige']), 8);
        $clean['totalPrestigePoints'] = max(
            $clean['totalPrestigePoints'],
            $this->intValue($existing['totalPrestigePoints'] ?? 0, 0, 100000),
        );
        $clean['dungeonClears'] = max(
            $clean['dungeonClears'],
            $this->intValue($existing['dungeonClears'] ?? 0, 0, 10000),
        );
        $clean['maxOffline'] = max(
            $clean['maxOffline'],
            $this->intValue($existing['maxOffline'] ?? 0, 0, $this->allowedMaxOfflineSeconds($clean['prestigeShop'])),
        );
        $clean['prestigeShop'] = $this->mergePrestigeShop(
            $clean['prestigeShop'],
            $existing['prestigeShop'] ?? [],
        );
        $clean['achievements'] = $this->mergeBoolMaps(
            $clean['achievements'],
            $existing['achievements'] ?? [],
        );
        $clean['story'] = $this->mergeBoolMaps(
            $clean['story'],
            $existing['story'] ?? [],
        );

        $existingCurrentOo = $this->intValue($existing['prestigePoints'] ?? 0, 0, 100000);
        $existingTotalOo = $this->intValue($existing['totalPrestigePoints'] ?? 0, 0, 100000);
        $incomingSpentOo = max(0, $incomingTotalOo - $incomingCurrentOo);
        $existingSpentOo = max(0, $existingTotalOo - $existingCurrentOo);
        $spentOo = max($incomingSpentOo, $existingSpentOo);

        $clean['prestigePoints'] = max(0, $clean['totalPrestigePoints'] - $spentOo);

        if ($clean['loc'] > $clean['totalLoc']) {
            $clean['loc'] = $clean['totalLoc'];
        }
        if ($clean['locThisRun'] > $clean['totalLoc']) {
            $clean['locThisRun'] = $clean['totalLoc'];
        }

        return $clean;
    }

    private function mergePrestigeShop(array $incoming, mixed $existing): array
    {
        $merged = $incoming;
        if (!is_array($existing)) {
            return $merged;
        }

        foreach (self::PRESTIGE_SHOP_ITEMS as $itemId => $item) {
            $merged[$itemId] = max(
                $this->intValue($merged[$itemId] ?? 0, 0, (int) $item['maxLevel']),
                $this->intValue($existing[$itemId] ?? 0, 0, (int) $item['maxLevel']),
            );

            if ($merged[$itemId] <= 0) {
                unset($merged[$itemId]);
            }
        }

        return $merged;
    }

    private function mergeBoolMaps(array $incoming, mixed $existing): array
    {
        if (!is_array($existing)) {
            return $incoming;
        }

        foreach ($existing as $key => $value) {
            if (!is_string($key) || !preg_match('/^[a-zA-Z0-9_]{1,64}$/', $key)) {
                continue;
            }
            if ((bool) $value) {
                $incoming[$key] = true;
            }
        }

        return $incoming;
    }

    private function allowedMaxOfflineSeconds(array $prestigeShop): int
    {
        $offlineBoostLevel = $this->intValue($prestigeShop['offline_boost'] ?? 0, 0, 3);

        return (8 + ($offlineBoostLevel * 4)) * 3600;
    }

    private function securityLog(string $event, array $context): void
    {
        if (!function_exists('app_security_log')) {
            return;
        }

        app_security_log($event, $context);
    }

    private function nowMs(): int
    {
        return (int) (microtime(true) * 1000);
    }
}
