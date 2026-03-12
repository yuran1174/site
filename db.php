<?php
declare(strict_types=1);

class DB {
    private static ?PDO $pdo = null;

    public static function get(): PDO {
        if (self::$pdo === null) {
            $dir = __DIR__ . '/db';
            if (!is_dir($dir)) mkdir($dir, 0755, true);
            self::$pdo = new PDO('sqlite:' . $dir . '/game.sqlite');
            self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            self::init(self::$pdo);
        }
        return self::$pdo;
    }

    private static function init(PDO $db): void {
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

        // Migrations: add columns if they don't exist yet
        $cols = array_column($db->query("PRAGMA table_info(leaderboard)")->fetchAll(), 'name');
        if (!in_array('account_level', $cols)) {
            $db->exec("ALTER TABLE leaderboard ADD COLUMN account_level INTEGER DEFAULT 1");
        }
        if (!in_array('dungeon_clears', $cols)) {
            $db->exec("ALTER TABLE leaderboard ADD COLUMN dungeon_clears INTEGER DEFAULT 0");
        }
    }
}
