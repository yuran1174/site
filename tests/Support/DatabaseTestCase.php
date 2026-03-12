<?php

declare(strict_types=1);

namespace Tests\Support;

use App\Infrastructure\Database\SchemaInitializer;
use PDO;
use PHPUnit\Framework\TestCase;

abstract class DatabaseTestCase extends TestCase
{
    protected ?PDO $db = null;
    private string $databasePath;

    protected function setUp(): void
    {
        parent::setUp();

        $tmpDir = dirname(__DIR__, 2) . '/storage/tmp/tests';
        if (!is_dir($tmpDir)) {
            mkdir($tmpDir, 0755, true);
        }

        $this->databasePath = $tmpDir . '/site-test-' . bin2hex(random_bytes(6)) . '.sqlite';
        $this->db = new PDO('sqlite:' . $this->databasePath);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        SchemaInitializer::initialize($this->db);

        if (session_status() === PHP_SESSION_ACTIVE) {
            session_write_close();
        }

        session_id('test_' . bin2hex(random_bytes(8)));
        app_start_session();
        $_SESSION = [];
    }

    protected function tearDown(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            $_SESSION = [];
            session_destroy();
        }

        $this->db = null;
        gc_collect_cycles();

        if (is_file($this->databasePath)) {
            for ($attempt = 0; $attempt < 5; $attempt++) {
                if (@unlink($this->databasePath) || !is_file($this->databasePath)) {
                    break;
                }

                usleep(50000);
            }
        }

        parent::tearDown();
    }
}
