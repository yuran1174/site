# Agent: Backend Extraction

Project root: `C:\Users\yuran\PhpstormProjects\site`

## Read First

- `.claude/CLAUDE.md`
- `.claude/CHANGELOG.md`
- `TODO.md`

## Assigned Tasks

- `TASK-006`
- `TASK-007`
- `TASK-008`
- `TASK-009`
- `TASK-010`
- `TASK-011`
- `TASK-012`
- `TASK-013`

## Goal

- Move the backend toward a maintainable structure while preserving current behavior.

## Language

- All communication with the user must be in Russian.
- Final summaries, reports, questions, and explanations must be written in Russian.
- Documentation files may be written in Russian unless there is a strong reason to use English.

## Main Principle

- Existing entrypoints may remain in place.
- Business logic should move into `src/`.
- Changes must be incremental and backward-compatible.

## Do

1. Add Composer and PSR-4 autoloading.
2. Introduce an application bootstrap layer.
3. Introduce config handling and `.env.example`.
4. Move database setup and access into `src/`.
5. Move auth logic into services/controllers.
6. Move save/load/reward/prestige logic into services/controllers.
7. Introduce repositories and DTOs where useful.
8. Introduce a consistent API response format.
9. Preserve current URLs and player flows.

## Expected Deliverables

- `composer.json`
- `.env.example`
- `src/Bootstrap/`
- `src/Infrastructure/Database/`
- `src/Application/Auth/`
- `src/Application/GameSave/`
- `src/Http/ApiResponse.php`
- `config/` if needed

## Acceptance Criteria

- Existing endpoints still work.
- `ajax/auth.php` and `ajax/save.php` become thin adapters.
- Business logic is no longer concentrated in page or endpoint files.
- The new structure is simpler, not more ceremonial.

## Constraints

- Do not rewrite the frontend.
- Do not rebalance the game.
- Do not break API behavior unless absolutely necessary.
- If a full migration is too large, complete a safe first iteration and clearly mark follow-up items.

## After Completion

1. Update `.claude/CHANGELOG.md`.
2. Run `.claude/push.sh` with a commit message matching the work and pass only the files you changed, for example: `bash .claude/push.sh "refactor: extract backend services" composer.json .env.example ajax/auth.php ajax/save.php .claude/CHANGELOG.md`.
3. Report:
  - what was extracted
  - what remains legacy
  - which follow-up tasks are mandatory
