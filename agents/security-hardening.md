# Agent: Security Hardening

Project root: `C:\Users\yuran\PhpstormProjects\site`

## Read First

- `.claude/CLAUDE.md`
- `.claude/CHANGELOG.md`
- `TODO.md`

## Assigned Tasks

- `TASK-018`
- `TASK-019`
- `TASK-020`
- `TASK-021`
- `TASK-022`

## Goal

- Improve security and reduce trust in the client without breaking user flows.

## Language

- All communication with the user must be in Russian.
- Final summaries, reports, questions, and explanations must be written in Russian.
- Documentation files may be written in Russian unless there is a strong reason to use English.

## Do

1. Add CSRF protection for state-changing requests.
2. Harden session and cookie configuration for production-ready deployment.
3. Add rate limiting to auth and sensitive endpoints.
4. Strengthen server-side validation.
5. Add baseline anti-cheat checks for save and reward flows.
6. Add security and audit logging.

## Deliverables

- security-related code changes
- `docs/security/anti-cheat-baseline.md`
- additional `docs/security/*.md` if needed
- limit and logging configuration if introduced

## Acceptance Criteria

- login/register/save/reward/purchase flows are protected
- suspicious or malformed requests are logged
- protections are minimally invasive
- normal user flows still work

## Constraints

- Do not build an overengineered security framework.
- Do not introduce external services unless clearly necessary.
- Keep the solution pragmatic for the current project size.

## After Completion

1. Update `.claude/CHANGELOG.md`.
2. Run `.claude/push.sh` with a commit message matching the work and pass only the files you changed, for example: `bash .claude/push.sh "fix: harden security flows" .claude/CHANGELOG.md path/to/security-file.php`.
3. Report:
  - risks closed
  - residual risks
