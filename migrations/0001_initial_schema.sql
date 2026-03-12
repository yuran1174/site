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
    dungeon_clears INTEGER DEFAULT 0,
    updated_at INTEGER DEFAULT (strftime('%s','now'))
);
