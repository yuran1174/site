# Agent: Game Developer

Project root: `D:\OSPanel\home\site.local`

## Read First

- `.claude/CLAUDE.md`
- `.claude/CHANGELOG.md`
- `TODO.md`
- `docs/game/narrative-season-1.md`
- `docs/game/season-1-character-roster.md`
- `docs/game/season-1-mvp-state-schema.md`
- `docs/game/season-1-mvp-action-catalog.md`
- `docs/game/season-1-idle-redesign-framework.md`
- `docs/game/season-1-idle-core-loop-spec.md`
- `docs/game/season-1-idle-main-screen-spec.md`

## Assigned Focus

- первый рабочий браузерный idle-slice новой версии season 1 на `Phaser + TypeScript`

## Goal

- Начать разработку новой браузерной версии игры как `character-driven life-management idle`.
- Сохранить проект в формате idle-игры, а не уводить его в pure life sim.
- Собрать новый рабочий idle-loop под season 1 на `Phaser + TypeScript`.

## Language

- Все сообщения пользователю, итоговые отчёты, вопросы и пояснения должны быть на русском языке.
- Документацию писать на русском, если нет сильной причины использовать английский.

## Product Thesis

Новая игра должна быть не про абстрактный idle-калькулятор и не про ручное проживание каждого вечера.

Она должна быть про настройку и развитие жизненного цикла героя, который работает как осмысленный idle-loop.

Короткая формула:

`idle management + adult routine + project growth + character progression + pixel-life fantasy`

## Technology Thesis

- Реализация должна идти в браузерном стеке.
- Основной runtime и экранная логика должны быть на `Phaser + TypeScript`.
- Архитектура должна быть data-driven.
- Код должен быть удобен для дальнейшей агентной разработки.
- Нельзя строить хаос из ad-hoc legacy-скриптов.

## Main Principle

- Делать vertical slice новой idle-игры, а не giant rewrite всего проекта.
- Игрок должен управлять рутиной, режимами, слотами, фокусами и связями.
- Игра должна сама тикать и производить последствия.
- Сценарий должен работать как слой unlock'ов и системных модификаторов поверх idle-loop.
- Новый браузерный runtime должен быть собран отдельно и чисто.

## Do

1. Изучи текущую структуру браузерного фронтенда.
2. Выбери, где и как поднять новый `Phaser` runtime.
3. Коротко объясни пользователю, какой entrypoint/runtime выбран и почему.
4. Создай базовую структуру нового frontend-модуля.
5. Собери новый главный экран по `docs/game/season-1-idle-main-screen-spec.md`.
6. Реализуй минимальный runtime state под новую idle-модель.
7. Реализуй базовый auto-tick loop.
8. Реализуй управление циклом через:
   - `life_mode`
   - вечерние слоты
   - `project_focus`
   - `social_priority`
9. Реализуй result layer после idle-прогона.
10. Реализуй базовые `alerts`.
11. Подключи минимум 2-3 персонажей как meaningful idle modifiers.
12. Проверь, что старая версия проекта не сломана.
13. Держи `TODO.md` в синхроне:
   - если добавляешь новую dev-задачу, у неё должен быть `Status`
   - во время работы ставь `in_progress`
   - по завершении ставь `done`, `partial` или `blocked`

## Required Systems For V1

### 1. `life_mode`

Должны существовать режимы:

- `survival`
- `side_hustle`
- `recovery`
- `project_focus`
- `people_focus`

### 2. Evening slots

Нужно реализовать минимум 2 вечерних слота:

- хотя бы один всегда доступен
- второй может зависеть от состояния героя

### 3. `project_focus`

Должны существовать:

- `clarify`
- `build`
- `polish`
- `show`

### 4. Minimum auto-ticks

Нужно реализовать:

- economy tick
- energy tick
- project tick
- relationship readiness tick
- room state tick

### 5. Minimum alerts

Нужно реализовать:

- `money_crunch`
- `burnout_risk`
- `room_decline`

### 6. Minimum positive states

Нужно реализовать:

- `stable_routine`
- `project_flow`

### 7. Result layer

После idle-прогона игрок должен видеть минимум:

- `money_delta`
- `energy_delta`
- `project_delta`
- `bond_delta`
- `room_delta`

## What Must Be On Screen

Главный экран должен включать:

- `Top HUD`
- `Room Stage`
- `Idle Results Rail`
- `Routine Controls Panel`
- `Project Panel`
- `People / Circle Panel`
- `Cycle Alerts`

## Technical Requirements

- использовать `TypeScript`
- собрать новый браузерный runtime отдельно и чисто
- не делать giant rewrite старого PHP/JS слоя
- если нужно, поднять новый отдельный frontend entrypoint для новой игры
- структура кода должна быть понятной для дальнейшей агентной разработки
- разделить хотя бы базово:
  - state
  - tick resolver
  - UI scene
  - config/content data
  - domain logic

## Preferred Project Structure

- `src/season1/` или аналогичный отдельный модуль для новой игры
- отдельные файлы или модули для:
  - game state
  - tick processing
  - life modes
  - project systems
  - relationship systems
  - room systems
  - UI panels
  - content/config definitions

## UX Requirement

Игрок не должен прожимать каждый час вручную.

Правильный session flow:

1. зайти
2. быстро считать итог цикла
3. понять, что сломалось или что пошло хорошо
4. подкрутить рутину
5. снова отпустить игру жить

Если новая версия ощущается как ручной daily sim, задача сделана неправильно.

## Visual Direction

- Не делать корпоративный dashboard.
- Не возвращать старый idle-shop UI.
- Ориентироваться на pixel-life presentation.
- Комната героя должна быть центральной сценой.
- Интерфейс должен ощущаться как living dashboard взрослой жизни, а не таблица множителей.
- Тон можно держать в зоне `Punch Club`, но без копирования.

## Expected Deliverables

- новый idle-entrypoint или browser runtime
- новый главный экран новой idle-версии
- минимальный runtime state
- базовый auto-tick loop
- управление через `life_mode`, slots, `project_focus`, `social_priority`
- result layer и alerts
- первые meaningful idle modifiers через персонажей

## Acceptance Criteria

- новая версия ощущается как idle-игра
- игрок настраивает цикл, а не проживает всё вручную
- auto-ticks реально меняют состояние
- room/project/people читаются как части одной системы
- хотя бы базово чувствуется fantasy новой игры
- `Phaser` runtime реально работает в браузере
- UI соответствует новой idle-спеке хотя бы на MVP-уровне
- старая версия проекта не сломана

## Constraints

- Не уводить игру в pure life sim.
- Не собирать visual novel вместо idle.
- Не возвращать старую систему `LOC`, `OO`, `prestige`, `abstract units`.
- Не строить giant shop и multiplier dashboard.
- Не размазываться на `dungeon`, `minigame`, `leaderboard`.
- Не делать полный rewrite всего проекта за один заход.

## Preferred Build Strategy

- Сначала выбрать самый дешёвый безопасный entrypoint для нового browser idle-slice.
- Если лучше делать отдельную страницу или route, так и делай.
- Не ломай существующий `idle.php`, если это не требуется явно.
- Если можно изолировать новый slice от legacy-ядра, это предпочтительно.
- Делай вертикально, а не архитектурно-идеально.

## What Not To Do

- не переписывать весь фронтенд проекта заранее
- не переделывать всю систему сохранений заранее
- не тащить legacy idle UI в новую игру по инерции
- не расползаться в инфраструктурный рефактор, если задача уже playable без него
- не заменять idle-loop сценами и длинными ручными цепочками действий
- не писать всё в один giant file
- не делать временную кашу "лишь бы работало"

## After Completion

1. Обнови `.claude/CHANGELOG.md`.
2. Обнови `TODO.md`, если добавлялась или двигалась dev-задача.
3. Сделай commit и push только со своими файлами.
4. В итоговом отчёте укажи:
   - какой entrypoint или runtime выбран
   - что реализовано
   - какие файлы созданы или изменены
   - что проверено
   - какие ограничения остались
   - какой следующий production-шаг теперь логичен
