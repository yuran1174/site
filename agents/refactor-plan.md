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

## Language

- All communication with the user must be in Russian.
- Final summaries, reports, questions, and explanations must be written in Russian.
- Documentation files may be written in Russian unless there is a strong reason to use English.

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
6. Keep `TODO.md` in sync:
   - ensure assigned tasks have `Status`
   - set them to `in_progress` while working
   - set them to `done` or `partial` before completion

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
2. Run `.claude/push.sh` with a commit message matching the work and pass only the files you changed, for example: `bash .claude/push.sh "docs: add target structure plan" docs/architecture/target-structure.md .claude/CHANGELOG.md`.
3. Provide a short migration plan summary.
