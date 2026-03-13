## 2026-03-13 — Закрыт TASK-064: описан цикл одного внутриигрового дня для season 1

**Что сделано:**
- Добавлен `docs/game/season-1-day-loop.md` с фазами дня, ролями ресурсов (`время`, `энергия`, `деньги`, `импульс`, `связь`) и основными вечерними действиями
- Зафиксированы типы исходов дня, мягкие fail states, недельный ритм и narrative trigger model для сцен акта 1
- Определён safe MVP daily loop, который можно использовать как первый игровой прототип новой версии проекта
- В `TODO.md` добавлена и закрыта задача `TASK-064`

**Файлы затронуты:**
- `docs/game/season-1-day-loop.md` (создан)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Закрыт TASK-063: сезон 1 переведён в новую продуктовую рамку

**Что сделано:**
- Добавлен `docs/game/season-1-design-framework.md`, который переводит `narrative-season-1.md` из сценарного каркаса в системный дизайн-тезис игры
- Зафиксирован прямой конфликт текущей idle/prestige модели с сезоном `Скуф-пати` и перечислены системы, которые нужно сохранить, убрать или радикально переосмыслить
- Описаны новый core loop, meta loop, ресурсная модель, роль персонажей и типы активностей для игры, построенной вокруг сборки команды, а не power-fantasy роста
- В `TODO.md` добавлена и закрыта задача `TASK-063`

**Файлы затронуты:**
- `docs/game/season-1-design-framework.md` (создан)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Закрыт TASK-062: зафиксирован data-driven контракт active abilities

**Что сделано:**
- Добавлен `docs/game/idle-abilities-schema.md` с конфиг-схемой `abilitySystem`, моделью `slotUnlocks`, `abilities`, runtime-state и save/load контрактом для active abilities
- Зафиксированы runtime hooks, требования к prestige shop, analytics payloads и минимальные server-side guardrails для save validation
- Описан безопасный rollout по фазам: infrastructure -> MVP abilities -> midgame depth -> risk/reward expansion
- В `TODO.md` добавлена и закрыта задача `TASK-062`

**Файлы затронуты:**
- `docs/game/idle-abilities-schema.md` (создан)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Закрыт TASK-061: спроектирован слой активных способностей для idle-ядра

**Что сделано:**
- Добавлен `docs/game/idle-active-abilities.md` с продуктовым обоснованием active ability layer как midgame-системы между базовой idle-экономикой и prestige loop
- Зафиксированы роль способностей в прогрессии, unlock rules через prestige/account progression, модель слотов и cooldown guardrails
- Описан стартовый набор способностей (`Экстренный деплой`, `Code Review`, `Фокус-спринт`, `Ночной релиз`) с fantasy, ролью, рисками и границами баланса
- В `TODO.md` добавлена и закрыта задача `TASK-061`

**Файлы затронуты:**
- `docs/game/idle-active-abilities.md` (создан)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Закрыт TASK-026: зафиксирована стратегия frontend build step

**Что сделано:**
- Добавлен `docs/frontend/build-strategy.md` с решением не вводить build step на текущем этапе
- Зафиксированы причины отказа от bundler сейчас: modular JS уже есть, SPA/toolchain потребности нет, а прямые PHP entrypoint'ы остаются самым дешёвым и надёжным вариантом
- Описаны триггеры, при которых переход на сборку станет обязательным, и предпочтительный кандидат для будущего шага — `Vite`
- В `TODO.md` задача `TASK-026` переведена в `done`

**Файлы затронуты:**
- `docs/frontend/build-strategy.md` (создан)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Закрыт TASK-025: введён общий CSS token-layer и правила стилей

**Что сделано:**
- Добавлен общий слой токенов `css/tokens.css` с цветами, шрифтами, радиусами, тенями и transition baseline
- `css/auth.css`, `css/idle.css`, `css/style.css`, `css/game.css`, `css/dungeon.css` и `css/minigame.css` переведены на импорт общих токенов
- В page-level `:root` оставлены только осознанные overrides, где тема действительно отличается
- Добавлен документ `docs/frontend/css-conventions.md` с правилами по токенам, overrides и дальнейшему росту CSS-структуры
- В `TODO.md` задача `TASK-025` переведена в `done`

**Файлы затронуты:**
- `css/tokens.css` (создан)
- `docs/frontend/css-conventions.md` (создан)
- `css/auth.css` (обновлён)
- `css/idle.css` (обновлён)
- `css/style.css` (обновлён)
- `css/game.css` (обновлён)
- `css/dungeon.css` (обновлён)
- `css/minigame.css` (обновлён)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Исправлено затирание наград из мини-игр и подземелья

**Что сделано:**
- Исправлен merge save-состояния в `GameSaveService`: более старый клиентский `save` больше не затирает уже начисленные на сервере награды, dungeon clears, OO, story/achievement progress и уровни prestige shop
- Добавлена серверная reconciliation-логика для `totalLoc`, `totalPrestigePoints`, `prestigePoints`, `dungeonClears`, `maxOffline` и persistent-флагов прогресса
- Исправлен client-side merge в `js/idle-save.js`: при загрузке из более нового local save теперь подмешиваются `prestigePoints`, `totalPrestigePoints`, `prestige`, `prestigeShop` и `maxOffline`
- Добавлен регрессионный интеграционный тест на сценарий, где reward уже применён на сервере, а затем приходит устаревший `save`

**Файлы затронуты:**
- `src/Application/GameSave/GameSaveService.php` (обновлён)
- `js/idle-save.js` (обновлён)
- `tests/Integration/GameSaveServiceTest.php` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Закрыт TASK-024: повторяющиеся PHP UI-фрагменты вынесены в partials

**Что сделано:**
- Добавлены `templates/partials/app-head.php`, `templates/partials/page-nav.php` и `templates/partials/logout-script.php`
- Общий `<head>` с шрифтами, favicon, стилями и опциональными head-вставками больше не дублируется по страницам
- Повторяющийся `page-nav` вынесен из `profile.php` и `leaderboard.php` в общий partial с конфигом через массив ссылок
- Дублирующийся logout-скрипт убран из `idle.php`, `profile.php` и `leaderboard.php`
- В `TODO.md` задача `TASK-024` переведена в `done`

**Файлы затронуты:**
- `templates/partials/app-head.php` (создан)
- `templates/partials/page-nav.php` (создан)
- `templates/partials/logout-script.php` (создан)
- `auth.php` (обновлён)
- `index.php` (обновлён)
- `game.php` (обновлён)
- `dungeon.php` (обновлён)
- `minigame.php` (обновлён)
- `profile.php` (обновлён)
- `leaderboard.php` (обновлён)
- `idle.php` (обновлён)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Завершён TASK-021 по серверной валидации и anti-cheat baseline

**Что сделано:**
- Усилена серверная нормализация save payload в `GameSaveService`: `prestigeShop` теперь whitelist'ится по известным item id и режется по server-side `maxLevel`
- `maxOffline` теперь ограничивается серверно-допустимым максимумом на основе `offline_boost`, а `prestigePoints` не могут превышать `totalPrestigePoints`
- Слишком большие скачки `totalPrestigePoints` теперь не только логируются, но и режутся до безопасного порога
- Добавлены интеграционные тесты для shop/maxOffline и OO-инвариантов, обновлены `TODO.md` и `docs/security/anti-cheat-baseline.md`

**Файлы затронуты:**
- `src/Application/GameSave/GameSaveService.php` (обновлён)
- `tests/Integration/GameSaveServiceTest.php` (обновлён)
- `docs/security/anti-cheat-baseline.md` (обновлён)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Закрыт TASK-035: зафиксирован baseline продуктовой аналитики событий

**Что сделано:**
- Создан `docs/product/analytics-events.md` с каталогом продуктовых событий первой очереди: `session_started`, `idle_activated`, `building_purchased`, `upgrade_purchased`, `prestige_started`, `prestige_completed`, `prestige_shop_purchase`, `minigame_started`, `minigame_finished`, `minigame_reward_applied`, `dungeon_started`, `dungeon_finished`, `auth_registered`, `auth_logged_in`, `save_succeeded`
- Для каждого события зафиксированы trigger, обязательные payload-поля, actor scope и привязка к KPI из `docs/product/metrics.md`
- Создан `docs/data/analytics-events-storage.md` с отдельной storage strategy для analytics: append-only таблица `analytics_events`, индексы первой очереди, правила идентичности, дедупликации и границы отделения от `game_saves`/`security.log`
- В `TODO.md` задача `TASK-035` переведена в `done`

**Файлы затронуты:**
- `docs/product/analytics-events.md` (создан)
- `docs/data/analytics-events-storage.md` (создан)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Закрыты TASK-036, TASK-038, TASK-039 и TASK-040 по game systems

**Что сделано:**
- Добавлен `data/game/idle-balance.js`, в который вынесены здания, апгрейды, достижения, сюжетные главы, события и их rule-based условия; `idle.php` и `js/idle.js` переведены на новый data-driven источник
- Создан `docs/game/progression-model.md` с формализацией ранa, prestige loop, account level, dungeon reward loop и unlock pacing как единой системы прогрессии
- Создан `docs/game/product-stubs.md`; misleading unlock на несуществующий `pvp.php` убран из runtime UI, а PVP и сезонные события помечены как planned features без ложной навигации
- Создан `docs/game/seasonal-events.md` с моделью seasonal definitions, modifiers, missions, rewards и reward hooks для будущего live-ops слоя
- В `TODO.md` задачи `TASK-036`, `TASK-038`, `TASK-039`, `TASK-040` переведены в `done`

**Файлы затронуты:**
- `data/game/idle-balance.js` (создан)
- `docs/game/progression-model.md` (создан)
- `docs/game/product-stubs.md` (создан)
- `docs/game/seasonal-events.md` (создан)
- `idle.php` (обновлён)
- `js/idle.js` (обновлён)
- `js/idle-render.js` (обновлён)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Исправлен запуск idle-игры после декомпозиции фронтенда

**Что сделано:**
- В `idle.php` приведён в порядок порядок подключения idle-скриптов и убран дублирующий `idle-balance.js`
- В `js/idle.js` убраны дубли функций, которые уже были вынесены в `js/idle-actions.js`, из-за чего страница падала с `Identifier has already been declared`
- В `js/idle-economy.js`, `js/idle-render.js` и `js/idle.js` добавлен compatibility bridge для shared state и legacy helper-вызовов между split-файлами
- Проверен JS lint после исправления: idle-скрипты больше не валятся на синтаксисе и дублирующихся декларациях

**Файлы затронуты:**
- `idle.php` (обновлён)
- `js/idle-economy.js` (обновлён)
- `js/idle-render.js` (обновлён)
- `js/idle.js` (обновлён)
- `js/idle-data.js` (используется как часть split-структуры)
- `js/idle-actions.js` (используется как часть split-структуры)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Закрыт TASK-023: idle frontend разложен на data/actions/runtime/render/save слои

**Что сделано:**
- Подключён отдельный источник игровых данных `data/game/idle-balance.js` и добавлен адаптер `js/idle-data.js`, который превращает raw balance data в runtime-структуры `BUILDINGS`, `UPGRADES`, `ACHIEVEMENTS`, `EVENTS` и `STORY_CHAPTERS`
- Добавлен `js/idle-actions.js` с игровыми действиями: random events, prestige, покупки, click handler, story/achievement checks
- `js/idle.js` сокращён до orchestration-слоя: состояние, compatibility bridge, tick loop, visibility/focus hooks, autosave и bootstrap страницы
- `idle.php` теперь подключает баланс, data и actions слои до основного `js/idle.js`
- В `TODO.md` задача `TASK-023` переведена в `done`

**Файлы затронуты:**
- `data/game/idle-balance.js` (используется как источник игровых данных)
- `js/idle-data.js` (создан)
- `js/idle-actions.js` (создан)
- `js/idle.js` (обновлён)
- `idle.php` (обновлён)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Приведён PHP-код к текущему formatter baseline

**Что сделано:**
- Прогнан `php-cs-fixer` по текущим PHP-файлам проекта
- Исправлены расхождения со style baseline в `ajax/`, `bootstrap/`, `src/Application/`, `src/Domain/`, `src/Infrastructure/`
- Повторно подтверждено, что `format:check`, PHPUnit, PHP lint и JS lint проходят успешно

**Файлы затронуты:**
- `ajax/auth.php` (обновлён)
- `ajax/save.php` (обновлён)
- `bootstrap/app.php` (обновлён)
- `src/Application/Auth/AuthController.php` (обновлён)
- `src/Application/Auth/AuthService.php` (обновлён)
- `src/Application/GameSave/GameSaveController.php` (обновлён)
- `src/Application/GameSave/GameSaveService.php` (обновлён)
- `src/Domain/Auth/UserData.php` (обновлён)
- `src/Domain/GameSave/GameSaveRecord.php` (обновлён)
- `src/Domain/Leaderboard/LeaderboardRecord.php` (обновлён)
- `src/Infrastructure/Database/MigrationRunner.php` (обновлён)
- `src/Infrastructure/Persistence/GameSaveRepository.php` (обновлён)
- `src/Infrastructure/Persistence/LeaderboardRepository.php` (обновлён)
- `src/Infrastructure/Persistence/UserRepository.php` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Добавлен dev seed baseline и закрыт TASK-017

**Что сделано:**
- Добавлен `scripts/seed/dev-seed.php`, который создаёт или обновляет тестовых пользователей и их save/leaderboard данные в SQLite
- Добавлены seed-профили `storage/seed/profiles/early-game.json`, `mid-game.json`, `late-game.json` для трёх стадий прогрессии
- Добавлена документация `storage/seed/README.md` и composer-команда `composer seed:dev`
- В `TODO.md` задача `TASK-017` переведена в `done`

**Файлы затронуты:**
- `scripts/seed/dev-seed.php` (создан)
- `storage/seed/README.md` (создан)
- `storage/seed/profiles/early-game.json` (создан)
- `storage/seed/profiles/mid-game.json` (создан)
- `storage/seed/profiles/late-game.json` (создан)
- `composer.json` (обновлён)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Зафиксирована стратегия роста БД и закрыт TASK-016

**Что сделано:**
- Создан `docs/data/sqlite-vs-postgres.md` с decision record по текущему выбору SQLite и условиям обязательного перехода на PostgreSQL
- Зафиксированы фактические SQLite-first ограничения текущей инфраструктуры: `sqlite:` DSN в `DatabaseManager`, SQLite-специфичный SQL и single-instance operational model
- Описаны триггеры перехода: multiple writers, event-heavy storage, server-authoritative gameplay, analytics/query pressure и более жёсткие требования к backup/restore
- В `TODO.md` задача `TASK-016` переведена в `done`

**Файлы затронуты:**
- `docs/data/sqlite-vs-postgres.md` (создан)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Продолжен TASK-023: из idle.js вынесены save/load и render слой

**Что сделано:**
- Добавлены `js/idle-save.js` и `js/idle-render.js`
- Вынесены local/server save, load, offline progress и merge логика гостевого/серверного сохранения
- Вынесены render-функции вкладок, activities bar, toasts, ticker, topbar и tab wiring
- `idle.php` теперь подключает runtime, economy, save и render слои до основного `js/idle.js`
- `TODO.md` уточнён: `TASK-023` остаётся `partial`, так как в монолите ещё сидят игровые данные, покупки, события и основной loop

**Файлы затронуты:**
- `js/idle-save.js` (создан)
- `js/idle-render.js` (создан)
- `js/idle.js` (обновлён)
- `idle.php` (обновлён)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Начат TASK-023: idle.js разделён на runtime/economy слой

**Что сделано:**
- Добавлены `js/idle-runtime.js` и `js/idle-economy.js` для выделения состояния, таймингов и базовой idle-экономики из монолитного `js/idle.js`
- `idle.php` теперь подключает runtime/economy-скрипты до основного `js/idle.js`
- `js/idle.js` переведён на использование вынесенных helper/runtime функций вместо локальных определений
- В `TODO.md` задача `TASK-023` переведена в `partial`, так как render/save/data-слои ещё не вынесены

**Файлы затронуты:**
- `js/idle-runtime.js` (создан)
- `js/idle-economy.js` (создан)
- `js/idle.js` (обновлён)
- `idle.php` (обновлён)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Зафиксирована стратегия хранения игровых данных и закрыт TASK-015

**Что сделано:**
- Создан `docs/data/storage-strategy.md` с решением по `users`, `game_saves`, `leaderboard`, security/audit logs и будущим analytics events
- Зафиксировано, что основной игровой snapshot пока остаётся в `game_saves.save_data` как JSON blob, а leaderboard хранится как отдельная серверная проекция
- Отдельно описаны сущности, которые пока не нужно выносить из JSON, и кандидаты на будущую нормализацию при росте продукта
- В `TODO.md` задача `TASK-015` переведена в `done`

**Файлы затронуты:**
- `docs/data/storage-strategy.md` (создан)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Убран direct DB access из оставшихся страниц и endpoint'ов

**Что сделано:**
- `ajax/auth.php` и `ajax/save.php` переведены с `DB::get()` на `DatabaseManager::connection()`
- `profile.php`, `leaderboard.php` и `dungeon.php` переведены на репозитории вместо прямого SQL из страницы
- В `UserRepository` и `LeaderboardRepository` добавлены read-методы для page-level сценариев
- `AppBootstrap` больше не подтягивает legacy `db.php` как обязательную зависимость

**Файлы затронуты:**
- `ajax/auth.php` (обновлён)
- `ajax/save.php` (обновлён)
- `profile.php` (обновлён)
- `leaderboard.php` (обновлён)
- `dungeon.php` (обновлён)
- `src/Bootstrap/AppBootstrap.php` (обновлён)
- `src/Infrastructure/Persistence/UserRepository.php` (обновлён)
- `src/Infrastructure/Persistence/LeaderboardRepository.php` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Закрыт TASK-029: добавлен JS lint baseline и обновлён composer lint

**Что сделано:**
- Добавлен lightweight JS lint runner `tests/Tools/js-lint.mjs`, который прогоняет `node --check` по `js/*.js` и проверяет запрещённые паттерны из `.js-lint.json`
- `composer lint` разделён на `lint:php` и `lint:js`, чтобы качество PHP и JS прогонялось одной командой
- CI workflow дополнен `actions/setup-node@v4`, а шаг lint теперь запускает общий `composer lint`
- Integration tests переведены на новые repository-based сигнатуры `AuthService` и `GameSaveService`, а `DatabaseTestCase` получил более устойчивую очистку временной SQLite-базы под Windows
- В `TODO.md` задача `TASK-029` переведена в `done`

**Файлы затронуты:**
- `.js-lint.json` (создан)
- `tests/Tools/js-lint.mjs` (создан)
- `tests/Integration/AuthServiceTest.php` (обновлён)
- `tests/Integration/GameSaveServiceTest.php` (обновлён)
- `tests/Support/DatabaseTestCase.php` (обновлён)
- `composer.json` (обновлён)
- `.github/workflows/ci.yml` (обновлён)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Синхронизированы статусы Architecture Audit задач в TODO

**Что сделано:**
- В `TODO.md` задачи `TASK-001` и `TASK-002` переведены в `done`
- Для обеих задач добавлены примечания, ссылающиеся на уже существующие документы архитектурного аудита и техрисков
- TODO приведён в соответствие с фактическим состоянием deliverables `Architecture Audit`

**Файлы затронуты:**
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Исправлен dev-reset прогресса в браузере

**Что сделано:**
- Выяснено, что при `reload` старый прогресс успевал сохраняться обратно через autosave и `beforeunload`
- В `js/idle-save.js` сохранения блокируются, если активен флаг `__DEV_RESETTING_PROGRESS`
- В `js/idle.js` пропускаются `saveGame()` на `visibilitychange` и `beforeunload` во время dev-reset
- В `idle.php` browser helper теперь включает `__DEV_RESETTING_PROGRESS`, сбрасывает in-memory state и только потом чистит `localStorage` и перезагружает страницу

**Файлы затронуты:**
- `js/idle-save.js` (обновлён)
- `js/idle.js` (обновлён)
- `idle.php` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Добавлена браузерная dev-команда для сброса прогресса аккаунта

**Что сделано:**
- В `GameSaveService` добавлен dev-reset серверного прогресса аккаунта
- В `GameSaveController` добавлен action `reset_progress` с CSRF, rate limit и ограничением только для `development`
- В `idle.php` добавлена браузерная helper-команда `window.devResetAccountProgress()`
- Команда очищает серверный прогресс, удаляет локальный `kodikofee_save` и перезагружает страницу

**Файлы затронуты:**
- `src/Application/GameSave/GameSaveService.php` (обновлён)
- `src/Application/GameSave/GameSaveController.php` (обновлён)
- `idle.php` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Добавлена dev-команда для сброса прогресса аккаунта

**Что сделано:**
- Добавлен CLI-скрипт `scripts/dev/reset-account-progress.php` для сброса серверного прогресса аккаунта по `--username` или `--user-id`
- В `composer.json` добавлена команда `composer dev:reset-account`
- В persistence-слой добавлены методы удаления сохранения и записи лидерборда для пользователя
- Скрипт явно предупреждает про необходимость очистить браузерный `localStorage`, чтобы старый прогресс не был отправлен обратно

**Файлы затронуты:**
- `composer.json` (обновлён)
- `scripts/dev/reset-account-progress.php` (создан)
- `src/Infrastructure/Persistence/GameSaveRepository.php` (обновлён)
- `src/Infrastructure/Persistence/LeaderboardRepository.php` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Добавлены агенты геймдизайнера и сценариста

**Что сделано:**
- Создан `agents/game-designer.md` для системного проектирования механик, прогрессии, баланса и контентных игровых решений
- Создан `agents/scenario-writer.md` для нарративных задач: сюжет, диалоги, события, текстовый контент и атмосфера проекта
- Оба агента оформлены в общем проектном формате: русский язык, синхронизация `TODO.md`, безопасный `push.sh`, changelog и ограничения по тону/масштабу правок

**Файлы затронуты:**
- `agents/game-designer.md` (создан)
- `agents/scenario-writer.md` (создан)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Синхронизированы статусы Product Analyst задач в TODO

**Что сделано:**
- В `TODO.md` задачи `TASK-003` и `TASK-004` переведены в `done`
- Для обеих задач добавлены примечания, привязанные к уже существующим продуктовым deliverables
- Фактическое состояние TODO синхронизировано с ранее созданными документами `docs/product/*`

**Файлы затронуты:**
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Добавлен CI baseline для composer, lint и тестов

**Что сделано:**
- Добавлен GitHub Actions workflow `.github/workflows/ci.yml`
- На `push` в `main` и на `pull_request` выполняются `composer validate`, `composer install`, `composer lint`, `composer test` и `composer format:check`
- В `TODO.md` задача `TASK-030` переведена в `done` с примечанием по текущему coverage CI

**Файлы затронуты:**
- `.github/workflows/ci.yml` (создан)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Добавлен DevOps baseline: onboarding, env strategy, deploy и monitoring docs

**Что сделано:**
- Добавлен `README.md` с инструкцией локального запуска, env setup, миграциями и командами качества
- Добавлен `docs/devops/environments.md` с разделением `development` / `stage` / `production`
- Добавлен `docs/devops/deploy.md` с baseline release flow, rollback и backup strategy
- Добавлен `docs/devops/monitoring.md` с baseline error logging, uptime checks и SQLite health signals
- В `TODO.md` задачи `TASK-031`, `TASK-032`, `TASK-033`, `TASK-034` переведены в `done`

**Файлы затронуты:**
- `README.md` (создан)
- `docs/devops/environments.md` (создан)
- `docs/devops/deploy.md` (создан)
- `docs/devops/monitoring.md` (создан)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Введена система миграций и закрыт TASK-014

**Что сделано:**
- Добавлен `MigrationRunner` с таблицей `schema_migrations`
- `SchemaInitializer` переведён с runtime schema patching на применение SQL-миграций из директории `migrations/`
- Добавлена initial migration `migrations/0001_initial_schema.sql` с актуальной схемой `users`, `game_saves`, `leaderboard`
- В `config/database.php` и `.env.example` добавлен путь до миграций
- Создана документация `docs/data/migration-flow.md`
- В `TODO.md` `TASK-014` переведён в `done`

**Файлы затронуты:**
- `.env.example` (обновлён)
- `config/database.php` (обновлён)
- `src/Infrastructure/Database/SchemaInitializer.php` (обновлён)
- `src/Infrastructure/Database/MigrationRunner.php` (создан)
- `migrations/0001_initial_schema.sql` (создан)
- `docs/data/migration-flow.md` (создан)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Доведён DB infrastructure layer и закрыт TASK-009

**Что сделано:**
- `AppBootstrap` больше не подтягивает `db.php` как часть обязательного старта приложения
- `ajax/auth.php` и `ajax/save.php` переведены на `DatabaseManager::connection()` вместо `DB::get()`
- `profile.php`, `leaderboard.php`, `dungeon.php` переведены с прямого доступа к `DB::get()` на инфраструктурный/persistence слой
- `UserRepository` и `LeaderboardRepository` расширены методами для чтений, нужных страницам
- В runtime-коде больше нет прямых вызовов `DB::get()`; `db.php` остался как compatibility shim
- В `TODO.md` `TASK-009` переведён в `done`

**Файлы затронуты:**
- `src/Bootstrap/AppBootstrap.php` (обновлён)
- `src/Infrastructure/Persistence/UserRepository.php` (обновлён)
- `src/Infrastructure/Persistence/LeaderboardRepository.php` (обновлён)
- `ajax/auth.php` (обновлён)
- `ajax/save.php` (обновлён)
- `profile.php` (обновлён)
- `leaderboard.php` (обновлён)
- `dungeon.php` (обновлён)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Доведён config-слой и закрыт TASK-008

**Что сделано:**
- Расширен `.env.example`: добавлены app/session/storage-переменные, которые реально используются рантаймом
- Добавлены `config/security.php` и `config/storage.php`
- `src/Bootstrap/Config.php` переведён на автозагрузку всех `config/*.php`, а `AppBootstrap` теперь использует config и для `log_errors`
- `security.php` перестал держать session/storage-настройки как runtime-хардкоды и читает их через config-слой
- В `TODO.md` `TASK-008` переведён в `done`

**Файлы затронуты:**
- `.env.example` (обновлён)
- `config/app.php` (обновлён)
- `config/security.php` (создан)
- `config/storage.php` (создан)
- `src/Bootstrap/Config.php` (обновлён)
- `src/Bootstrap/AppBootstrap.php` (обновлён)
- `security.php` (обновлён)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Обновлены статусы TODO после завершения controller/repository/API слоя

**Что сделано:**
- В `TODO.md` переведены в `done` задачи `TASK-010`, `TASK-011`, `TASK-012`, `TASK-013`
- Для этих задач уточнены примечания по фактическим deliverables: контроллеры, сервисы, репозитории, DTO и документация API уже присутствуют в проекте
- `TASK-008` и `TASK-009` оставлены в `partial`, потому что конфиг-слой и отказ от legacy `DB::get()` ещё не доведены до финальной точки

**Файлы затронуты:**
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Актуализирован TODO по выполненным и частично выполненным backend/refactor задачам

**Что сделано:**
- В `TODO.md` проставлены статусы для `TASK-005`, `TASK-006`, `TASK-007`
- Для `TASK-008`, `TASK-009`, `TASK-010`, `TASK-011`, `TASK-013` добавлены пометки `partial` с конкретными примечаниями о том, что уже сделано и что ещё осталось довести
- Статусы согласованы с фактическим состоянием кода, без искусственного “закрытия” незавершённых задач

**Файлы затронуты:**
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Вынесены auth/save сервисы и DB переведена на infrastructure layer

**Что сделано:**
- `db.php` переведён в thin wrapper над `App\Infrastructure\Database\DatabaseManager`
- `bootstrap/app.php` получил fallback PSR-4 autoload, чтобы новый слой в `src/` работал даже без `vendor/autoload.php`
- `ajax/auth.php` переведён на `App\Application\Auth\AuthService` с сохранением текущих CSRF, rate limit и security log проверок
- Добавлен `src/Application/GameSave/GameSaveService.php`, в который вынесены чтение/нормализация/сохранение save payload, leaderboard update и reward flow
- `ajax/save.php` стал тоньше: security-проверки остались в endpoint, а save/domain-поведение делегировано сервису
- `ajax/excuse.php` переведён на единый bootstrap/API response слой

**Файлы затронуты:**
- `bootstrap/app.php` (обновлён)
- `db.php` (обновлён)
- `ajax/auth.php` (обновлён)
- `ajax/save.php` (обновлён)
- `ajax/excuse.php` (обновлён)
- `src/Application/GameSave/GameSaveService.php` (создан)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Поднят testing baseline: PHPUnit, lint и formatter

**Что сделано:**
- В `composer.json` добавлены dev-зависимости `phpunit/phpunit` и `friendsofphp/php-cs-fixer`, а также scripts: `test`, `lint`, `format`, `format:check`
- Добавлены `phpunit.xml.dist`, `.php-cs-fixer.dist.php` и test bootstrap в `tests/bootstrap.php`
- Созданы интеграционные тесты для `AuthService` и `GameSaveService`: регистрация, логин, save/load, покупка prestige, награды minigame/dungeon, античит-нормализация save payload
- Добавлен lightweight PHP lint runner `tests/Tools/php-lint.php`
- Проверки реально прогнаны: PHPUnit, PHP lint и `php-cs-fixer --dry-run`

**Файлы затронуты:**
- `composer.json` (обновлён)
- `composer.lock` (создан)
- `phpunit.xml.dist` (создан)
- `.php-cs-fixer.dist.php` (создан)
- `.gitignore` (обновлён)
- `tests/bootstrap.php` (создан)
- `tests/Support/DatabaseTestCase.php` (создан)
- `tests/Integration/AuthServiceTest.php` (создан)
- `tests/Integration/GameSaveServiceTest.php` (создан)
- `tests/Tools/php-lint.php` (создан)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-13 — Извлечён backend-слой: config, repositories, controllers и формат API

**Что сделано:**
- Дополнен `.env.example` переменной `DB_DRIVER` для явного описания драйвера БД
- Добавлены DTO и репозитории для пользователей, сохранений и leaderboard в `src/Domain/` и `src/Infrastructure/Persistence/`
- `AuthService` и `GameSaveService` переведены с прямого `PDO` на repositories
- Добавлены `AuthController` и `GameSaveController`, после чего `ajax/auth.php` и `ajax/save.php` стали thin adapters
- Добавлена документация `docs/api/response-format.md`

**Файлы затронуты:**
- `.env.example`
- `ajax/auth.php`
- `ajax/save.php`
- `src/Application/Auth/AuthService.php`
- `src/Application/Auth/AuthController.php`
- `src/Application/GameSave/GameSaveService.php`
- `src/Application/GameSave/GameSaveController.php`
- `src/Domain/Auth/UserData.php`
- `src/Domain/GameSave/GameSaveRecord.php`
- `src/Domain/Leaderboard/LeaderboardRecord.php`
- `src/Infrastructure/Persistence/UserRepository.php`
- `src/Infrastructure/Persistence/GameSaveRepository.php`
- `src/Infrastructure/Persistence/LeaderboardRepository.php`
- `docs/api/response-format.md`
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Усилены security-потоки auth/save и добавлен anti-cheat baseline

**Что сделано:**
- Добавлен `security.php` с безопасным стартом сессии, CSRF helper'ами, rate limiting и JSONL security-log в `storage/logs/security.log`
- `ajax/auth.php`: убран logout по GET, добавлены CSRF-проверки, rate limit и логирование неудачных/подозрительных auth-запросов
- `ajax/save.php`: добавлены CSRF-проверки, rate limit, базовая нормализация save payload, серверный пересчёт `prestigeMulti`, логирование подозрительных скачков и создание save-слоя для reward flow без существующей записи
- `auth.php`, `idle.php`, `profile.php`, `leaderboard.php`, `minigame.php`, `dungeon.php`, `js/idle.js`, `js/dungeon.js`: прокинут CSRF-токен во все state-changing запросы; logout переведён на POST
- Добавлена документация `docs/security/anti-cheat-baseline.md`

**Файлы затронуты:**
- `security.php` (создан)
- `ajax/auth.php` (обновлён)
- `ajax/save.php` (переписан)
- `auth.php` (обновлён)
- `idle.php` (обновлён)
- `profile.php` (обновлён)
- `leaderboard.php` (обновлён)
- `minigame.php` (обновлён)
- `dungeon.php` (обновлён)
- `js/idle.js` (обновлён)
- `js/dungeon.js` (обновлён)
- `docs/security/anti-cheat-baseline.md` (создан)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Введён единый bootstrap приложения

**Что сделано:**
- Добавлен `src/Bootstrap/AppBootstrap.php` с едиными сценариями инициализации для страниц, web-сессий и JSON API
- Добавлен `bootstrap/app.php` как общий вход в bootstrap с поддержкой Composer autoload и fallback на прямое подключение класса
- Корневые страницы и AJAX-эндпоинты переведены с прямых `require_once security.php/db.php` и `app_start_session()` на единый bootstrap
- Централизованы базовые runtime-настройки: error reporting, session start и JSON header для API

**Файлы затронуты:**
- `src/Bootstrap/AppBootstrap.php` (создан)
- `bootstrap/app.php` (создан)
- `index.php`
- `game.php`
- `auth.php`
- `idle.php`
- `profile.php`
- `leaderboard.php`
- `minigame.php`
- `dungeon.php`
- `ajax/auth.php`
- `ajax/save.php`
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Подключён Composer и базовый PSR-4 autoload

**Что сделано:**
- Добавлен `composer.json` с требованием `php ^8.3` и PSR-4 namespace `App\\` для каталога `src/`
- Добавлен `autoload-dev` для namespace `Tests\\`
- Создан минимальный smoke-класс `App\\Support\\ApplicationIdentity` в `src/` для проверки автозагрузки

**Файлы затронуты:**
- `composer.json` (создан)
- `src/Support/ApplicationIdentity.php` (создан)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Зафиксирована продуктовая модель и baseline-метрики

**Что сделано:**
- Проанализированы текущие пользовательские потоки: лендинг, текстовая игра, idle-ядро, престиж, подземелье, мини-игра, auth/profile/leaderboard
- Создан `docs/product/game-loop.md` с описанием ядра продукта, core loop, meta loop, active/passive активностей и primary/secondary механик
- Создан `docs/product/monetization-outline.md` с безопасным контуром монетизации без pay-to-win как основной стратегии
- Создан `docs/product/metrics.md` с baseline KPI и формулами расчёта activation, retention, average session length, login conversion, prestige conversion и dungeon engagement

**Файлы затронуты:**
- `docs/product/game-loop.md` (создан)
- `docs/product/monetization-outline.md` (создан)
- `docs/product/metrics.md` (создан)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Архитектурный аудит и техриски текущего состояния

**Что сделано:**
- Добавлена документация текущей архитектуры проекта с описанием страниц, AJAX-эндпоинтов, состояния, SQLite и потоков наград
- Добавлен технический аудит рисков с разбивкой по severity: `critical`, `high`, `medium`, `low`
- Зафиксированы предположения там, где код показывает непоследовательное поведение между клиентом и сервером

**Файлы затронуты:**
- `docs/architecture/current-state.md` (создан)
- `docs/audit/technical-risks.md` (создан)
- `.claude/CHANGELOG.md` (обновлён)

---

# CHANGELOG — История изменений проекта «Жизнь программиста»

> Каждое изменение фиксируется здесь. Новые записи добавляются **сверху**.
> Формат: дата, описание, затронутые файлы.

---

## 2026-03-12 — План целевой структуры проекта и безопасный scaffold каталогов

**Что сделано:**
- Создан документ `docs/architecture/target-structure.md` с описанием текущих структурных проблем, целевой структуры, поэтапной миграции и рисков
- Добавлены пустые каталоги `public/`, `src/`, `config/`, `storage/`, `migrations/`, `tests/` как безопасный scaffold без переноса рабочих файлов
- Зафиксировано, какие root-файлы и `ajax/`-эндпоинты должны временно остаться на месте и позже стать тонкими адаптерами

**Файлы затронуты:**
- `docs/architecture/target-structure.md` (создан)
- `public/.gitkeep` (создан)
- `src/.gitkeep` (создан)
- `config/.gitkeep` (создан)
- `storage/.gitkeep` (создан)
- `migrations/.gitkeep` (создан)
- `tests/.gitkeep` (создан)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Правила статусов задач добавлены в TODO и инструкции агентов

**Что сделано:**
- В `TODO.md` добавлены правила ведения `Status` для задач
- Зафиксированы допустимые статусы: `pending`, `in_progress`, `partial`, `done`, `blocked`
- В инструкции агентов добавлено требование синхронизировать статус своих задач в `TODO.md`

**Файлы затронуты:**
- `TODO.md` (обновлён)
- `agents/architecture-audit.md` (обновлён)
- `agents/product-analyst.md` (обновлён)
- `agents/refactor-plan.md` (обновлён)
- `agents/backend-extraction.md` (обновлён)
- `agents/security-hardening.md` (обновлён)
- `agents/testing-bootstrap.md` (обновлён)
- `agents/devops-baseline.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Скрипт push переведён в безопасный режим staging по явным файлам

**Что сделано:**
- `.claude/push.sh` переписан без `git add -A`
- Скрипт теперь стейджит только явно переданные пути или коммитит только уже staged-изменения
- Во все инструкции агентов добавлено требование передавать в `push.sh` только изменённые ими файлы
- В `.claude/CLAUDE.md` и `TODO.md` обновлены правила использования `push.sh`

**Файлы затронуты:**
- `.claude/push.sh` (обновлён)
- `.claude/CLAUDE.md` (обновлён)
- `agents/architecture-audit.md` (обновлён)
- `agents/product-analyst.md` (обновлён)
- `agents/refactor-plan.md` (обновлён)
- `agents/backend-extraction.md` (обновлён)
- `agents/security-hardening.md` (обновлён)
- `agents/testing-bootstrap.md` (обновлён)
- `agents/devops-baseline.md` (обновлён)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Инструкции агентов дополнены требованием писать на русском

**Что сделано:**
- Во все файлы `agents/*.md` добавлено языковое правило: общение с пользователем и итоговые отчёты должны быть на русском
- В `TODO.md` добавлено общее правило про русский язык для всех агентов

**Файлы затронуты:**
- `agents/architecture-audit.md` (обновлён)
- `agents/product-analyst.md` (обновлён)
- `agents/refactor-plan.md` (обновлён)
- `agents/backend-extraction.md` (обновлён)
- `agents/security-hardening.md` (обновлён)
- `agents/testing-bootstrap.md` (обновлён)
- `agents/devops-baseline.md` (обновлён)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Инструкции агентов дополнены требованием коммита и пуша

**Что сделано:**
- Во все файлы `agents/*.md` добавлено обязательное завершение задачи через `.claude/push.sh`
- В `TODO.md` добавлено общее правило: после каждой задачи агент должен обновить changelog, сделать коммит и пуш

**Файлы затронуты:**
- `agents/architecture-audit.md` (обновлён)
- `agents/product-analyst.md` (обновлён)
- `agents/refactor-plan.md` (обновлён)
- `agents/backend-extraction.md` (обновлён)
- `agents/security-hardening.md` (обновлён)
- `agents/testing-bootstrap.md` (обновлён)
- `agents/devops-baseline.md` (обновлён)
- `TODO.md` (обновлён)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Добавлены файлы инструкций для ручного запуска агентов

**Что сделано:**
- Создана папка `agents/` с готовыми инструкциями для ролей `Architecture Audit`, `Product Analyst`, `Refactor Plan`, `Backend Extraction`, `Security Hardening`, `Testing Bootstrap`, `DevOps Baseline`
- Каждая инструкция привязана к задачам из `TODO.md` и содержит ограничения, deliverables и acceptance criteria

**Файлы затронуты:**
- `agents/architecture-audit.md` (создан)
- `agents/product-analyst.md` (создан)
- `agents/refactor-plan.md` (создан)
- `agents/backend-extraction.md` (создан)
- `agents/security-hardening.md` (создан)
- `agents/testing-bootstrap.md` (создан)
- `agents/devops-baseline.md` (создан)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Добавлен master TODO для взросления проекта

**Что сделано:**
- Создан `TODO.md` с поэтапным планом перевода проекта из pet-project в поддерживаемый продукт
- Задачи разбиты по эпикам, приоритетам, типам агентов и критериям готовности
- Добавлен рекомендуемый порядок запуска агентов и общий Definition of Done

**Файлы затронуты:**
- `TODO.md` (создан)
- `.claude/CHANGELOG.md` (обновлён)

---

## 2026-03-12 — Мобильная адаптация / TG Mini App

**Что сделано:**
- `idle.php`, `dungeon.php`, `minigame.php`: добавлен Telegram Web App SDK (`telegram-web-app.js`)
- `css/idle.css`: fix `#rightPanel` на мобильном (min-height: 55vh вместо 500px), `@media (hover: none)` убирает sticky-hover, `touch-action: manipulation` на кнопках, `overflow-x: hidden`, улучшения для activitiesBar на узком экране, вкладки `#shopTabs` прокручиваются горизонтально
- `css/auth.css`: `overflow-x: hidden`, `touch-action: manipulation`
- `css/minigame.css`: `touch-action: manipulation` на ячейках, убран `overflow: hidden` / `height: 100vh` (заменён на `min-height: 100vh` + `overflow-x: hidden`)
- `dungeon.php`: добавлен виртуальный D-pad (7 кнопок: ↑↓←→, skip, Q, E), подсказка на мобильном
- `css/dungeon.css`: стили D-pad (скрыт на десктопе, видим на мобильном ≤680px)
- `js/dungeon.js`: обработчики D-pad (touchstart + click), show/hide D-pad при старте/рестарте игры

**Файлы затронуты:**
- `idle.php`, `dungeon.php`, `minigame.php`
- `css/idle.css`, `css/auth.css`, `css/minigame.css`, `css/dungeon.css`
- `js/dungeon.js`

---

## 2026-03-12 — Фикс: награды из активностей не зачислялись на аккаунт

**Что сделано:**
- `js/dungeon.js`: исправлен `sendReward()` — неправильный ключ `'codeAndCoffee_save'` → `'kodikofee_save'`, убрана ошибочная base64-кодировка (`atob`/`btoa`), добавлен `lastSave = Date.now()` для корректного merge
- `ajax/save.php`: в `dungeon_clear` и `minigame_reward` добавлено `lastSave` в JSON сохранения — сервер всегда помечается как авторитетный после получения наград
- `js/idle.js`: в `checkMinigameReward()` добавлен вызов `saveGame()` + `saveGameServer()` после применения награды

**Файлы затронуты:**
- `js/dungeon.js`
- `ajax/save.php`
- `js/idle.js`

---

## 2026-03-12 — Блок активностей в idle-игре

**Что сделано:**
- Добавлен `#activitiesBar` в `idle.php` — видимый блок ниже основного layout
- `renderActivitiesBar()` в `idle.js` — рендерит 4 карточки активностей с состоянием unlock
- Заблокированные активности показывают тултип при наведении: «Откроется: [условие]»
- Стили в `css/idle.css`: карточки, hover, CSS-тултип через `::after` + `data-tooltip`

**Файлы затронуты:**
- `idle.php` (добавлен #activitiesBar)
- `js/idle.js` (renderActivitiesBar + вызов в renderAll)
- `css/idle.css` (стили activities bar)

---

## 2026-03-12 — Dungeon v3: Phaser 3 подключён

**Что сделано:**
- `dungeon.php`: добавлен Phaser 3.87.0 CDN, `<canvas id="dungeonCanvas">` заменён на `<div id="gameCanvas">`
- `css/dungeon.css`: `#dungeonCanvas` → `#gameCanvas` + `#gameCanvas canvas`, добавлены размеры контейнера 576×448

**Файлы затронуты:**
- `dungeon.php` (обновлён)
- `css/dungeon.css` (обновлён)

---

## 2026-03-12 — Dungeon v2: Кодовая база: Глубина

**Что сделано:**
- Создан `js/dungeon.js` с нуля — полный движок roguelike (~500 строк)
  - 3 класса: Frontend (уклонение), Backend (AoE), DevOps (воскрешение)
  - 8 типов врагов с уникальными механиками (regen, doubleAtk, fast, instakill)
  - 2 босса: STACK OVERLORD (этаж 5, 2 фазы, призыв миньонов), ROOT_BUG (этаж 10, Recompile, Fatal Exception)
  - Генерация карты: случайные комнаты + L-коридоры, враги и предметы по этажам
  - Пошаговый бой, навыки (Q/E) с кулдауном, 4 типа предметов
  - Левелап (10 уровней), синергия с idle (account level → бонус к статам)
  - Смерть / победа с передачей наград в idle (localStorage + сервер)
- Полностью переписан `dungeon.php` — экран выбора класса, диалоговое окно сюжета, обновлённый сайдпанел с навыками
- Обновлён `css/dungeon.css` — стили для выбора класса, story modal, skill-кнопок
- Добавлен `case 'dungeon_clear'` в `ajax/save.php` — запись прохождения и выдача до 500k ЛОК + 3 OO
- Сюжет: 10 глав, 3 персонажа (GHOST_451, АРХИТЕКТОР, COPILOT_v0.3), финальный твист

**Файлы затронуты:**
- `js/dungeon.js` (создан)
- `dungeon.php` (переписан)
- `css/dungeon.css` (расширен)
- `ajax/save.php` (добавлен dungeon_clear)

---

## 2026-03-12 — Секция роадмапа на главной странице

**Что сделано:**
- Добавлена секция `#roadmap` в `index.php` — 4 фазы развития игры с описанием каждого пункта
- Блок «Уже в игре» с тегами текущего состояния
- Цветовая индикация фаз: активная (accent), планируется (accent2), идеи (yellow)
- Добавлена ссылка «Роадмап» в навигацию
- Создан файл `.claude/ROADMAP.md` — полная версия роадмапа для разработки

**Файлы затронуты:**
- `index.php` (добавлена секция roadmap + nav-ссылка)
- `css/style.css` (добавлены стили `.roadmap-*`, `.rm-*`)
- `.claude/ROADMAP.md` (создан)

---

## 2026-03-11 — Добавлен .gitignore

**Что сделано:**
- Создан `.gitignore` — исключены `db/*.sqlite`, `logs/`, `.idea/`, системный мусор
- Из git tracking удалены: `db/game.sqlite`, `logs/messages.log`, все файлы `.idea/`

**Файлы затронуты:**
- `.gitignore` (создан)

---

## 2026-03-11 — Агент коммита и пуша

**Что сделано:**
- Создан `.claude/push.sh` — bash-скрипт для коммита и пуша в `origin/main`
- В `.claude/CLAUDE.md` добавлено правило: после каждой задачи вызывать `push.sh`
- Описан формат сообщений коммита и поведение скрипта

**Файлы затронуты:**
- `.claude/push.sh` (создан)
- `.claude/CLAUDE.md` (обновлён)

---

## 2026-03-11 — Инициализация системных файлов

**Что сделано:**
- Создан `.claude/CLAUDE.md` — правила разработки и спецификация проекта
- Создан `.claude/CHANGELOG.md` — этот файл, история изменений
- Описана полная структура проекта (файлы, БД, соглашения)
- Зафиксирована заглушка: `pvp.php` (⚔️ Арена) — не реализован

**Файлы затронуты:**
- `.claude/CLAUDE.md` (создан)
- `.claude/CHANGELOG.md` (создан)

---

<!-- Шаблон для новых записей:

## YYYY-MM-DD — Краткое описание задачи

**Что сделано:**
- пункт 1
- пункт 2

**Файлы затронуты:**
- `path/to/file.php` (изменён / создан / удалён)

-->
