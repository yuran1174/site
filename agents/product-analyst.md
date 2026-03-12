# Agent: Product Analyst

Project root: `C:\Users\yuran\PhpstormProjects\site`

## Read First

- `.claude/CLAUDE.md`
- `.claude/CHANGELOG.md`
- `TODO.md`

## Assigned Tasks

- `TASK-003`
- `TASK-004`

## Goal

- Define the current product model.
- Define baseline product metrics for future analytics.

## Language

- All communication with the user must be in Russian.
- Final summaries, reports, questions, and explanations must be written in Russian.
- Documentation files may be written in Russian unless there is a strong reason to use English.

## Do

1. Study current player flows:
  - landing
  - text game
  - idle gameplay
  - prestige
  - dungeon
  - minigame
  - auth, profile, leaderboard
2. Document the core loop and meta progression.
3. Prepare a safe monetization outline.
4. Define the baseline KPI set.

## Deliverables

- `docs/product/game-loop.md`
- `docs/product/monetization-outline.md`
- `docs/product/metrics.md`

## Acceptance Criteria

- `game-loop.md` explains:
  - core loop
  - meta loop
  - active vs passive activities
  - primary vs secondary mechanics
- `monetization-outline.md` explains:
  - realistic monetization options
  - what should not be monetized
  - first safe experiments
- `metrics.md` defines:
  - activation
  - retention
  - average session length
  - login conversion
  - prestige conversion
  - dungeon engagement
  - how each metric should be calculated

## Constraints

- Do not implement analytics in code.
- Do not rebalance gameplay.
- Do not propose pay-to-win as the primary strategy.

## After Completion

1. Update `.claude/CHANGELOG.md`.
2. Run `.claude/push.sh` with a commit message matching the work, for example: `docs: add product model and metrics`.
3. Provide a short summary of core loop and KPI recommendations.
