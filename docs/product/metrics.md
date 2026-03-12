# Baseline Product Metrics

## Purpose

These metrics define a baseline measurement layer for the current game without changing gameplay or adding instrumentation yet. They are written so future analytics can use the same definitions consistently.

The recommended reporting grain is:

- daily for top-line health
- weekly for trend review
- by player cohort based on first play date or first login date

## Tracking Scope

Because the current product has guest and logged-in play, each metric should be defined twice where needed:

- `device/session scope`: based on local session or local save
- `account scope`: based on authenticated users only

For product decisions, account scope should become the source of truth once analytics exists. Until then, both scopes matter because a meaningful share of play can happen before login.

## Core Metrics

## 1. Activation

Definition:

Activation is the share of new players who reach meaningful engagement in the main loop, not just page load.

Recommended activation event:

- player reaches all three within the first 24 hours of first play
- first manual click in idle
- first building purchase
- total LOC >= 500

Formula:

`Activation Rate = activated new players / all new players who opened idle.php`

Technical calculation later:

- identify each player's first idle session date
- count player as activated if the activation conditions happen within 24 hours of that first idle session

## 2. Retention

Definition:

Retention measures whether players come back on later days after their first idle session.

Recommended cuts:

- D1 retention
- D7 retention
- D30 retention later

Formula:

`D1 Retention = players active on day 1 after first idle day / players whose first idle day was day 0`

`D7 Retention = players active on day 7 after first idle day / players whose first idle day was day 0`

Activity definition:

- an active day means the player opens `idle.php`, `minigame.php`, `dungeon.php`, `profile.php`, or successfully saves progress that day

## 3. Average Session Length

Definition:

Average session length is the mean time spent in a gameplay session.

Session boundary recommendation:

- session starts on page open of a gameplay surface
- session ends after 30 minutes of inactivity or page close/background timeout

Track separately:

- idle session length
- dungeon session length
- minigame session length
- blended gameplay session length

Formula:

`Average Session Length = total session seconds / total sessions`

Important note:

Do not include pure background idle time with no foreground interaction as full active session time.

## 4. Login Conversion

Definition:

Login conversion is the share of players who move from guest play to authenticated play.

Primary formula:

`Login Conversion = players who register or log in after first guest idle session / players who started as guests in idle.php`

Useful splits:

- same-day login conversion
- lifetime login conversion

## 5. Prestige Conversion

Definition:

Prestige conversion is the share of active idle players who complete at least one prestige.

Primary formula:

`Prestige Conversion = players with prestige >= 1 / players who reached activation`

Secondary formulas:

- `First Prestige Time = median time from first idle session to first prestige`
- `Repeat Prestige Rate = players with prestige >= 2 / players with prestige >= 1`

## 6. Dungeon Engagement

Definition:

Dungeon engagement measures how much the unlocked roguelike mode is actually used by players who can access it.

Recommended primary formula:

`Dungeon Engagement = players who start at least 1 dungeon run / players who reached account level >= 5`

Recommended secondary formulas:

- `Dungeon Completion Rate = players with at least 1 dungeon clear / players who started dungeon`
- `Dungeon Repeat Rate = players with 3+ dungeon starts / players who started dungeon`
- `Dungeon Reward Share = total LOC from dungeon rewards / total LOC earned by players who used dungeon`

## Supporting Metrics

## 7. Minigame Engagement

Definition:

Usage of the short 45-second bug-catching mode.

Formula:

`Minigame Engagement = players with at least 1 minigame start / activated players`

Useful secondary cuts:

- reward apply rate
- OO bonus rate

## 8. Save Coverage

Definition:

Share of players whose progress is persisted server-side.

Formula:

`Save Coverage = players with at least 1 successful server save / activated players`

## Calculation Notes

## New Player

Recommended definition:

- first-ever visit to `idle.php`

## Active Player

Recommended definition:

- player with at least one gameplay session or successful save on a given day

## Session

Recommended rule:

- a new session begins after 30 minutes of inactivity

## Prestige Event

Recommended rule:

- count prestige when the prestige action succeeds and the save reflects `prestige = previous prestige + 1`

## Dungeon Start

Recommended rule:

- count when a class is selected and gameplay begins

## Dungeon Clear

Recommended rule:

- count only when the reward flow succeeds with `dungeon_clear`

## KPI Dashboard Starter Set

A minimal first dashboard should contain:

- new idle players
- activation rate
- D1 retention
- average idle session length
- login conversion
- prestige conversion
- dungeon engagement

## Recommended Success Read

In the current product, the clearest proof of health is:

- players activate into the idle loop
- a meaningful share convert to login
- a meaningful share reach first prestige
- level-5 players actually sample dungeon

That sequence reflects the real structure of the game better than pageviews alone.
