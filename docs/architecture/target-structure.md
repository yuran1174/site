# Target Structure Migration Plan

## Context

Current project structure is optimized for a small single-root PHP site, but the codebase has already grown into multiple pages, AJAX endpoints, shared state, and persistent storage. The main risk is not scale by itself, but the fact that source code, entrypoints, runtime data, and future documentation all live side by side in the repository root.

This document defines a safe intermediate target structure that can be introduced without a rewrite and without breaking the current site.

## Current Structural Problems

1. Root directory is overloaded.
   - Public entrypoints, business logic, database bootstrap, runtime folders, and project documentation are all mixed together.
2. Runtime data is colocated with source code.
   - `db/game.sqlite` and `logs/` sit next to PHP/CSS/JS files.
3. Application bootstrap is duplicated.
   - Pages and AJAX endpoints repeat `session_start()` and `require_once .../db.php`.
4. Business logic is embedded in entrypoints.
   - `ajax/auth.php` and `ajax/save.php` contain validation, persistence, session handling, and response shaping.
5. Static assets are split by file type, not by deployment role.
   - `css/`, `js/`, `assets/` are public assets, but there is no `public/` boundary yet.
6. There is no dedicated home for docs, migrations, tests, or configuration.

## Target Structure

```text
/
├── public/                # Future web root
│   ├── index.php          # Front controller or migrated public entrypoint
│   ├── css/
│   ├── js/
│   └── assets/
├── src/                   # Application and domain code
│   ├── Bootstrap/
│   ├── Application/
│   ├── Domain/
│   ├── Infrastructure/
│   └── Http/
├── config/                # Environment-specific configuration
├── storage/               # Runtime and writable data
│   ├── database/
│   ├── logs/
│   └── cache/
├── migrations/            # Schema migrations
├── tests/                 # Automated tests
├── docs/                  # Architecture, product, API, audits
│   └── architecture/
├── ajax/                  # Temporary legacy adapters
├── *.php                  # Temporary legacy root entrypoints during migration
├── .claude/
├── agents/
└── TODO.md
```

## Rationale By Directory

### `public/`

Long-term web root. It should eventually contain only directly accessible files: page entrypoints, static assets, and public adapters. This creates a clean security boundary between web-accessible files and internal code.

### `src/`

Home for reusable PHP code that should stop living inside pages and AJAX handlers. This is the destination for bootstrap, services, repositories, DTOs, and API response helpers.

### `config/`

Separates configuration from logic. This will allow environment-based settings and later `.env` support without scattering values across PHP files.

### `storage/`

Writable runtime state should not remain next to source files. SQLite, logs, cache files, and similar artifacts should move here first because they have the highest operational risk.

### `migrations/`

Current schema changes happen inline in `db.php`. A migrations directory is needed before schema changes become harder to reason about.

### `tests/`

Provides a stable destination for the first smoke tests and endpoint-level regression coverage.

### `docs/`

Project planning already exists in `TODO.md` and `agents/`. Architecture, API, and risk documentation should move into a single discoverable place.

## What Can Move Immediately

These moves are low-risk because they do not require changing live routes yet:

- Create empty target directories.
- Start writing new architecture and API documentation under `docs/`.
- Introduce new PHP classes under `src/` once Composer/autoload is added.
- Add migration files under `migrations/`.
- Add tests under `tests/`.
- Add future config files under `config/`.

## What Should Temporarily Stay In The Root

These files should remain in place until compatibility adapters exist:

- `index.php`
- `auth.php`
- `game.php`
- `idle.php`
- `dungeon.php`
- `minigame.php`
- `leaderboard.php`
- `profile.php`
- `db.php`
- `ajax/auth.php`
- `ajax/save.php`
- `ajax/excuse.php`
- `css/`
- `js/`
- `assets/`

Reason: current links, script tags, asset paths, and fetch calls all assume the root-based layout.

## Files That Should Become Adapters Or Entrypoints

These files should stay thin over time and delegate real work elsewhere:

- Root pages:
  - `auth.php`
  - `idle.php`
  - `profile.php`
  - `leaderboard.php`
  - `index.php`
  - `game.php`
  - `dungeon.php`
  - `minigame.php`
- AJAX endpoints:
  - `ajax/auth.php`
  - `ajax/save.php`
  - `ajax/excuse.php`
- Legacy bootstrap:
  - `db.php`

Target role after extraction:

- Root/page files render or forward only.
- AJAX files parse requests and return responses only.
- `db.php` becomes either a thin compatibility wrapper or is removed after callers move to `src/Infrastructure/Database`.

## Recommended Migration Phases

### Phase 1: Introduce Structure Without Behavioral Change

- Create `public/`, `src/`, `config/`, `storage/`, `migrations/`, `tests/`, `docs/`.
- Keep the site running from the current root.
- Store all new documentation in `docs/`.
- Do not move any existing PHP pages or assets yet.

### Phase 2: Introduce Shared Bootstrap

- Add a unified bootstrap in `src/Bootstrap/`.
- Move session setup, error handling, config loading, and DB initialization behind that bootstrap.
- Update root pages and AJAX files to require the shared bootstrap instead of duplicating setup.

### Phase 3: Extract Infrastructure And Application Logic

- Replace direct `DB::get()` usage in endpoints with infrastructure classes under `src/Infrastructure/`.
- Extract auth, save/load, rewards, and prestige operations into `src/Application/`.
- Keep existing endpoint URLs unchanged while they become thin adapters.

### Phase 4: Separate Runtime Data

- Move SQLite from `db/game.sqlite` to `storage/database/game.sqlite`.
- Move logs from `logs/` to `storage/logs/`.
- Keep temporary compatibility fallbacks if local environments still expect old paths.

### Phase 5: Prepare Public Web Root

- Duplicate or move public assets into `public/` when path strategy is defined.
- Add public entrypoints or a front controller inside `public/`.
- Update local server configuration to use `public/` as document root.
- Only after that, migrate root PHP pages into `public/` or replace them with compatibility shims.

### Phase 6: Remove Legacy Root Layout

- Drop obsolete root adapters once local links, assets, and server config all target `public/`.
- Retire `db.php` after all consumers use the extracted infrastructure layer.

## Suggested First Concrete Follow-Ups

1. Add `composer.json` with PSR-4 autoload for `src/`.
2. Create `src/Bootstrap/AppBootstrap.php`.
3. Create `src/Infrastructure/Database/ConnectionFactory.php`.
4. Convert `db.php` into a compatibility wrapper over the new database layer.
5. Move schema initialization out of `db.php` and into `migrations/`.

## Risk Notes

1. Moving page files immediately is high-risk.
   - Relative links like `css/idle.css`, `js/idle.js`, `ajax/auth.php`, and page-to-page navigation would break.
2. Moving the SQLite file without a compatibility step is medium-to-high risk.
   - Existing local environments may rely on the current `db/` path.
3. Changing the web root too early is high-risk.
   - OSPanel or other local server configuration would need to change in lockstep.
4. Extracting logic without preserving endpoint contracts is high-risk.
   - Frontend code expects the current JSON shape and routes.
5. Introducing Composer is low risk if done before file moves.
   - It improves structure without changing runtime URLs.

## Definition Of Safe Progress

The migration is considered safe if each step preserves:

- current page URLs
- current AJAX URLs
- current asset URLs
- current SQLite data
- current gameplay behavior

That means the first milestone is not a relocation of the app. The first milestone is a structural scaffold that allows later extraction with compatibility layers.
