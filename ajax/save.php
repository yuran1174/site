<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$userId   = (int)$_SESSION['user_id'];
$username = $_SESSION['username'] ?? '';
$db       = DB::get();

$method = $_SERVER['REQUEST_METHOD'];
$input  = ($method === 'POST') ? (json_decode(file_get_contents('php://input'), true) ?? $_POST) : [];
$action = $input['action'] ?? $_GET['action'] ?? '';

switch ($action) {

    case 'save': {
        $rawData = $input['data'] ?? '';
        if (!$rawData) {
            echo json_encode(['error' => 'No data']);
            exit;
        }

        // Validate JSON
        $parsed = json_decode($rawData, true);
        if (!is_array($parsed)) {
            echo json_encode(['error' => 'Invalid JSON']);
            exit;
        }

        // Sanitize/cap values just in case
        $totalLoc      = max(0, (float)($parsed['totalLoc'] ?? 0));
        $prestigeCount = max(0, (int)($parsed['prestige'] ?? 0));

        // Compute account level server-side (mirrors JS formula)
        $locPts     = (int)(log10(max(10, $totalLoc)) * 2);
        $prestPts   = $prestigeCount * 10;
        $achPts     = count(array_filter((array)($parsed['achievements'] ?? []))) * 2;
        $dungPts    = (int)($parsed['dungeonClears'] ?? 0) * 3;
        $accountLvl = max(1, (int)(($locPts + $prestPts + $achPts + $dungPts) / 5));

        // Upsert save
        $stmt = $db->prepare('
            INSERT INTO game_saves (user_id, save_data, updated_at)
            VALUES (?, ?, strftime(\'%s\',\'now\'))
            ON CONFLICT(user_id) DO UPDATE SET
                save_data  = excluded.save_data,
                updated_at = excluded.updated_at
        ');
        $stmt->execute([$userId, $rawData]);

        // Update leaderboard
        $lb = $db->prepare('
            INSERT INTO leaderboard (user_id, username, total_loc, prestige_count, account_level, updated_at)
            VALUES (?, ?, ?, ?, ?, strftime(\'%s\',\'now\'))
            ON CONFLICT(user_id) DO UPDATE SET
                username       = excluded.username,
                total_loc      = excluded.total_loc,
                prestige_count = excluded.prestige_count,
                account_level  = excluded.account_level,
                updated_at     = excluded.updated_at
        ');
        $lb->execute([$userId, $username, $totalLoc, $prestigeCount, $accountLvl]);

        echo json_encode(['success' => true]);
        exit;
    }

    case 'load': {
        $stmt = $db->prepare('SELECT save_data FROM game_saves WHERE user_id = ?');
        $stmt->execute([$userId]);
        $row = $stmt->fetch();

        if (!$row) {
            echo json_encode(['success' => true, 'data' => null]);
            exit;
        }

        // Return raw save_data as-is (it's already JSON)
        echo json_encode(['success' => true, 'data' => $row['save_data']]);
        exit;
    }

    case 'buy_prestige': {
        $itemId = trim($input['id'] ?? '');
        if (!$itemId) {
            echo json_encode(['error' => 'No item id']);
            exit;
        }

        // Prestige shop definitions (server-side reference for costs)
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
            echo json_encode(['error' => 'Unknown item']);
            exit;
        }

        $item = $shopItems[$itemId];

        // Load current save
        $stmt = $db->prepare('SELECT save_data FROM game_saves WHERE user_id = ?');
        $stmt->execute([$userId]);
        $row = $stmt->fetch();

        if (!$row) {
            echo json_encode(['error' => 'No save found']);
            exit;
        }

        $saveData = json_decode($row['save_data'], true);
        if (!is_array($saveData)) {
            echo json_encode(['error' => 'Corrupt save']);
            exit;
        }

        $oo          = (int)($saveData['prestigePoints'] ?? 0);
        $prestige    = (int)($saveData['prestige'] ?? 0);
        $shopOwned   = $saveData['prestigeShop'] ?? [];
        $currentLevel = (int)($shopOwned[$itemId] ?? 0);

        // Validate prestige requirement
        if (isset($item['requiresPrestige']) && $prestige < $item['requiresPrestige']) {
            echo json_encode(['error' => 'Требуется престиж ' . $item['requiresPrestige']]);
            exit;
        }

        // Check max level
        if ($currentLevel >= $item['maxLevel']) {
            echo json_encode(['error' => 'Максимальный уровень']);
            exit;
        }

        // Check OO
        if ($oo < $item['cost']) {
            echo json_encode(['error' => 'Недостаточно Очков Опыта']);
            exit;
        }

        // Deduct OO and set level
        $saveData['prestigePoints']         = $oo - $item['cost'];
        $saveData['prestigeShop'][$itemId]  = $currentLevel + 1;

        $newSaveJson = json_encode($saveData);

        // Save back
        $upd = $db->prepare('
            UPDATE game_saves SET save_data = ?, updated_at = strftime(\'%s\',\'now\') WHERE user_id = ?
        ');
        $upd->execute([$newSaveJson, $userId]);

        echo json_encode([
            'success'     => true,
            'newLevel'    => $currentLevel + 1,
            'remainingOO' => $saveData['prestigePoints'],
        ]);
        exit;
    }

    case 'minigame_reward': {
        $bugs = max(0, (int)($input['bugs'] ?? 0));
        $loc  = max(0, (float)($input['loc'] ?? 0));
        $oo   = max(0, (int)($input['oo'] ?? 0));

        // Cap values to prevent abuse
        $bugs = min($bugs, 100);
        $loc  = min($loc, 10000);
        $oo   = min($oo, 1);

        // Load current save
        $stmt = $db->prepare('SELECT save_data FROM game_saves WHERE user_id = ?');
        $stmt->execute([$userId]);
        $row = $stmt->fetch();

        if (!$row) {
            // No save yet - just return success, JS will apply locally
            echo json_encode(['success' => true, 'applied' => false]);
            exit;
        }

        $saveData = json_decode($row['save_data'], true);
        if (!is_array($saveData)) {
            echo json_encode(['success' => true, 'applied' => false]);
            exit;
        }

        $saveData['loc']      = ($saveData['loc'] ?? 0) + $loc;
        $saveData['totalLoc'] = ($saveData['totalLoc'] ?? 0) + $loc;
        if ($oo > 0) {
            $saveData['prestigePoints']      = ($saveData['prestigePoints'] ?? 0) + $oo;
            $saveData['totalPrestigePoints'] = ($saveData['totalPrestigePoints'] ?? 0) + $oo;
        }

        $newSaveJson = json_encode($saveData);
        $upd = $db->prepare('
            UPDATE game_saves SET save_data = ?, updated_at = strftime(\'%s\',\'now\') WHERE user_id = ?
        ');
        $upd->execute([$newSaveJson, $userId]);

        echo json_encode(['success' => true, 'applied' => true]);
        exit;
    }

    default:
        echo json_encode(['error' => 'Unknown action']);
        exit;
}
