# Current Product Model

## Product Summary

The current product is a humor-first hybrid game with one clear center of gravity: the idle game `idle.php` ("Код и Кофе"). Other surfaces support discovery, flavor, retention, or side rewards:

- `index.php`: acquisition and brand wrapper
- `game.php`: standalone narrative sampler
- `idle.php`: main progression surface
- `minigame.php`: short active reward loop
- `dungeon.php`: deeper active session loop
- `auth.php`, `profile.php`, `leaderboard.php`: persistence, identity, and social proof

In product terms, this is currently an idle progression game with side activities, not a content hub of equal modes.

## Player Flows

## 1. Landing

The landing page works as the top-of-funnel entry point:

- communicates the humorous programmer fantasy
- offers two primary exits: text game and idle game
- provides lightweight interactive widgets, but no persistent progression

Its practical role is conversion into a playable session, mainly into `idle.php`.

## 2. Text Game

`game.php` is a self-contained choice-based narrative:

- one run lasts a short session
- there is no account dependency
- there is no progression transfer into the idle economy

This is secondary content. It strengthens theme and gives new visitors a low-friction sample, but it is not part of the main progression loop.

## 3. Idle Gameplay

`idle.php` is the main game loop and progression backbone.

The player:

- clicks to generate initial LOC
- spends LOC on buildings/employees
- converts manual progress into passive LOC/sec
- buys upgrades that multiply click and production output
- accumulates achievements, story chapters, events, and account level
- works toward prestige requirements

This is the core loop because it owns:

- the main resource economy (`loc`, `totalLoc`, `locThisRun`)
- most progression states
- the prestige system
- the unlock logic for side activities
- server save and leaderboard relevance

## 4. Prestige

Prestige is the main meta loop:

- requires a per-run LOC target plus building-type and upgrade thresholds
- resets current run economy, buildings, and upgrades
- keeps long-term progression such as achievements, total LOC, prestige count, prestige multiplier, and prestige shop purchases
- grants OO and a permanent `x1.5` production multiplier each prestige

This creates the repeatable long-term progression arc and is the clearest expression of mastery today.

## 5. Dungeon

`dungeon.php` is a mid-length active side mode with stronger session identity:

- unlocks at account level 5
- uses separate combat gameplay
- rewards idle progression on death and on victory
- full clear gives LOC, OO, and dungeon clear count
- account level boosts dungeon starting stats

Dungeon is a secondary but important progression accelerator. It is not independent progression; it feeds the idle economy and achievement layer.

## 6. Minigame

`minigame.php` is a short active side mode:

- available immediately
- one 45-second session
- awards LOC based on performance
- awards +1 OO at 15+ bugs
- rewards feed back into idle progression

This is the lightest active session loop and likely the easiest repeat activity for short retention.

## 7. Auth, Profile, Leaderboard

These systems support persistence and motivation:

- auth converts guest play into server-backed play
- profile turns prestige into a spendable long-term shop
- leaderboard provides competitive framing around total LOC, prestige, and account level

These are supporting systems. They deepen commitment but do not replace the main loop.

## Core Loop

The current core loop is:

1. Generate LOC manually and passively.
2. Buy employees/buildings to increase LOC/sec.
3. Buy upgrades to multiply production and clicking.
4. Reach story, achievement, and account-level milestones.
5. Meet prestige thresholds.
6. Prestige for permanent multiplier and OO.
7. Spend OO on permanent meta upgrades.
8. Repeat with a stronger baseline.

Compact form:

`Click -> hire -> automate -> upgrade -> prestige -> permanent boost -> repeat`

## Meta Loop

The current meta loop is:

1. Persist progress through account creation/login.
2. Convert repeated runs into prestige count, OO, and permanent shop unlocks.
3. Raise account level through total LOC, achievements, prestige, and dungeon clears.
4. Unlock side activities and deeper progression surfaces.
5. Use side modes to accelerate the next idle run.

Compact form:

`session progression -> account progression -> activity unlocks -> stronger runs`

## Active vs Passive Activities

## Active

- manual clicking in idle early game
- buying buildings and upgrades
- choosing prestige timing
- minigame sessions
- dungeon runs
- auth/profile/shop interactions

## Passive

- LOC/sec production
- offline progress
- background story unlocks from total LOC
- long-tail achievement accumulation
- leaderboard visibility after saves

The product is strongest when active actions improve passive output, and passive output unlocks the next active decision.

## Primary vs Secondary Mechanics

## Primary Mechanics

- LOC generation
- building purchasing
- upgrade purchasing
- prestige reset and permanent multiplier
- OO earning and spending
- account-level progression tied to idle mastery

These define the product identity and should be treated as the main system.

## Secondary Mechanics

- random events
- story chapter reveals
- achievements
- dungeon combat
- minigame bug catching
- leaderboard comparison
- standalone text adventure

These matter for retention, novelty, and flavor, but they currently serve the main idle-progression economy.

## Current Product Thesis

The product currently delivers a humorous developer fantasy built around compounding production and "rewrite from scratch" resets. The strongest retention promise is not narrative completion or competition alone; it is the feeling of turning chaos into automation, then cashing that run into permanent meta power.
