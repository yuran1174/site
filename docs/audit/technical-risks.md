# Technical Risk Audit

## Scope

This audit covers the current implementation only. Severity reflects likely impact on integrity, security, and maintainability if the project continues to grow without architectural changes.

## Critical

### 1. Client-controlled progression can be forged

- Evidence: `ajax/save.php?action=save` accepts a client-supplied full save JSON and persists it after only shallow validation of a few fields.
- Consequence: a player can tamper with browser state or crafted requests to inflate progression, achievements, prestige-related state, and leaderboard data.
- Recommended next action: move authoritative progression rules server-side for critical values, validate full payload shape/ranges, and reject impossible transitions.

### 2. No CSRF protection on state-changing endpoints

- Evidence: `ajax/auth.php` and `ajax/save.php` accept authenticated POST requests with no CSRF token checks; logout is also exposed via GET.
- Consequence: an authenticated user can be forced by another site to trigger saves, prestige purchases, logout, or reward mutations.
- Recommended next action: add a shared CSRF token mechanism for forms and AJAX, and remove state-changing GET behavior.

## High

### 3. Reward application has multiple authorities and can drift

- Evidence: activity pages write rewards into `localStorage`, some also POST rewards to the server, and `idle.js` independently consumes `minigame_reward` later.
- Consequence: rewards can be lost, double-applied, or diverge between local and server state, especially around focus changes, reloads, or network failures.
- Recommended next action: choose one authoritative reward delivery path per logged-in/guest mode and make reward processing idempotent.

### 4. Authentication endpoints have no rate limiting

- Evidence: `ajax/auth.php` performs login and registration with no throttling, lockout, or abuse controls.
- Consequence: brute-force, credential stuffing, and account-creation spam remain cheap.
- Recommended next action: add IP/session-based rate limiting with basic security logging for failed auth attempts.

### 5. Runtime schema migration is embedded in request path

- Evidence: `db.php` runs table creation and `ALTER TABLE` checks during normal application bootstrap.
- Consequence: schema changes are hard to review, hard to reproduce, and risky under concurrent access or future deployments.
- Recommended next action: introduce explicit migrations and keep `db.php` limited to connection/bootstrap concerns.

### 6. Core business logic is concentrated in large untyped scripts

- Evidence: most idle-game rules, content data, rendering, persistence, and activity unlock logic live in `js/idle.js`; reward/gameplay logic also lives in page-inline JS and `js/dungeon.js`.
- Consequence: regression risk rises quickly, onboarding is slow, and changes in one mechanic can break unrelated flows.
- Recommended next action: split the main JS by domain boundaries first (`state`, `economy`, `render`, `save`, `activities`) without changing behavior.

## Medium

### 7. Account-level logic is inconsistent between client and server reads

- Evidence: `ajax/save.php` computes `accountLevel` for leaderboard responses, while `dungeon.php` reads `accountLevel` from save JSON, and `buildSaveData()` in `idle.js` does not store that field explicitly.
- Consequence: the dungeon bonus can drift from the leaderboard/account-level presentation or default incorrectly to level 1.
- Recommended next action: define one source of truth for account level and expose it consistently to all pages.

### 8. SQLite is used as both auth store and live game state store with JSON blobs

- Evidence: one SQLite file stores users, raw JSON saves, and leaderboard projection, all in the web app directory.
- Consequence: concurrent writes, backup/recovery, and selective data queries become harder as usage grows.
- Recommended next action: keep SQLite for now, but document its limits, move runtime data out of the source tree conceptually, and prepare a migration path.

### 9. Some logged-in reward flows silently fail without a prior save row

- Evidence: `buy_prestige`, `minigame_reward`, and `dungeon_clear` depend on an existing `game_saves` row and otherwise return `applied: false` or an error.
- Consequence: a newly registered user can complete an activity or open profile flows before a first save exists and see inconsistent reward behavior.
- Recommended next action: create the save row on first authenticated gameplay or let reward endpoints initialize one safely.

### 10. Read-side page behavior includes avoidable full-page workarounds

- Evidence: `leaderboard.php` refresh logic fetches `leaderboard.php?ajax=1`, but the PHP file does not implement a dedicated AJAX branch.
- Consequence: extra markup is downloaded and parsed for a simple table refresh, which is fragile and obscures intent.
- Recommended next action: either add a real partial/API response or remove the pseudo-AJAX parameter.

## Low

### 11. Session hardening is minimal

- Evidence: sessions are started directly with default settings in multiple files; cookie flags and centralized session config are absent.
- Consequence: the app misses standard defense-in-depth around session cookies and consistent regeneration policy.
- Recommended next action: centralize session bootstrap and configure `httponly`, `samesite`, and production-aware `secure`.

### 12. Dead or incomplete navigation exists

- Evidence: `idle.js` exposes a prestige-based `pvp.php` target, but the file is not present in the repository.
- Consequence: unlocked navigation can lead users to a missing page and undermines trust in progression unlocks.
- Recommended next action: hide unfinished activities behind explicit placeholders or remove the link until the page exists.

### 13. Operational visibility is near zero

- Evidence: there is no structured error logging, security logging, or automated test coverage in the current repository.
- Consequence: production failures, abuse, and regression causes will be hard to diagnose as the app evolves.
- Recommended next action: add a minimal logging baseline first, then cover auth/save/reward flows with integration tests.
