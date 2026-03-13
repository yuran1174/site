# Agent: Game Developer

Project root: `D:\OSPanel\home\site.local`

## Read First

- `.claude/CLAUDE.md`
- `.claude/CHANGELOG.md`
- `TODO.md`
- `docs/game/season-1-design-framework.md`
- `docs/game/season-1-day-loop.md`
- `docs/game/season-1-core-systems.md`
- `docs/game/season-1-mvp-state-schema.md`
- `docs/game/season-1-main-screen-ia.md`
- `docs/game/season-1-legacy-cut-list.md`
- `docs/game/season-1-mvp-action-catalog.md`

## Assigned Focus

- первый playable vertical slice новой игры season 1

## Goal

- Начать реальную разработку нового ядра игры как отдельного vertical slice.
- Не трогать существующий `idle.php`.
- Не ломать legacy runtime.

## Language

- Все сообщения пользователю, итоговые отчёты, вопросы и пояснения должны быть на русском языке.
- Документацию писать на русском, если нет сильной причины использовать английский.

## Main Principle

- Делать не большой rewrite, а отдельный рабочий slice.
- Новая игра должна жить отдельно от старого idle-режима.
- Приоритет: playable flow, а не идеальная архитектура.

## Do

1. Изучи текущие entrypoint'ы, page adapters и существующий runtime.
2. Выбери отдельный entrypoint для новой игры:
   - не `idle.php`
   - нейтральное имя вроде `season1.php` или `life.php`
3. Коротко объясни пользователю, какой entrypoint выбран и почему.
4. Собери первый vertical slice новой игры как отдельную страницу/маршрут.
5. Реализуй минимальный runtime state для:
   - `calendar`
   - `resources`
   - `hero`
   - `project`
   - `relationships`
   - `group`
   - `room`
6. Собери UI-скелет главного экрана:
   - статус дня
   - состояние комнаты/жизни
   - проект
   - люди
   - вечерние действия
7. Реализуй минимум 5 действий из action catalog:
   - `sleep_early`
   - `take_small_side_gig`
   - `capture_project_notes`
   - `message_max`
   - `friday_hangout`
8. Реализуй один рабочий цикл:
   - выбор вечернего действия
   - изменение state
   - завершение дня
   - переход к следующему дню
9. Добавь минимальные unlock/guards:
   - не все действия доступны всегда
   - часть действий зависит от state
10. Проверь, что старая игра и `idle.php` не затронуты.
11. Держи `TODO.md` в синхроне:
   - если добавляешь задачу под vertical slice, у неё должен быть `Status`
   - во время работы ставь `in_progress`
   - по завершении ставь `done`, `partial` или `blocked`

## Expected Deliverables

- новый отдельный page/route entrypoint новой игры
- минимальный playable vertical slice
- рабочий day resolution loop
- базовый state contract под новую модель
- UI-скелет главного экрана новой игры

## Acceptance Criteria

- новая игра открывается отдельно от `idle.php`
- можно прожить несколько внутриигровых дней подряд
- видны изменения ресурсов, проекта, людей и состояния жизни
- минимум 5 действий реально работают через state changes
- есть хотя бы базовые unlock conditions
- старая idle-игра не сломана

## Constraints

- Не использовать `idle.php` как базу для новой игры.
- Не переносить старый idle loop, `prestige`, `LOC`, `OO`.
- Не делать `dungeon`, `minigame`, `leaderboard` частью новой игры.
- Не строить полный сюжетный runtime.
- Не пытаться за один заход собрать весь season 1.
- Не делать большой rewrite старой системы ради нового slice.

## Preferred Build Strategy

- Если дешевле и чище поднять новый slice через Laravel route/view, используй этот путь.
- Если для первого шага проще сделать отдельный page adapter, это допустимо.
- Главное: новая игра должна быть изолирована от старого runtime настолько, насколько это возможно без лишней инженерной церемонии.

## What Not To Do

- не переписывать весь фронтенд проекта
- не переделывать всю систему сохранений заранее
- не тащить legacy idle UI в новую игру по инерции
- не расползаться в инфраструктурный рефактор, если задача уже playable без него

## After Completion

1. Обнови `.claude/CHANGELOG.md`.
2. Обнови `TODO.md`, если добавлялась или двигалась задача.
3. Сделай commit и push только со своими файлами.
4. В итоговом отчёте укажи:
   - что реализовано
   - какой entrypoint выбран
   - какие файлы созданы или изменены
   - что проверено
   - какие ограничения остались у vertical slice
