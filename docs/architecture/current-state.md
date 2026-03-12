# Current State Architecture

## Scope and assumptions

- This document reflects the code currently present in the project root on 2026-03-12.
- It describes observed behavior only. Where the code suggests intent but the implementation is inconsistent, that is marked as an assumption.

## System summary

The project is a file-based PHP application with page-level rendering and page-specific frontend scripts.

- PHP pages render HTML, bootstrap session state, and sometimes read SQLite directly.
- `db.php` is the only database bootstrap and schema initialization point.
- SQLite stores accounts, one JSON save per user, and leaderboard rows.
- The main gameplay loop for `idle.php` lives almost entirely in [`js/idle.js`](/C:/Users/yuran/PhpstormProjects/site/js/idle.js).
- Supporting activities are split across standalone pages:
  - `game.php` + [`js/game.js`](/C:/Users/yuran/PhpstormProjects/site/js/game.js)
  - `minigame.php` with inline JS
  - `dungeon.php` + [`js/dungeon.js`](/C:/Users/yuran/PhpstormProjects/site/js/dungeon.js)
- Browser `localStorage` is used as the guest save store and also as a cross-page handoff mechanism for activity rewards.

## Main pages and roles

- [`index.php`](/C:/Users/yuran/PhpstormProjects/site/index.php)
  - Public landing page.
  - Mostly static/in-page interactions.
  - Uses `ajax/excuse.php` for the custom excuse generator.
- [`game.php`](/C:/Users/yuran/PhpstormProjects/site/game.php)
  - Standalone branching story game.
  - Scene graph and endings are embedded in PHP and handed to `js/game.js`.
  - No persistence or server gameplay API.
- [`idle.php`](/C:/Users/yuran/PhpstormProjects/site/idle.php)
  - Core product surface and main progression loop.
  - Renders login-aware shell and hands off almost all mechanics to `js/idle.js`.
  - Links to profile, leaderboard, minigame, and dungeon.
- [`auth.php`](/C:/Users/yuran/PhpstormProjects/site/auth.php)
  - Login/registration page.
  - Uses inline JS with `fetch()` to call `ajax/auth.php`.
- [`profile.php`](/C:/Users/yuran/PhpstormProjects/site/profile.php)
  - Logged-in profile page.
  - Reads `users` and `game_saves` directly from SQLite.
  - Renders prestige shop and achievements.
  - Uses inline JS to call `ajax/save.php` with `buy_prestige`.
- [`leaderboard.php`](/C:/Users/yuran/PhpstormProjects/site/leaderboard.php)
  - Logged-in or public leaderboard page.
  - Reads `leaderboard` joined with `users`.
  - Inline refresh JS re-fetches the full page and swaps `#lbTableWrap`.
- [`minigame.php`](/C:/Users/yuran/PhpstormProjects/site/minigame.php)
  - Standalone bug-catching minigame.
  - Reward is first written to `localStorage` as `minigame_reward`.
  - If logged in, it also attempts to send reward to `ajax/save.php`.
- [`dungeon.php`](/C:/Users/yuran/PhpstormProjects/site/dungeon.php)
  - Standalone roguelike activity powered by Phaser.
  - Reads session state and tries to read account level from saved JSON.
  - Sends rewards to both `localStorage` and `ajax/save.php`.

## AJAX endpoints and purpose

- [`ajax/auth.php`](/C:/Users/yuran/PhpstormProjects/site/ajax/auth.php)
  - `GET action=logout`: destroys session and redirects to `idle.php`.
  - `GET action=me`: returns current login/session info as JSON.
  - `POST action=login`: validates credentials, updates `last_seen`, starts session.
  - `POST action=register`: validates username/password, creates user, starts session.
  - `POST action=logout`: destroys session and returns JSON.
- [`ajax/save.php`](/C:/Users/yuran/PhpstormProjects/site/ajax/save.php)
  - Requires authenticated session for every action.
  - `save`: stores full save JSON into `game_saves`, recomputes leaderboard/account level.
  - `load`: returns raw save JSON and leaderboard-derived `accountLevel`/`dungeonClears`.
  - `buy_prestige`: validates item cost/requirements, mutates prestige shop data inside save JSON.
  - `minigame_reward`: caps reward values and applies them into save JSON.
  - `dungeon_clear`: caps dungeon clear reward values, increments `dungeonClears`, applies reward into save JSON.
- [`ajax/excuse.php`](/C:/Users/yuran/PhpstormProjects/site/ajax/excuse.php)
  - Stateless POST endpoint for landing-page humor content.
  - No DB/session dependency.

## Data model and SQLite usage

`db.php` creates and migrates schema on demand the first time `DB::get()` is called.

- `users`
  - `id`, `username`, `password_hash`, `created_at`, `last_seen`
- `game_saves`
  - `user_id`, `save_data`, `updated_at`
  - `save_data` is the main gameplay state blob in JSON.
- `leaderboard`
  - `user_id`, `username`, `total_loc`, `prestige_count`, `account_level`, `dungeon_clears`, `updated_at`

Current persistence pattern:

- The canonical per-user gameplay state is mostly a JSON blob in `game_saves.save_data`.
- `leaderboard` is a denormalized projection updated during `ajax/save.php?action=save`.
- Schema evolution is handled inside runtime code through `CREATE TABLE IF NOT EXISTS`, `PRAGMA table_info`, and `ALTER TABLE`.

## Where business logic currently lives

### PHP-side logic

- Session bootstrapping and access control are duplicated in individual pages and endpoints.
- Auth rules and credential handling live directly inside [`ajax/auth.php`](/C:/Users/yuran/PhpstormProjects/site/ajax/auth.php).
- Save/reward/prestige validation lives directly inside [`ajax/save.php`](/C:/Users/yuran/PhpstormProjects/site/ajax/save.php).
- Some read-side business presentation logic lives in page files:
  - profile titles, formatting, achievement catalog in [`profile.php`](/C:/Users/yuran/PhpstormProjects/site/profile.php)
  - leaderboard titles/formatting in [`leaderboard.php`](/C:/Users/yuran/PhpstormProjects/site/leaderboard.php)

### JS-side logic

- [`js/idle.js`](/C:/Users/yuran/PhpstormProjects/site/js/idle.js) is the main domain layer in practice.
  - Static economy/balance definitions for buildings, upgrades, events, story chapters, and achievements.
  - Tick loop, click economy, unlocks, random events, prestige flow, account-level calculation, activity unlocks, rendering, local save, server sync, reward merge.
- [`js/dungeon.js`](/C:/Users/yuran/PhpstormProjects/site/js/dungeon.js)
  - Roguelike rules, class definitions, map generation, combat, progression, reward dispatch.
- Inline JS in `minigame.php`
  - Minigame loop, scoring, reward generation, reward application.
- [`js/game.js`](/C:/Users/yuran/PhpstormProjects/site/js/game.js)
  - Standalone story-game state machine and ending selection.
- [`js/main.js`](/C:/Users/yuran/PhpstormProjects/site/js/main.js)
  - Landing page interactions and `ajax/excuse.php` call.

Net effect: most gameplay/business rules are in frontend code, while PHP mainly persists or lightly validates client-submitted state.

## State storage and interaction model

### Session

- PHP session is the only auth mechanism.
- Pages inspect `$_SESSION['user_id']` and `$_SESSION['username']`.
- `ajax/save.php` rejects unauthenticated requests.

### localStorage

- `kodikofee_save`
  - Main browser save for the idle game.
  - Used for guest progress and as the local side of logged-in merge logic.
- `minigame_reward`
  - Cross-page reward queue consumed by `idle.js`.
  - Used by both `minigame.php` and `dungeon.js`.

### Server save

- Logged-in users periodically POST full save JSON from `idle.js` to `ajax/save.php?action=save`.
- `loadGameServer()` in `idle.js` fetches server JSON and merges it with the local JSON by `lastSave`.
- Certain fields are treated as server-authoritative during merge:
  - `prestige`
  - `prestigeMulti`
  - `prestigePoints`
  - `prestigeShop`
  - `dungeonClears` is explicitly overridden from the server response when present

### Cross-system flow

1. Guest player uses `idle.php`.
2. `js/idle.js` saves into `localStorage`.
3. After login, `idle.js` loads server save, compares `lastSave`, and merges selected fields.
4. Activity pages write rewards locally and may also send them to the server.
5. `idle.js` consumes pending reward data on page load/focus and updates its main state.

## Gameplay flows

### Landing page flow

- User opens `index.php`.
- Most interactions stay client-side.
- Custom excuse generator POSTs form data to `ajax/excuse.php`.

### Text story flow

- `game.php` builds scene/endings arrays in PHP.
- `js/game.js` walks the scene tree, mutates local stats, and renders the ending.
- No login, DB, or shared progression.

### Idle core flow

- `idle.php` renders shell and login-aware navigation.
- `js/idle.js` initializes state from server or `localStorage`.
- Main loop runs every 50 ms and updates currency, events, achievements, and UI.
- Auto-save cadence:
  - local every 10s
  - server every 30s for logged-in users
  - `sendBeacon` on unload
- Prestige resets most run state but keeps meta progression.

### Minigame reward flow

- `minigame.php` creates result payload `{ bugs, loc, oo, ts }`.
- Payload is written to `localStorage.minigame_reward`.
- If logged in, the page also POSTs `minigame_reward` to `ajax/save.php`.
- `idle.js` later reads `minigame_reward`, applies reward again locally, then removes the key.
- Assumption: the intended design is "server for logged-in users, local fallback otherwise", but the current implementation allows both paths to participate.

### Dungeon flow

- `dungeon.php` renders class-selection shell and loads Phaser.
- `js/dungeon.js` owns gameplay and reward calculation.
- On death or victory, `sendReward()`:
  - updates `kodikofee_save` directly
  - if logged in, POSTs to `/ajax/save.php` using `dungeon_clear` for wins and `minigame_reward` for losses
- `idle.js` may also consume a pending reward-shaped object from `localStorage` if present.
- Assumption: account-level bonus is intended to come from persistent progression, but `dungeon.php` reads `accountLevel` from save JSON while `ajax/save.php` computes it separately for leaderboard responses.

## External dependencies

- Google Fonts
- Font Awesome CDN
- jQuery 3.7.1 CDN
- Telegram Web App SDK on `idle.php`, `minigame.php`, `dungeon.php`
- Phaser 3.87.0 CDN on `dungeon.php`

## Coupling and weak points

- The core game is tightly coupled to one large frontend file: [`js/idle.js`](/C:/Users/yuran/PhpstormProjects/site/js/idle.js).
- Server persistence contracts are implicit JSON blobs rather than explicit DTOs/schemas.
- Activity reward logic is duplicated across pages and backend actions.
- PHP pages, AJAX endpoints, and JS each calculate overlapping progression concepts such as prestige effects, rewards, and account level.
- `pvp.php` is referenced as an unlock target in `idle.js`, but no such page exists in the repository.
