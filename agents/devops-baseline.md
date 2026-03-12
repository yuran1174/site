# Agent: DevOps Baseline

Project root: `C:\Users\yuran\PhpstormProjects\site`

## Read First

- `.claude/CLAUDE.md`
- `.claude/CHANGELOG.md`
- `TODO.md`

## Assigned Tasks

- `TASK-030`
- `TASK-031`
- `TASK-032`
- `TASK-033`
- `TASK-034`

## Goal

- Make the project reproducible for development and manageable for deployment.

## Language

- All communication with the user must be in Russian.
- Final summaries, reports, questions, and explanations must be written in Russian.
- Documentation files may be written in Russian unless there is a strong reason to use English.

## Do

1. Prepare `README.md` with local setup instructions.
2. Define env strategy for dev, stage, and prod.
3. Add a CI baseline if feasible.
4. Document deploy strategy.
5. Document basic monitoring and uptime strategy.
6. Keep `TODO.md` in sync:
   - ensure assigned tasks have `Status`
   - set them to `in_progress` while working
   - set them to `done`, `partial`, or `blocked` before completion

## Deliverables

- `README.md`
- `docs/devops/deploy.md`
- `docs/devops/monitoring.md`
- CI workflow if added
- env strategy documentation

## Acceptance Criteria

- A new developer can run the project from the docs.
- Deploy flow is documented step by step.
- Rollback is considered.
- There is at least a baseline path for automated quality checks.

## Constraints

- Do not try to build a full platform setup in one step.
- If external infrastructure is required, document it as a prerequisite instead of faking it.

## After Completion

1. Update `.claude/CHANGELOG.md`.
2. Run `.claude/push.sh` with a commit message matching the work and pass only the files you changed, for example: `bash .claude/push.sh "docs: add devops baseline" README.md docs/devops/deploy.md docs/devops/monitoring.md .claude/CHANGELOG.md`.
3. Report:
  - what is automated already
  - what is still only documented
