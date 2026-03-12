# Agent: Refactor Plan

Project root: `C:\Users\yuran\PhpstormProjects\site`

## Read First

- `.claude/CLAUDE.md`
- `.claude/CHANGELOG.md`
- `TODO.md`

## Assigned Tasks

- `TASK-005`

## Goal

- Define a safe migration plan for a more mature project structure without a risky rewrite.

## Do

1. Inspect the current project structure.
2. Propose the target structure:
  - `public/`
  - `src/`
  - `config/`
  - `storage/`
  - `migrations/`
  - `tests/`
  - `docs/`
3. Define:
  - what can move immediately
  - what should temporarily stay in the root
  - which files become adapters or entrypoints
4. If safe, create the target directories.
5. Document a phased migration plan.

## Deliverables

- `docs/architecture/target-structure.md`
- optionally the new empty directories

## Acceptance Criteria

- The document includes:
  - current structural problems
  - target structure
  - rationale
  - phased migration steps
  - risk notes
- If directories are created, the existing app must continue to work.

## Constraints

- Do not perform mass file moves.
- Do not rewrite the app.
- Do not change gameplay.

## After Completion

1. Update `.claude/CHANGELOG.md`.
2. Run `.claude/push.sh` with a commit message matching the work, for example: `docs: add target structure plan`.
3. Provide a short migration plan summary.
