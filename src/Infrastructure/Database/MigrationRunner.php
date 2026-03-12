<?php

declare(strict_types=1);

namespace App\Infrastructure\Database;

use PDO;
use RuntimeException;

final class MigrationRunner
{
    public function __construct(
        private readonly PDO $db,
        private readonly string $migrationsPath,
    ) {
    }

    public function migrate(): void
    {
        $this->ensureMigrationsTable();

        if (!is_dir($this->migrationsPath)) {
            throw new RuntimeException('Migrations path not found: ' . $this->migrationsPath);
        }

        $files = glob($this->migrationsPath . '/*.sql') ?: [];
        sort($files);

        $applied = $this->appliedVersions();

        foreach ($files as $file) {
            $version = pathinfo($file, PATHINFO_FILENAME);
            if (isset($applied[$version])) {
                continue;
            }

            $sql = file_get_contents($file);
            if ($sql === false) {
                throw new RuntimeException('Unable to read migration: ' . $file);
            }

            $this->db->beginTransaction();

            try {
                $this->db->exec($sql);
                $stmt = $this->db->prepare('
                    INSERT INTO schema_migrations (version, applied_at)
                    VALUES (?, strftime(\'%s\', \'now\'))
                ');
                $stmt->execute([$version]);
                $this->db->commit();
            } catch (\Throwable $e) {
                $this->db->rollBack();
                throw $e;
            }
        }
    }

    private function ensureMigrationsTable(): void
    {
        $this->db->exec('
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version TEXT PRIMARY KEY,
                applied_at INTEGER NOT NULL
            )
        ');
    }

    private function appliedVersions(): array
    {
        $rows = $this->db->query('SELECT version FROM schema_migrations')->fetchAll(PDO::FETCH_COLUMN);
        if (!is_array($rows)) {
            return [];
        }

        return array_fill_keys(array_map(static fn ($value): string => (string) $value, $rows), true);
    }
}
