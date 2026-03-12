<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/app.php';

\App\Bootstrap\AppBootstrap::bootApi();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated'], JSON_UNESCAPED_UNICODE);
    exit;
}

$userId   = (int)$_SESSION['user_id'];
$username = (string)($_SESSION['username'] ?? '');
$db       = DB::get();
$method   = $_SERVER['REQUEST_METHOD'];
$input    = $method === 'POST' ? (app_request_json() ?: $_POST) : [];
$action   = (string)($input['action'] ?? $_GET['action'] ?? '');

function save_json(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
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
        'retry_after' => (int)($result['retry_after'] ?? 0),
    ]);
}

function save_read_row(PDO $db, int $userId): ?array
{
    $stmt = $db->prepare('SELECT save_data, updated_at FROM game_saves WHERE user_id = ?');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();

    return is_array($row) ? $row : null;
}

function save_default_data(): array
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
        'lastSave' => (int)(microtime(true) * 1000),
        'version' => 3,
    ];
}

function save_parse_existing(?array $row): array
{
    if (!$row || !isset($row['save_data'])) {
        return save_default_data();
    }

    $decoded = json_decode((string)$row['save_data'], true);
    return is_array($decoded) ? $decoded : save_default_data();
}

function save_float(mixed $value, float $min, float $max): float
{
    if (!is_numeric($value)) {
        return $min;
    }

    return max($min, min($max, (float)$value));
}

function save_int(mixed $value, int $min, int $max): int
{
    if (!is_numeric($value)) {
        return $min;
    }

    return max($min, min($max, (int)$value));
}

function save_bool_map(mixed $value, int $maxItems): array
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
        $clean[$key] = (bool)$enabled;
    }

    return $clean;
}

function save_int_map(mixed $value, int $maxItems, int $maxValue): array
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
        $clean[$key] = save_int($amount, 0, $maxValue);
    }

    return $clean;
}

function save_sanitize_payload(array $parsed, array $existing): array
{
    $clean = save_default_data();

    $clean['loc'] = save_float($parsed['loc'] ?? 0, 0, 1.0e18);
    $clean['totalLoc'] = save_float($parsed['totalLoc'] ?? 0, 0, 1.0e18);
    $clean['locThisRun'] = save_float($parsed['locThisRun'] ?? 0, 0, 1.0e18);
    $clean['totalClicks'] = save_int($parsed['totalClicks'] ?? 0, 0, 1000000000);
    $clean['buildings'] = save_int_map($parsed['buildings'] ?? [], 64, 1000000);
    $clean['upgrades'] = save_bool_map($parsed['upgrades'] ?? [], 256);
    $clean['achievements'] = save_bool_map($parsed['achievements'] ?? [], 512);
    $clean['prestige'] = save_int($parsed['prestige'] ?? 0, 0, 1000);
    $clean['prestigeMulti'] = round((float)pow(1.5, $clean['prestige']), 8);
    $clean['prestigePoints'] = save_int($parsed['prestigePoints'] ?? 0, 0, 100000);
    $clean['totalPrestigePoints'] = save_int($parsed['totalPrestigePoints'] ?? 0, 0, 100000);
    $clean['prestigeShop'] = save_int_map($parsed['prestigeShop'] ?? [], 32, 10);
    $clean['eventCount'] = save_int($parsed['eventCount'] ?? 0, 0, 1000000);
    $clean['maxOffline'] = save_int($parsed['maxOffline'] ?? 0, 0, 86400);
    $clean['story'] = save_bool_map($parsed['story'] ?? [], 128);
    $clean['dungeonClears'] = save_int($parsed['dungeonClears'] ?? 0, 0, 10000);
    $clean['lastSave'] = save_int($parsed['lastSave'] ?? (int)(microtime(true) * 1000), 0, (int)(microtime(true) * 1000) + 300000);
    $clean['version'] = save_int($parsed['version'] ?? 3, 1, 999);

    if ($clean['loc'] > $clean['totalLoc']) {
        $clean['loc'] = $clean['totalLoc'];
    }

    if ($clean['locThisRun'] > $clean['totalLoc']) {
        $clean['locThisRun'] = $clean['totalLoc'];
    }

    $existingPrestige = save_int($existing['prestige'] ?? 0, 0, 1000);
    if ($clean['prestige'] > $existingPrestige + 3) {
        app_security_log('suspicious_save_prestige_jump', [
            'existing' => $existingPrestige,
            'incoming' => $clean['prestige'],
        ]);
        $clean['prestige'] = $existingPrestige + 3;
        $clean['prestigeMulti'] = round((float)pow(1.5, $clean['prestige']), 8);
    }

    $existingDungeonClears = save_int($existing['dungeonClears'] ?? 0, 0, 10000);
    if ($clean['dungeonClears'] > $existingDungeonClears + 3) {
        app_security_log('suspicious_save_dungeon_jump', [
            'existing' => $existingDungeonClears,
            'incoming' => $clean['dungeonClears'],
        ]);
        $clean['dungeonClears'] = $existingDungeonClears + 3;
    }

    $existingTotalOo = save_int($existing['totalPrestigePoints'] ?? 0, 0, 100000);
    if ($clean['totalPrestigePoints'] > $existingTotalOo + 100) {
        app_security_log('suspicious_save_oo_jump', [
            'existing' => $existingTotalOo,
            'incoming' => $clean['totalPrestigePoints'],
        ]);
    }

    return $clean;
}

function save_upsert_row(PDO $db, int $userId, array $saveData): void
{
    $json = json_encode($saveData, JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        save_log_and_fail('save_encode_failed', 'Save encoding failed', 500);
    }

    $stmt = $db->prepare('
        INSERT INTO game_saves (user_id, save_data, updated_at)
        VALUES (?, ?, strftime(\'%s\',\'now\'))
        ON CONFLICT(user_id) DO UPDATE SET
            save_data  = excluded.save_data,
            updated_at = excluded.updated_at
    ');
    $stmt->execute([$userId, $json]);
}

function save_update_leaderboard(PDO $db, int $userId, string $username, array $saveData): int
{
    $totalLoc      = max(0, (float)($saveData['totalLoc'] ?? 0));
    $prestigeCount = max(0, (int)($saveData['prestige'] ?? 0));
    $locPts        = (int)(log10(max(10, $totalLoc)) * 2);
    $prestPts      = $prestigeCount * 10;
    $achPts        = count(array_filter((array)($saveData['achievements'] ?? []))) * 2;
    $dungPts       = (int)($saveData['dungeonClears'] ?? 0) * 3;
    $accountLvl    = max(1, (int)(($locPts + $prestPts + $achPts + $dungPts) / 5));
    $dungeonClears = max(0, (int)($saveData['dungeonClears'] ?? 0));

    $lb = $db->prepare('
        INSERT INTO leaderboard (user_id, username, total_loc, prestige_count, account_level, dungeon_clears, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, strftime(\'%s\',\'now\'))
        ON CONFLICT(user_id) DO UPDATE SET
            username       = excluded.username,
            total_loc      = excluded.total_loc,
            prestige_count = excluded.prestige_count,
            account_level  = excluded.account_level,
            dungeon_clears = excluded.dungeon_clears,
            updated_at     = excluded.updated_at
    ');
    $lb->execute([$userId, $username, $totalLoc, $prestigeCount, $accountLvl, $dungeonClears]);

    return $accountLvl;
}

function save_touch_user(PDO $db, int $userId): void
{
    $db->prepare('UPDATE users SET last_seen = strftime(\'%s\',\'now\') WHERE id = ?')->execute([$userId]);
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

        $existingRow = save_read_row($db, $userId);
        $existingData = save_parse_existing($existingRow);
        $sanitized = save_sanitize_payload($parsed, $existingData);

        save_touch_user($db, $userId);
        save_upsert_row($db, $userId, $sanitized);
        $accountLvl = save_update_leaderboard($db, $userId, $username, $sanitized);

        save_json(['success' => true, 'accountLevel' => $accountLvl]);
    }

    case 'load': {
        save_rate_limit_or_fail('save:load', 120, 60, 'load', $identityBase);

        $stmt = $db->prepare('SELECT save_data FROM game_saves WHERE user_id = ?');
        $stmt->execute([$userId]);
        $row = $stmt->fetch();

        if (!$row) {
            save_json(['success' => true, 'data' => null]);
        }

        $lbRow = $db->prepare('SELECT account_level, dungeon_clears FROM leaderboard WHERE user_id = ?');
        $lbRow->execute([$userId]);
        $lb = $lbRow->fetch();

        save_json([
            'success' => true,
            'data' => $row['save_data'],
            'accountLevel' => $lb ? (int)$lb['account_level'] : 1,
            'dungeonClears' => $lb ? (int)$lb['dungeon_clears'] : 0,
        ]);
    }

    case 'buy_prestige': {
        if ($method !== 'POST') {
            save_json(['error' => 'Method not allowed'], 405);
        }

        save_require_csrf('buy_prestige');
        save_rate_limit_or_fail('save:buy_prestige', 30, 60, 'buy_prestige', $identityBase);

        $itemId = trim((string)($input['id'] ?? ''));
        if ($itemId === '') {
            save_log_and_fail('prestige_buy_invalid', 'No item id', 422, ['action' => 'buy_prestige']);
        }

        $shopItems = [
            'coffee_iv'    => ['cost' => 1, 'maxLevel' => 5],
            'veteran'      => ['cost' => 2, 'maxLevel' => 1],
            'discount'     => ['cost' => 3, 'maxLevel' => 3],
            'automator'    => ['cost' => 4, 'maxLevel' => 1],
            'legacy'       => ['cost' => 5, 'maxLevel' => 1, 'requiresPrestige' => 3],
            'ai_assist'    => ['cost' => 8, 'maxLevel' => 1, 'requiresPrestige' => 5],
            'offline_boost'=> ['cost' => 2, 'maxLevel' => 3],
            'event_luck'   => ['cost' => 3, 'maxLevel' => 2],
        ];

        if (!isset($shopItems[$itemId])) {
            save_log_and_fail('prestige_buy_invalid', 'Unknown item', 422, ['item' => $itemId]);
        }

        $row = save_read_row($db, $userId);
        if (!$row) {
            save_log_and_fail('prestige_buy_missing_save', 'No save found', 409);
        }

        $saveData = save_parse_existing($row);
        $item = $shopItems[$itemId];
        $oo = save_int($saveData['prestigePoints'] ?? 0, 0, 100000);
        $prestige = save_int($saveData['prestige'] ?? 0, 0, 1000);
        $shopOwned = is_array($saveData['prestigeShop'] ?? null) ? $saveData['prestigeShop'] : [];
        $currentLevel = save_int($shopOwned[$itemId] ?? 0, 0, 10);

        if (isset($item['requiresPrestige']) && $prestige < $item['requiresPrestige']) {
            save_log_and_fail('prestige_buy_denied', 'Требуется престиж ' . $item['requiresPrestige'], 422, [
                'item' => $itemId,
                'prestige' => $prestige,
            ]);
        }

        if ($currentLevel >= $item['maxLevel']) {
            save_log_and_fail('prestige_buy_denied', 'Максимальный уровень', 422, ['item' => $itemId]);
        }

        if ($oo < $item['cost']) {
            save_log_and_fail('prestige_buy_denied', 'Недостаточно Очков Опыта', 422, [
                'item' => $itemId,
                'oo' => $oo,
            ]);
        }

        $saveData['prestigePoints'] = $oo - $item['cost'];
        $saveData['prestigeShop'][$itemId] = $currentLevel + 1;
        $saveData['lastSave'] = (int)(microtime(true) * 1000);

        save_upsert_row($db, $userId, $saveData);
        save_update_leaderboard($db, $userId, $username, $saveData);

        save_json([
            'success' => true,
            'newLevel' => $currentLevel + 1,
            'remainingOO' => (int)$saveData['prestigePoints'],
        ]);
    }

    case 'minigame_reward': {
        if ($method !== 'POST') {
            save_json(['error' => 'Method not allowed'], 405);
        }

        save_require_csrf('minigame_reward');
        save_rate_limit_or_fail('save:minigame_reward', 20, 60, 'minigame_reward', $identityBase);

        $bugsRaw = (int)($input['bugs'] ?? 0);
        $locRaw  = (float)($input['loc'] ?? 0);
        $ooRaw   = (int)($input['oo'] ?? 0);

        $bugs = max(0, min($bugsRaw, 100));
        $loc  = max(0, min($locRaw, 10000));
        $oo   = max(0, min($ooRaw, 1));

        if ($bugs !== $bugsRaw || $loc !== $locRaw || $oo !== $ooRaw) {
            app_security_log('reward_capped', [
                'action' => 'minigame_reward',
                'bugs_raw' => $bugsRaw,
                'loc_raw' => $locRaw,
                'oo_raw' => $ooRaw,
            ]);
        }

        $row = save_read_row($db, $userId);
        $saveData = save_parse_existing($row);

        $saveData['loc'] = save_float(($saveData['loc'] ?? 0) + $loc, 0, 1.0e18);
        $saveData['totalLoc'] = save_float(($saveData['totalLoc'] ?? 0) + $loc, 0, 1.0e18);
        if ($oo > 0) {
            $saveData['prestigePoints'] = save_int(($saveData['prestigePoints'] ?? 0) + $oo, 0, 100000);
            $saveData['totalPrestigePoints'] = save_int(($saveData['totalPrestigePoints'] ?? 0) + $oo, 0, 100000);
        }
        $saveData['lastSave'] = (int)(microtime(true) * 1000);

        save_upsert_row($db, $userId, $saveData);
        save_update_leaderboard($db, $userId, $username, $saveData);

        save_json(['success' => true, 'applied' => true]);
    }

    case 'dungeon_clear': {
        if ($method !== 'POST') {
            save_json(['error' => 'Method not allowed'], 405);
        }

        save_require_csrf('dungeon_clear');
        save_rate_limit_or_fail('save:dungeon_clear', 10, 300, 'dungeon_clear', $identityBase);

        $locRaw = (float)($input['loc'] ?? 0);
        $ooRaw  = (int)($input['oo'] ?? 0);
        $loc = max(0, min($locRaw, 500000));
        $oo  = max(0, min($ooRaw, 3));

        if ($loc !== $locRaw || $oo !== $ooRaw) {
            app_security_log('reward_capped', [
                'action' => 'dungeon_clear',
                'loc_raw' => $locRaw,
                'oo_raw' => $ooRaw,
            ]);
        }

        $row = save_read_row($db, $userId);
        $saveData = save_parse_existing($row);

        $saveData['dungeonClears'] = save_int(($saveData['dungeonClears'] ?? 0) + 1, 0, 10000);
        $saveData['loc'] = save_float(($saveData['loc'] ?? 0) + $loc, 0, 1.0e18);
        $saveData['totalLoc'] = save_float(($saveData['totalLoc'] ?? 0) + $loc, 0, 1.0e18);
        $saveData['locThisRun'] = save_float(($saveData['locThisRun'] ?? 0) + $loc, 0, 1.0e18);
        if ($oo > 0) {
            $saveData['prestigePoints'] = save_int(($saveData['prestigePoints'] ?? 0) + $oo, 0, 100000);
            $saveData['totalPrestigePoints'] = save_int(($saveData['totalPrestigePoints'] ?? 0) + $oo, 0, 100000);
        }
        $saveData['lastSave'] = (int)(microtime(true) * 1000);

        save_upsert_row($db, $userId, $saveData);
        save_update_leaderboard($db, $userId, $username, $saveData);

        save_json([
            'success' => true,
            'applied' => true,
            'dungeonClears' => (int)$saveData['dungeonClears'],
        ]);
    }

    default:
        save_log_and_fail('save_unknown_action', 'Unknown action', 400, ['action' => $action]);
}
