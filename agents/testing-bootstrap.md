# Agent: Testing Bootstrap

Project root: `C:\Users\yuran\PhpstormProjects\site`

## Read First

- `.claude/CLAUDE.md`
- `.claude/CHANGELOG.md`
- `TODO.md`

## Assigned Tasks

- `TASK-027`
- `TASK-028`
- `TASK-029`

## Goal

- Create a practical testing and quality baseline for the backend side of the project.

## Language

- All communication with the user must be in Russian.
- Final summaries, reports, questions, and explanations must be written in Russian.
- Documentation files may be written in Russian unless there is a strong reason to use English.

## Do

1. Add a PHP testing stack.
2. Set up test bootstrap.
3. Add first integration or functional tests for:
  - register
  - login
  - save
  - load
  - prestige purchase
  - reward application
4. Add formatter and linter baseline.
5. Keep the setup practical and lightweight.

## Deliverables

- `tests/`
- test configuration
- formatter/linter configuration
- instructions for running checks if needed

## Acceptance Criteria

- Tests actually run.
- The riskiest backend flows are covered first.
- Formatting can be run automatically.
- Any hard-to-test area is explicitly documented.

## Constraints

- Do not rewrite the app for perfect testability.
- Do not introduce heavy infrastructure unless required.
- Focus on useful coverage, not noisy coverage.

## After Completion

1. Update `.claude/CHANGELOG.md`.
2. Run `.claude/push.sh` with a commit message matching the work, for example: `test: add backend baseline tests`.
3. Report:
  - what is covered
  - what remains uncovered
