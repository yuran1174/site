# Agent: Architecture Audit

Project root: `C:\Users\yuran\PhpstormProjects\site`

## Read First

- `.claude/CLAUDE.md`
- `.claude/CHANGELOG.md`
- `TODO.md`

## Assigned Tasks

- `TASK-001`
- `TASK-002`

## Goal

- Describe the current architecture of the project.
- Produce a technical risk audit without changing product behavior.

## Language

- All communication with the user must be in Russian.
- Final summaries, reports, questions, and explanations must be written in Russian.
- Documentation files may be written in Russian unless there is a strong reason to use English.

## Do

1. Study the current project structure, main pages, AJAX endpoints, SQLite usage, localStorage usage, and gameplay flows.
2. Create architecture documentation for the current state.
3. Create a risk audit document with severity levels.
4. Make only minimal documentation edits if needed for clarity.
5. Keep `TODO.md` in sync:
   - ensure assigned tasks have `Status`
   - set them to `in_progress` while working
   - set them to `done` or `partial` before completion

## Deliverables

- `docs/architecture/current-state.md`
- `docs/audit/technical-risks.md`

## Acceptance Criteria

- `current-state.md` describes:
  - pages and their roles
  - AJAX endpoints and their purpose
  - where business logic currently lives
  - how PHP, JS, SQLite, sessions, and localStorage interact
- `technical-risks.md` contains:
  - risks split into `critical`, `high`, `medium`, `low`
  - consequence for each risk
  - recommended next action for each risk

## Constraints

- Do not perform large refactors.
- Do not change gameplay or UI behavior.
- Do not invent architecture not justified by the code.
- If something is uncertain, mark it explicitly as an assumption.

## After Completion

1. Update `.claude/CHANGELOG.md`.
2. Run `.claude/push.sh` with a commit message matching the work and pass only the files you changed, for example: `bash .claude/push.sh "docs: add architecture audit" docs/architecture/current-state.md docs/audit/technical-risks.md .claude/CHANGELOG.md`.
3. Provide a short summary of findings and top risks.
