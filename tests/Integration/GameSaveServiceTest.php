<?php

declare(strict_types=1);

namespace Tests\Integration;

use App\Application\GameSave\GameSaveService;
use App\Infrastructure\Persistence\GameSaveRepository;
use App\Infrastructure\Persistence\LeaderboardRepository;
use App\Infrastructure\Persistence\UserRepository;
use Tests\Support\DatabaseTestCase;

final class GameSaveServiceTest extends DatabaseTestCase
{
    public function testSaveSanitizesPayloadAndUpdatesLeaderboard(): void
    {
        $userId = $this->createUser('saver');
        $service = $this->createService();

        $existing = $service->defaultData();
        $payload = [
            'loc' => 1500,
            'totalLoc' => 2000,
            'locThisRun' => 1800,
            'totalClicks' => 33,
            'buildings' => ['junior' => 3],
            'upgrades' => ['espresso' => true],
            'achievements' => ['first_loc' => true],
            'prestige' => 2,
            'prestigeMulti' => 99,
            'prestigePoints' => 5,
            'totalPrestigePoints' => 5,
            'story' => ['ch1' => true],
            'dungeonClears' => 1,
            'version' => 3,
        ];

        $sanitized = $service->sanitizePayload($payload, $existing);
        $service->upsertRow($userId, $sanitized);
        $accountLevel = $service->updateLeaderboard($userId, 'saver', $sanitized);

        self::assertSame(round((float) pow(1.5, 2), 8), $sanitized['prestigeMulti']);
        self::assertGreaterThanOrEqual(1, $accountLevel);

        $saved = $service->parseExisting($service->readRow($userId));
        self::assertEquals(2000.0, $saved['totalLoc']);
        self::assertSame(2, $saved['prestige']);
        self::assertSame(['junior' => 3], $saved['buildings']);
    }

    public function testLoadPayloadReturnsStoredSaveAndLeaderboardProjection(): void
    {
        $userId = $this->createUser('loader');
        $service = $this->createService();

        $save = $service->defaultData();
        $save['totalLoc'] = 5000;
        $save['loc'] = 4000;
        $save['prestige'] = 1;
        $save['dungeonClears'] = 2;

        $service->upsertRow($userId, $save);
        $service->updateLeaderboard($userId, 'loader', $save);

        $payload = $service->loadPayload($userId);

        self::assertNotNull($payload['data']);
        self::assertSame(2, $payload['dungeonClears']);

        $decoded = json_decode((string) $payload['data'], true);
        self::assertIsArray($decoded);
        self::assertSame(5000, $decoded['totalLoc']);
    }

    public function testBuyPrestigeConsumesOoAndUpgradesShopItem(): void
    {
        $userId = $this->createUser('shopper');
        $service = $this->createService();

        $save = $service->defaultData();
        $save['prestigePoints'] = 5;
        $service->upsertRow($userId, $save);

        $result = $service->buyPrestige($userId, 'shopper', 'coffee_iv');

        self::assertSame(1, $result['newLevel']);
        self::assertSame(4, $result['remainingOO']);

        $stored = $service->parseExisting($service->readRow($userId));
        self::assertSame(1, $stored['prestigeShop']['coffee_iv']);
        self::assertSame(4, $stored['prestigePoints']);
    }

    public function testMinigameRewardUpdatesSaveAndCapsOo(): void
    {
        $userId = $this->createUser('hunter');
        $service = $this->createService();

        $result = $service->applyMinigameReward($userId, 'hunter', 999, 2500, 9);

        self::assertTrue($result['applied']);
        $stored = $service->parseExisting($service->readRow($userId));
        self::assertEquals(2500.0, $stored['totalLoc']);
        self::assertSame(1, $stored['prestigePoints']);
        self::assertSame(1, $stored['totalPrestigePoints']);
    }

    public function testDungeonClearUpdatesProgressAndCapsReward(): void
    {
        $userId = $this->createUser('raider');
        $service = $this->createService();

        $result = $service->applyDungeonClear($userId, 'raider', 999999, 10);

        self::assertTrue($result['applied']);
        self::assertSame(1, $result['dungeonClears']);

        $stored = $service->parseExisting($service->readRow($userId));
        self::assertSame(1, $stored['dungeonClears']);
        self::assertEquals(500000.0, $stored['totalLoc']);
        self::assertSame(3, $stored['prestigePoints']);
    }

    public function testSanitizePayloadLimitsLargePrestigeJumps(): void
    {
        $service = $this->createService();

        $existing = $service->defaultData();
        $existing['prestige'] = 1;
        $existing['dungeonClears'] = 2;

        $sanitized = $service->sanitizePayload([
            'prestige' => 99,
            'dungeonClears' => 50,
            'totalLoc' => 1000,
        ], $existing);

        self::assertSame(4, $sanitized['prestige']);
        self::assertSame(5, $sanitized['dungeonClears']);
    }

    private function createUser(string $username): int
    {
        $hash = password_hash('secret123', PASSWORD_BCRYPT);
        $stmt = $this->db->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        $stmt->execute([$username, $hash]);

        return (int) $this->db->lastInsertId();
    }

    private function createService(): GameSaveService
    {
        return new GameSaveService(
            new GameSaveRepository($this->db),
            new LeaderboardRepository($this->db),
            new UserRepository($this->db),
        );
    }
}
