<?php
declare(strict_types=1);

namespace App\Infrastructure\Database;

use PDO;

final class SchemaInitializer
{
    public static function initialize(PDO $db): void
    {
        $db->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at INTEGER DEFAULT (strftime('%s','now')),
                last_seen INTEGER DEFAULT (strftime('%s','now'))
            );
            CREATE TABLE IF NOT EXISTS game_saves (
                user_id INTEGER PRIMARY KEY,
                save_data TEXT NOT NULL,
                updated_at INTEGER DEFAULT (strftime('%s','now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            CREATE TABLE IF NOT EXISTS leaderboard (
                user_id INTEGER PRIMARY KEY,
                username TEXT NOT NULL,
                total_loc REAL DEFAULT 0,
                prestige_count INTEGER DEFAULT 0,
                account_level INTEGER DEFAULT 1,
                updated_at INTEGER DEFAULT (strftime('%s','now'))
            );
        ");

        $cols = array_column($db->query("PRAGMA table_info(leaderboard)")->fetchAll(), 'name');
        if (!in_array('account_level', $cols, true)) {
            $db->exec("ALTER TABLE leaderboard ADD COLUMN account_level INTEGER DEFAULT 1");
        }
        if (!in_array('dungeon_clears', $cols, true)) {
            $db->exec("ALTER TABLE leaderboard ADD COLUMN dungeon_clears INTEGER DEFAULT 0");
        }
    }
}
