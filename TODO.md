# TODO — Взросление проекта «Жизнь программиста»

> Рабочий master-plan для поэтапного перевода проекта из pet-project в поддерживаемый продукт.
> Формат задач рассчитан на запуск отдельных агентов: каждая задача должна быть небольшой, проверяемой и по возможности независимой.

## Правила исполнения

- Не делать большой rewrite за один заход.
- На ранних этапах не ломать существующий геймплей и UI без отдельной задачи.
- Каждая задача должна иметь измеримый результат и критерии готовности.
- Сначала инфраструктура и безопасность, потом масштабирование и монетизация.
- При спорных решениях агент должен сначала зафиксировать decision record, а уже потом менять код.
- После завершения каждой задачи агент должен обновить `.claude/CHANGELOG.md`, сделать коммит и пуш через `.claude/push.sh`, передав в него только изменённые файлы по своей задаче.
- Все сообщения пользователю, итоговые отчёты и пояснения агенты должны писать на русском языке.
- Каждая задача в `TODO.md` должна иметь строку `Status`.
- Допустимые значения `Status`: `pending`, `in_progress`, `partial`, `done`, `blocked`.
- При старте своей задачи агент должен перевести её в `in_progress`, если она ещё не начата.
- После завершения агент должен перевести задачу в `done` или `partial`, если работа выполнена не полностью.
- Если задача не может быть завершена из-за внешней причины, агент должен поставить `blocked` и кратко указать причину в `Note`.

## Приоритеты

- `P0` — критический фундамент, без него дальше дорого и рискованно
- `P1` — важное улучшение архитектуры и качества
- `P2` — продуктовое усиление и масштабируемость
- `P3` — монетизация, growth, операционное развитие

## Epic 0 — Audit & Product Definition

### TASK-001 — Описать текущую архитектуру
- Status: `done`
- Note: создан `docs/architecture/current-state.md` с картой страниц, AJAX-эндпоинтов, состояния, SQLite, localStorage и связей между PHP/JS/сессиями.
- Priority: `P0`
- Agent: `Architecture Audit`
- Goal: собрать полную карту проекта
- Scope:
  - страницы
  - AJAX-эндпоинты
  - клиентские точки входа
  - модели данных
  - хранилища состояния
  - внешние зависимости и CDN
- Deliverables:
  - `docs/architecture/current-state.md`
  - схема связей между PHP, JS, SQLite и localStorage
- Acceptance Criteria:
  - перечислены все пользовательские сценарии
  - описано, где находится бизнес-логика
  - указаны слабые места и точки связности

### TASK-002 — Провести технический аудит рисков
- Status: `done`
- Note: создан `docs/audit/technical-risks.md` с разбиением рисков по `critical/high/medium/low`, последствиями и рекомендуемыми действиями.
- Priority: `P0`
- Agent: `Architecture Audit`
- Goal: зафиксировать ключевые техриски
- Scope:
  - безопасность
  - поддерживаемость
  - сохранения
  - отказоустойчивость
  - производительность
  - технический долг
- Deliverables:
  - `docs/audit/technical-risks.md`
- Acceptance Criteria:
  - риски разбиты на `critical`, `high`, `medium`, `low`
  - у каждого риска есть краткое последствие и рекомендуемое действие

### TASK-003 — Зафиксировать продуктовую модель
- Status: `done`
- Note: созданы `docs/product/game-loop.md` и `docs/product/monetization-outline.md`; зафиксированы core loop, meta progression, active/passive активности и безопасный контур монетизации без pay-to-win как основной стратегии.
- Priority: `P0`
- Agent: `Product Analyst`
- Goal: описать core loop и целевую траекторию продукта
- Scope:
  - core gameplay loop
  - meta progression
  - активные активности
  - удержание
  - потенциальная монетизация
- Deliverables:
  - `docs/product/game-loop.md`
  - `docs/product/monetization-outline.md`
- Acceptance Criteria:
  - понятно, что является ядром продукта
  - понятно, какие механики вторичны
  - зафиксированы возможные направления заработка без pay-to-win на раннем этапе

### TASK-004 — Зафиксировать baseline-метрики
- Status: `done`
- Note: создан `docs/product/metrics.md` с baseline KPI, определениями activation, retention, average session length, login conversion, prestige conversion и dungeon engagement, а также правилами расчёта.
- Priority: `P1`
- Agent: `Product Analyst`
- Goal: определить, что считается успехом продукта
- Scope:
  - activation
  - retention
  - session length
  - prestige conversion
  - dungeon engagement
  - login conversion
- Deliverables:
  - `docs/product/metrics.md`
- Acceptance Criteria:
  - каждая метрика имеет определение
  - указано, как её считать технически

## Epic 1 — Foundation & Project Structure

### TASK-005 — Ввести взрослую структуру каталогов
- Status: `done`
- Note: созданы `public/`, `src/`, `config/`, `storage/`, `migrations/`, `tests/`, `docs/`; добавлен план миграции в `docs/architecture/target-structure.md` без массового переноса файлов.
- Priority: `P0`
- Agent: `Refactor Plan`
- Goal: подготовить проект к росту без полной переписи
- Scope:
  - добавить `public/`, `src/`, `config/`, `storage/`, `migrations/`, `tests/`, `docs/`
  - определить, что остаётся в корне временно, а что переносится сразу
- Deliverables:
  - новая структура директорий
  - `docs/architecture/target-structure.md`
- Acceptance Criteria:
  - структура введена без поломки текущего сайта
  - runtime-данные отделены от исходников концептуально или физически

### TASK-006 — Подключить Composer и PSR-4 autoload
- Status: `done`
- Note: в проекте есть `composer.json` с PSR-4 для `src/`; в `bootstrap/app.php` добавлен fallback autoload, чтобы новый слой работал и без `vendor/autoload.php`.
- Priority: `P0`
- Agent: `Backend Extraction`
- Goal: перейти от файлового хаоса к управляемой автозагрузке
- Scope:
  - добавить `composer.json`
  - настроить PSR-4 для `src/`
  - описать минимальные dev-зависимости
- Deliverables:
  - `composer.json`
  - рабочий autoload
- Acceptance Criteria:
  - классы из `src/` подключаются через autoload
  - проект остаётся запускаемым локально

### TASK-007 — Ввести единый bootstrap приложения
- Status: `done`
- Note: добавлены `bootstrap/app.php` и `src/Bootstrap/AppBootstrap.php`; страницы и AJAX-эндпоинты используют общий bootstrap.
- Priority: `P0`
- Agent: `Backend Extraction`
- Goal: убрать разрозненную инициализацию из страниц и AJAX
- Scope:
  - сессия
  - конфиг
  - БД
  - обработка ошибок
  - общие функции ответа
- Deliverables:
  - `src/Bootstrap/`
  - единая точка инициализации
- Acceptance Criteria:
  - страницы и API используют общий bootstrap
  - нет дублирования стартовой логики по файлам

### TASK-008 — Вынести конфиг в отдельный слой
- Status: `done`
- Note: `.env.example` расширен, `config/` используется bootstrap и security-слоем; app/database/security/storage настройки больше не зашиты напрямую в runtime-логике.
- Priority: `P0`
- Agent: `Backend Extraction`
- Goal: отделить конфигурацию от кода
- Scope:
  - `.env.example`
  - конфиг приложения
  - конфиг БД
  - флаги окружения
- Deliverables:
  - `.env.example`
  - `config/`
- Acceptance Criteria:
  - значения среды не захардкожены по проекту
  - dev/prod настройки разделимы

## Epic 2 — Backend Extraction & Domain Layer

### TASK-009 — Вынести DB-слой в инфраструктурный класс
- Status: `done`
- Note: runtime-код переведён на `DatabaseManager` и persistence-слой; `db.php` оставлен только как legacy compatibility shim, но новые страницы и AJAX его больше не используют напрямую.
- Priority: `P0`
- Agent: `Backend Extraction`
- Goal: убрать `db.php` как глобальную точку с логикой
- Scope:
  - PDO bootstrap
  - миграционная инициализация
  - фабрика подключения
- Deliverables:
  - `src/Infrastructure/Database/`
- Acceptance Criteria:
  - код больше не зависит напрямую от старого procedural-style файла
  - подключение БД идёт через единый слой

### TASK-010 — Вынести auth-логику в сервисы и контроллеры
- Status: `done`
- Note: созданы `src/Application/Auth/AuthService.php` и `src/Application/Auth/AuthController.php`; `ajax/auth.php` использует thin controller и сохраняет совместимое поведение endpoint.
- Priority: `P0`
- Agent: `Backend Extraction`
- Goal: убрать бизнес-логику из `ajax/auth.php`
- Scope:
  - login
  - register
  - logout
  - me
  - session management
- Deliverables:
  - `src/Application/Auth/`
  - thin controller для auth endpoint
- Acceptance Criteria:
  - endpoint остаётся совместим по поведению
  - логика не живёт внутри PHP-страницы/эндпоинта

### TASK-011 — Вынести save/load/reward/prestige в сервисы
- Status: `done`
- Note: созданы `src/Application/GameSave/GameSaveService.php` и `src/Application/GameSave/GameSaveController.php`; `ajax/save.php` делегирует save/load/reward/prestige поведение в новый слой приложения.
- Priority: `P0`
- Agent: `Backend Extraction`
- Goal: нормализовать серверную игровую логику
- Scope:
  - save
  - load
  - prestige shop
  - minigame reward
  - dungeon reward
- Deliverables:
  - `src/Application/GameSave/`
  - thin controller для save endpoint
- Acceptance Criteria:
  - `ajax/save.php` становится тонким адаптером
  - расчёт и валидация наград централизованы

### TASK-012 — Ввести репозитории и доменные DTO
- Status: `done`
- Note: добавлены `UserRepository`, `GameSaveRepository`, `LeaderboardRepository`, а также DTO `UserData`, `GameSaveRecord`, `LeaderboardRecord`.
- Priority: `P1`
- Agent: `Backend Extraction`
- Goal: отделить SQL и доменные данные от контроллеров
- Scope:
  - `UserRepository`
  - `GameSaveRepository`
  - `LeaderboardRepository`
  - DTO/Value Objects
- Deliverables:
  - `src/Domain/`
  - `src/Infrastructure/Persistence/`
- Acceptance Criteria:
  - SQL не размазан по контроллерам
  - структура данных читаема и типизирована

### TASK-013 — Ввести единый формат API-ответов
- Status: `done`
- Note: добавлен `src/Http/ApiResponse.php`, AJAX-эндпоинты используют единый response helper, а контракт описан в `docs/api/response-format.md`.
- Priority: `P1`
- Agent: `Backend Extraction`
- Goal: привести API к предсказуемому контракту
- Scope:
  - `success`
  - `data`
  - `error`
  - `meta`
- Deliverables:
  - `src/Http/ApiResponse.php`
  - описание формата в `docs/api/response-format.md`
- Acceptance Criteria:
  - все AJAX-эндпоинты отвечают единообразно
  - ошибки формализованы

## Epic 3 — Data Model, Migrations, Persistence

### TASK-014 — Ввести систему миграций
- Status: `done`
- Note: добавлены `MigrationRunner`, initial SQL migration и документация потока миграций; схема теперь воспроизводится из `migrations/`, а не только через runtime schema patching.
- Priority: `P0`
- Agent: `Data Migration`
- Goal: управлять схемой БД версионируемо
- Scope:
  - initial schema
  - последующие изменения колонок и таблиц
- Deliverables:
  - `migrations/`
  - runner или documented migration flow
- Acceptance Criteria:
  - схема БД воспроизводима с нуля
  - новые изменения не завязаны только на runtime `ALTER TABLE`

### TASK-015 — Принять стратегию хранения игровых данных
- Status: `done`
- Note: создан `docs/data/storage-strategy.md`; зафиксировано, что account/auth и leaderboard остаются реляционными, основной игровой snapshot пока хранится в `game_saves.save_data`, а analytics и audit logs не смешиваются с save blob.
- Priority: `P1`
- Agent: `Data Migration`
- Goal: решить, что хранить как JSON, а что вынести в таблицы
- Scope:
  - saves JSON
  - leaderboard fields
  - analytics events
  - audit logs
- Deliverables:
  - `docs/data/storage-strategy.md`
- Acceptance Criteria:
  - есть обоснованное решение по каждой крупной сущности

### TASK-016 — Подготовить стратегию БД на рост
- Status: `done`
- Note: создан `docs/data/sqlite-vs-postgres.md`; зафиксировано, что SQLite остаётся текущим решением для single-instance стадии, а обязательный переход на PostgreSQL наступает при multiple writers, event-heavy storage, server-authoritative progression или более жёстких требованиях к backup/restore.
- Priority: `P1`
- Agent: `Data Migration`
- Goal: оценить пределы SQLite и критерии перехода на PostgreSQL
- Scope:
  - write load
  - backups
  - analytics
  - concurrent access
- Deliverables:
  - `docs/data/sqlite-vs-postgres.md`
- Acceptance Criteria:
  - есть decision record
  - определён момент, когда переход становится обязательным

### TASK-017 — Подготовить dev seed и тестовые данные
- Status: `done`
- Note: добавлены `scripts/seed/dev-seed.php` и `storage/seed/profiles/*.json` с тремя стадиями прогрессии; локальный разработчик может быстро заполнить SQLite тестовыми аккаунтами через `composer seed:dev`.
- Priority: `P1`
- Agent: `Data Migration`
- Goal: ускорить локальную разработку и тестирование
- Scope:
  - тестовый пользователь
  - тестовые сохранения
  - разные стадии прогрессии
- Deliverables:
  - `storage/seed/` или `scripts/seed`
- Acceptance Criteria:
  - новый разработчик может быстро поднять проект с тестовыми данными

## Epic 4 — Security & Trust

### TASK-018 — Добавить CSRF-защиту
- Status: `done`
- Note: добавлен `security.php` с CSRF helper'ами; токен прокинут в auth/save/reward/purchase/logout запросы, а state-changing запросы без токена отклоняются сервером.
- Priority: `P0`
- Agent: `Security Hardening`
- Goal: защитить state-changing запросы
- Scope:
  - auth формы
  - AJAX save/reward/purchase запросы
- Deliverables:
  - CSRF middleware или helper
- Acceptance Criteria:
  - state-changing запросы без токена отклоняются
  - фронт корректно передаёт токен

### TASK-019 — Добавить session hardening
- Status: `done`
- Note: безопасный старт сессии централизован через `app_start_session()`; настроены `httponly`, `samesite`, production-aware `secure`, strict/use_only_cookies и централизованная регенерация после login/register.
- Priority: `P0`
- Agent: `Security Hardening`
- Goal: усилить защиту сессий
- Scope:
  - cookie flags
  - session config
  - secure regeneration flow
- Deliverables:
  - безопасная инициализация сессий
- Acceptance Criteria:
  - `httponly`, `samesite`, `secure` учитываются для production
  - регенерация сессии централизована

### TASK-020 — Добавить rate limiting
- Status: `done`
- Note: добавлен файловый limiter в `security.php`; лимиты применены к `login/register/logout`, `save/load`, `buy_prestige`, `minigame_reward`, `dungeon_clear`.
- Priority: `P0`
- Agent: `Security Hardening`
- Goal: защитить проект от спама и brute force
- Scope:
  - login/register
  - reward endpoints
  - save endpoint
- Deliverables:
  - минимальный limiter
  - конфиг лимитов
- Acceptance Criteria:
  - превышение лимита даёт контролируемый ответ
  - лимиты настраиваемы

### TASK-021 — Усилить серверную валидацию и античит
  - Status: `done`
  - Note: добавлены cap'ы наград, нормализация save payload, серверный пересчёт `prestigeMulti`, whitelist/max-level для `prestigeShop`, серверный лимит `maxOffline`, инвариант `prestigePoints <= totalPrestigePoints`, clamp/log подозрительных скачков и обновлён `docs/security/anti-cheat-baseline.md`; полноценная server-authoritative модель остаётся отдельным следующим этапом.
- Priority: `P0`
- Agent: `Security Hardening`
- Goal: уменьшить доверие к клиенту
- Scope:
  - капы наград
  - корректность прогресса
  - валидация типов и диапазонов
  - подозрительные скачки значений
- Deliverables:
  - правила валидации
  - `docs/security/anti-cheat-baseline.md`
- Acceptance Criteria:
  - критичные игровые значения валидируются сервером
  - аномальные запросы логируются

### TASK-022 — Ввести security/audit logging
- Status: `done`
- Note: добавлен baseline security-log в `storage/logs/security.log` (JSONL); в лог попадают failed login, malformed payloads, CSRF failures, rate limit и suspicious reward/save cases.
- Priority: `P1`
- Agent: `Security Hardening`
- Goal: иметь следы важных событий безопасности
- Scope:
  - failed login
  - registration abuse
  - suspicious rewards
  - malformed payloads
- Deliverables:
  - `storage/logs/`
  - формат security logs
- Acceptance Criteria:
  - ключевые security-события попадают в лог

## Epic 5 — Frontend Decomposition

### TASK-023 — Разбить `js/idle.js` на модули
- Status: `done`
- Note: `idle.js` перестал быть монолитом: данные вынесены в `data/game/idle-balance.js` и `js/idle-data.js`, игровые действия в `js/idle-actions.js`, а runtime/economy/save/render слои уже живут в отдельных `js/idle-*.js`.
- Priority: `P0`
- Agent: `Frontend Decomposition`
- Goal: уменьшить связность и упростить развитие idle-ядра
- Scope:
  - `state`
  - `economy`
  - `progression`
  - `render`
  - `save`
  - `events`
  - `activities`
- Deliverables:
  - модульная структура JS
- Acceptance Criteria:
  - поведение игры не меняется
  - крупный файл перестаёт быть единственной точкой логики

### TASK-024 — Выделить общие шаблоны и partials в PHP
- Status: `done`
- Note: добавлены `templates/partials/app-head.php`, `page-nav.php` и `logout-script.php`; повторяющиеся head/nav/logout-фрагменты вынесены из `idle.php`, `profile.php`, `leaderboard.php`, `auth.php`, `index.php`, `game.php`, `dungeon.php`, `minigame.php`.
- Priority: `P1`
- Agent: `Frontend Decomposition`
- Goal: убрать дублирование в PHP-разметке
- Scope:
  - head
  - nav
  - auth blocks
  - общие UI-фрагменты
- Deliverables:
  - `templates/` или аналогичный слой
- Acceptance Criteria:
  - повторяющиеся куски вынесены
  - страницы читаются проще

### TASK-025 — Навести порядок в CSS-структуре
- Status: `done`
- Note: добавлен общий token-layer `css/tokens.css`, на него переведены базовые CSS-файлы (`auth.css`, `idle.css`, `style.css`, `game.css`, `dungeon.css`, `minigame.css`), а правила зафиксированы в `docs/frontend/css-conventions.md`.
- Priority: `P1`
- Agent: `Frontend Decomposition`
- Goal: сделать стили управляемыми
- Scope:
  - CSS variables
  - соглашения по именованию
  - общие токены
  - общие утилиты
- Deliverables:
  - `docs/frontend/css-conventions.md`
  - базовый слой переменных
- Acceptance Criteria:
  - новые стили опираются на единые токены
  - дублирование уменьшено

### TASK-026 — Принять решение по фронтенд-сборке
- Status: `done`
- Note: принято решение не вводить build step сейчас; стратегия и триггеры перехода зафиксированы в `docs/frontend/build-strategy.md`.
- Priority: `P1`
- Agent: `Frontend Decomposition`
- Goal: решить, нужен ли build step сейчас
- Scope:
  - текущие потребности
  - modular JS
  - asset pipeline
  - DX tradeoffs
- Deliverables:
  - `docs/frontend/build-strategy.md`
- Acceptance Criteria:
  - есть зафиксированное решение: вводим сборку сейчас или откладываем

## Epic 6 — Quality, Tests, CI

### TASK-027 — Поднять тестовый стек для PHP
- Status: `done`
- Note: подключены `phpunit/phpunit`, `phpunit.xml.dist`, `tests/bootstrap.php` и test bootstrap для временной SQLite/sessions; первые автотесты запускаются локально через `composer test`.
- Priority: `P0`
- Agent: `Testing Bootstrap`
- Goal: начать покрывать критичные сценарии автоматически
- Scope:
  - PHPUnit или Pest
  - базовая настройка test bootstrap
- Deliverables:
  - `tests/`
  - тестовая конфигурация
- Acceptance Criteria:
  - можно запустить первые автоматические тесты локально

### TASK-028 — Покрыть критичные backend-сценарии
- Status: `done`
- Note: добавлены integration tests для `register`, `login`, `logout`, `save`, `load`, `buy_prestige`, `minigame_reward`, `dungeon_clear` и античит-нормализации в сервисном слое.
- Priority: `P0`
- Agent: `Testing Bootstrap`
- Goal: проверить самые дорогие по риску места
- Scope:
  - registration
  - login
  - save
  - load
  - prestige purchase
  - reward application
- Deliverables:
  - набор integration tests
- Acceptance Criteria:
  - критичные сценарии проверяются автоматически

### TASK-029 — Добавить линтеры и форматтеры
- Status: `done`
- Note: добавлены PHP formatter/lint baseline и JS lint baseline на `node --check` с конфигом `.js-lint.json`; `composer lint` теперь прогоняет и PHP, и JS проверки автоматически.
- Priority: `P1`
- Agent: `Testing Bootstrap`
- Goal: стабилизировать стиль и базовое качество
- Scope:
  - PHP formatter
  - JS linting strategy
  - basic code style rules
- Deliverables:
  - formatter/linter config
- Acceptance Criteria:
  - стиль проекта можно прогонять автоматически

### TASK-030 — Настроить CI baseline
- Status: `done`
- Note: добавлен GitHub Actions workflow `.github/workflows/ci.yml`; на `push` и `pull_request` запускаются `composer validate`, `composer install`, `composer lint`, `composer test`, `composer format:check`.
- Priority: `P1`
- Agent: `DevOps Baseline`
- Goal: автоматизировать базовые проверки
- Scope:
  - install
  - lint
  - tests
- Deliverables:
  - CI workflow
- Acceptance Criteria:
  - при пуше/PR выполняется минимум одна автоматическая проверка качества

## Epic 7 — DevOps, Runtime, Observability

### TASK-031 — Описать локальный запуск и onboarding
- Status: `done`
- Note: добавлен `README.md` с локальным запуском, env setup, миграциями, тестами и базовым smoke-check.
- Priority: `P0`
- Agent: `DevOps Baseline`
- Goal: убрать knowledge silo
- Scope:
  - как запустить
  - как создать БД
  - как настроить env
  - как тестировать
- Deliverables:
  - `README.md`
- Acceptance Criteria:
  - новый разработчик может поднять проект по инструкции

### TASK-032 — Подготовить production/stage/dev конфиги
- Status: `done`
- Note: добавлен `docs/devops/environments.md` с явной стратегией для `development`, `stage`, `production` и набором обязательных env-переменных.
- Priority: `P1`
- Agent: `DevOps Baseline`
- Goal: сделать окружения явными
- Scope:
  - app env
  - db env
  - debug flags
  - secure settings
- Deliverables:
  - env strategy
- Acceptance Criteria:
  - dev и prod конфиги не смешаны

### TASK-033 — Подготовить deploy strategy
- Status: `done`
- Note: добавлен `docs/devops/deploy.md` с release flow, rollback, backup и migration/deploy baseline.
- Priority: `P1`
- Agent: `DevOps Baseline`
- Goal: сделать деплой повторяемым
- Scope:
  - release flow
  - rollback
  - migrations on deploy
  - asset/versioning strategy
- Deliverables:
  - `docs/devops/deploy.md`
- Acceptance Criteria:
  - деплой описан пошагово
  - rollback-сценарий продуман

### TASK-034 — Ввести error monitoring и uptime checks
- Status: `done`
- Note: добавлен `docs/devops/monitoring.md` с baseline error logging, uptime checks, SQLite health и операционным регламентом.
- Priority: `P2`
- Agent: `DevOps Baseline`
- Goal: видеть проблемы в рантайме до жалоб пользователя
- Scope:
  - application errors
  - unhandled failures
  - page/API uptime
- Deliverables:
  - `docs/devops/monitoring.md`
- Acceptance Criteria:
  - определён минимальный набор наблюдаемости

## Epic 8 — Analytics, Balance, Product Tooling

### TASK-035 — Встроить продуктовую аналитику событий
- Status: `done`
- Note: созданы `docs/product/analytics-events.md` и `docs/data/analytics-events-storage.md`; зафиксированы каталог событий первой очереди, обязательные payload-поля, точки истины для трекинга и отдельная append-only storage strategy через таблицу `analytics_events`.
- Priority: `P1`
- Agent: `Product Analyst`
- Goal: начать видеть реальное поведение игроков
- Scope:
  - session start
  - registration
  - login
  - prestige
  - dungeon start/finish
  - minigame reward
- Deliverables:
  - event schema
  - storage strategy
- Acceptance Criteria:
  - определён каталог событий и обязательных параметров

### TASK-036 — Вынести баланс в data-driven слой
- Status: `done`
- Note: добавлен `data/game/idle-balance.js` как единый источник данных для зданий, апгрейдов, достижений, сюжетных глав, событий и их rule-based unlock/condition схем; `idle.php` и `js/idle.js` переведены на новый data-driven runtime.
- Priority: `P1`
- Agent: `Game Systems`
- Goal: сделать балансируемость игры управляемой
- Scope:
  - buildings
  - upgrades
  - achievements
  - rewards
  - event weights
- Deliverables:
  - `config/game/` или `data/game/`
- Acceptance Criteria:
  - крупные балансные значения не живут только в одном гигантском JS-файле

### TASK-037 — Подготовить admin/tooling baseline
- Priority: `P2`
- Agent: `Product Tooling`
- Goal: дать владельцу проекта минимальные средства поддержки
- Scope:
  - просмотр пользователя
  - просмотр сохранения
  - ручная выдача/коррекция прогресса
  - просмотр подозрительных кейсов
- Deliverables:
  - admin plan или internal tools spec
- Acceptance Criteria:
  - есть понятный путь к поддержке игроков без ручного копания в SQLite

## Epic 9 — Content Scaling

### TASK-038 — Формализовать модель прогрессии
- Status: `done`
- Note: создан `docs/game/progression-model.md` с формализацией ранa, метапрогрессии, account level, prestige pacing, dungeon reward loop и unlock pacing как одной системы.
- Priority: `P1`
- Agent: `Game Systems`
- Goal: стабилизировать развитие игры как системы
- Scope:
  - account level
  - prestige pacing
  - dungeon reward loop
  - unlock pacing
- Deliverables:
  - `docs/game/progression-model.md`
- Acceptance Criteria:
  - progression описана как система, а не только как код

### TASK-039 — Закрыть продуктовые заглушки
- Status: `done`
- Note: создан `docs/game/product-stubs.md`; misleading unlock для `pvp.php` убран из runtime UI, а PVP и сезонные события помечены как planned features без ложной навигации.
- Priority: `P2`
- Agent: `Game Systems`
- Goal: убрать мёртвые зоны продукта
- Scope:
  - `pvp.php`
  - нерабочие ссылки
  - временные stub-механики
- Deliverables:
  - список заглушек и решение по каждой
- Acceptance Criteria:
  - в интерфейсе не остаётся misleading navigation

### TASK-040 — Подготовить систему сезонного ивентинга
- Status: `done`
- Note: создан `docs/game/seasonal-events.md` с моделью seasonal definitions, modifiers, missions, rewards, reward hooks и ограничениями по балансу.
- Priority: `P2`
- Agent: `Game Systems`
- Goal: заложить основу для регулярного контента
- Scope:
  - event config
  - schedule model
  - reward hooks
- Deliverables:
  - `docs/game/seasonal-events.md`
- Acceptance Criteria:
  - архитектура ивентов описана без немедленной полной реализации

### TASK-061 — Спроектировать активные способности для idle-ядра
- Status: `done`
- Note: создан `docs/game/idle-active-abilities.md` с моделью unlock-путей, слотами способностей, cooldown/economy guardrails, набором стартовых способностей и правилами их балансировки как midgame-слоя между idle и prestige.
- Priority: `P2`
- Agent: `Game Systems`
- Goal: усилить midgame-решения без размывания idle-ядра
- Scope:
  - fantasy и роль активных способностей
  - unlock rules через престиж и account progression
  - reward structure и safe power budget
  - pacing, cooldowns и anti-spam ограничения
  - балансные риски и failure states
- Deliverables:
  - `docs/game/idle-active-abilities.md`
- Acceptance Criteria:
  - способности описаны как системный слой, а не набор разрозненных кнопок
  - их награды не ломают prestige pacing и не заменяют side modes

### TASK-062 — Зафиксировать data-driven контракт active abilities
- Status: `done`
- Note: создан `docs/game/idle-abilities-schema.md` с конфиг-схемой для `data/game/idle-balance.js`, runtime-state моделью, server/save требованиями, analytics hooks и безопасным rollout-порядком для реализации active abilities.
- Priority: `P2`
- Agent: `Game Systems`
- Goal: подготовить реализацию active abilities без архитектурного расползания
- Scope:
  - config schema для abilities, slots и unlock rules
  - runtime state и save contract
  - analytics events и UI contract
  - rollout phases и implementation guardrails
- Deliverables:
  - `docs/game/idle-abilities-schema.md`
- Acceptance Criteria:
  - разработчику понятны структура данных и точки интеграции
  - контракт не требует хардкода способностей по разным экранам

### TASK-063 — Пересобрать продуктовую рамку под narrative season 1
- Status: `done`
- Note: создан `docs/game/season-1-design-framework.md`, в котором сценарный каркас `Скуф-пати` переведён в новый продуктовый тезис, core loop, ресурсы, прогрессию, seasonal structure и список систем, которые конфликтуют с новым направлением и требуют замены или переосмысления.
- Priority: `P1`
- Agent: `Game Systems`
- Goal: превратить сценарий сезона в опорную игровую модель
- Scope:
  - narrative-to-systems translation
  - новый core loop и meta loop
  - ресурсы, прогрессия и типы активностей
  - compatibility audit текущих механик
  - правила для дальнейшего сценарного и системного дизайна
- Deliverables:
  - `docs/game/season-1-design-framework.md`
- Acceptance Criteria:
  - понятно, какая игра строится из сценария сезона
  - явно перечислено, что из текущей модели нужно сохранить, убрать или пересобрать

### TASK-064 — Описать цикл одного внутриигрового дня для season 1
- Status: `done`
- Note: создан `docs/game/season-1-day-loop.md` с фазами дня, базовыми ресурсами, обязательными решениями, типами активностей, fail states и правилами открытия сцен акта 1 через повседневный ритм героя.
- Priority: `P1`
- Agent: `Game Systems`
- Goal: превратить новый тезис сезона в playable daily loop
- Scope:
  - day phases
  - resource flow
  - player decisions per day
  - social/project actions
  - narrative trigger model для акта 1
- Deliverables:
  - `docs/game/season-1-day-loop.md`
- Acceptance Criteria:
  - понятно, что игрок делает в течение одного дня
  - daily loop поддерживает сценарный темп `по чуть-чуть`

### TASK-065 — Описать roster персонажей как gameplay-юнитов season 1
- Status: `done`
- Note: создан `docs/game/season-1-character-roster.md`, где ключевые персонажи переведены в gameplay-юниты нового типа: для каждого зафиксированы unlock, системная роль, модификаторы, emotional hook, локальный риск и payoff для команды и проекта.
- Priority: `P1`
- Agent: `Game Systems`
- Goal: сделать персонажей рабочими элементами прогрессии, а не только сценарием
- Scope:
  - gameplay role per character
  - unlock and trigger model
  - resource modifiers
  - relationship payoff
  - local quest potential
- Deliverables:
  - `docs/game/season-1-character-roster.md`
- Acceptance Criteria:
  - по каждому ключевому персонажу понятно, как он влияет на игру
  - roster можно напрямую использовать для progression map и system design

### TASK-066 — Разложить акт 1 в progression map
- Status: `done`
- Note: создан `docs/game/season-1-act-1-progression-map.md`, где акт 1 разложен в последовательность игровых узлов: состояние дня, доступные действия, сюжетная сцена, системный эффект и следующий unlock для перехода к следующему beat'у.
- Priority: `P1`
- Agent: `Game Systems`
- Goal: превратить сценарный акт 1 в production-ready progression blueprint
- Scope:
  - sequence of beats
  - unlock conditions
  - available actions
  - systemic rewards and penalties
  - act-end transition
- Deliverables:
  - `docs/game/season-1-act-1-progression-map.md`
- Acceptance Criteria:
  - понятно, как игрок проходит акт 1 от нулевой комнаты до решения собрать своих
  - каждая сцена имеет системный смысл, а не только narrative presence

### TASK-067 — Собрать ядро игры для season 1
- Status: `done`
- Note: создан `docs/game/season-1-core-systems.md`, где зафиксированы основные игровые системы новой версии проекта: daily pressure loop, project loop, relationship loop, group loop, room progression, soft fail states и player verbs первой итерации.
- Priority: `P1`
- Agent: `Game Systems`
- Goal: описать реальное игровое ядро новой игры до интерфейсов и баланса
- Scope:
  - primary systems
  - player verbs
  - resource transformations
  - loop connections
  - MVP system cut
- Deliverables:
  - `docs/game/season-1-core-systems.md`
- Acceptance Criteria:
  - ясно, какие 4-6 систем составляют ядро игры
  - можно начинать прототипировать игру не от сюжета, а от системного каркаса

### TASK-068 — Зафиксировать MVP game state schema для season 1
- Status: `done`
- Note: создан `docs/game/season-1-mvp-state-schema.md`, где описаны обязательные state-сущности, ресурсы дня, project/relationship/group/room блоки, progression flags, инварианты и минимальный save-shape для первой итерации новой игры.
- Priority: `P1`
- Agent: `Game Systems`
- Goal: перевести ядро игры в конкретную модель состояния
- Scope:
  - state slices
  - required fields
  - invariants
  - save/load shape
  - MVP exclusions
- Deliverables:
  - `docs/game/season-1-mvp-state-schema.md`
- Acceptance Criteria:
  - разработчику понятно, какие данные реально нужны игре на старте
  - state schema поддерживает day loop, relationships, project loop и progression акта 1

### TASK-069 — Собрать information architecture главного экрана season 1
- Status: `done`
- Note: создан `docs/game/season-1-main-screen-ia.md`, где state schema и core systems разложены по зонам главного экрана, приоритетам внимания, CTA, desktop/mobile-структуре и правилам показа контента в течение дня.
- Priority: `P1`
- Agent: `Game Systems`
- Goal: перевести системное ядро в структуру основного игрового экрана
- Scope:
  - screen regions
  - information hierarchy
  - action placement
  - day-phase behavior
  - mobile/desktop layout logic
- Deliverables:
  - `docs/game/season-1-main-screen-ia.md`
- Acceptance Criteria:
  - понятно, что игрок видит первым, что вторым и где делает главный выбор вечера
  - главный экран обслуживает ядро игры без перегруза и без возврата к idle-dashboard паттерну

### TASK-070 — Зафиксировать legacy systems cut list для новой версии игры
- Status: `done`
- Note: создан `docs/game/season-1-legacy-cut-list.md`, где текущие системы, страницы, валюты и режимы проекта разобраны на категории `удалить`, `не переносить в runtime`, `переиспользовать как технический слой` и `переосмыслить позже` для перехода к новой игре сезона 1.
- Priority: `P1`
- Agent: `Game Systems`
- Goal: убрать двусмысленность в переходе от старой idle-игры к новой системе сезона 1
- Scope:
  - current pages and modes
  - currencies and progression systems
  - UI surfaces
  - backend/save layers
  - reuse vs removal decisions
- Deliverables:
  - `docs/game/season-1-legacy-cut-list.md`
- Acceptance Criteria:
  - команде ясно, что больше не является частью новой игры
  - понятно, что можно оставить как инфраструктуру и что нужно переделывать с нуля

### TASK-071 — Собрать MVP action catalog для season 1
- Status: `done`
- Note: создан `docs/game/season-1-mvp-action-catalog.md`; ядро новой игры переведено в каталог конкретных действий игрока с `availability`, `cost`, `effect`, `risk`, `state hooks` и минимальным набором для первого playable.
- Priority: `P1`
- Agent: `Game Systems`
- Goal: превратить core loop новой игры в конкретный action layer
- Scope:
  - recovery actions
  - money actions
  - project actions
  - relationship actions
  - group actions
  - MVP minimum set
- Deliverables:
  - `docs/game/season-1-mvp-action-catalog.md`
- Acceptance Criteria:
  - у ключевых действий есть `cost`, `effect`, `risk` и `state hooks`
  - каталог покрывает базовый вечерний выбор игрока
  - определён минимальный action set для ранней реализации

### TASK-073 — Зафиксировать idle redesign framework для season 1
- Status: `done`
- Note: создан `docs/game/season-1-idle-redesign-framework.md`; зафиксирован разворот от life-sim/hybrid в сторону character-driven idle-management игры под season 1 с референсом на атмосферу и продуктовую зону `Punch Club`.
- Priority: `P1`
- Agent: `Game Systems`
- Goal: вернуть season 1 в формат новой idle-игры, а не отдельного life-sim продукта
- Scope:
  - новый idle-тезис проекта
  - core idle loop
  - управляемые игроком рутины и слоты
  - авто-тикающие ресурсы и состояния
  - роль сценария внутри idle-прогрессии
  - визуальный столп pixel-life fantasy
- Deliverables:
  - `docs/game/season-1-idle-redesign-framework.md`
- Acceptance Criteria:
  - ясно, что новая версия остаётся idle-игрой
  - описано, чем игрок управляет и что тикает само
  - зафиксировано, как сценарий влияет на idle-loop, а не заменяет его

### TASK-074 — Собрать idle core loop spec для season 1
- Status: `done`
- Note: создан `docs/game/season-1-idle-core-loop-spec.md`; зафиксированы life modes, вечерние слоты, project/social priorities, auto-ticks, аварийные состояния, положительные устойчивые состояния и полный idle-цикл новой версии игры.
- Priority: `P1`
- Agent: `Game Systems`
- Goal: перевести новый idle-вектор season 1 в конкретный механический контракт для реализации
- Scope:
  - фазы полного idle-цикла
  - life modes и их эффекты
  - управляемые слоты и фокусы
  - авто-тикающие системы
  - caps и аварийные состояния
  - возвратный цикл игрока
- Deliverables:
  - `docs/game/season-1-idle-core-loop-spec.md`
- Acceptance Criteria:
  - ясно, из каких фаз состоит новый idle-loop
  - описано, что тикает само и чем управляет игрок
  - зафиксированы MVP caps, risks и positive states

### TASK-075 — Собрать idle main screen spec для season 1
- Status: `done`
- Note: создан `docs/game/season-1-idle-main-screen-spec.md`; зафиксирован главный экран новой idle-версии игры как pixel-life dashboard с `Room Stage`, `Routine Controls Panel`, `Idle Results Rail`, `Project Panel`, `People/Circle Panel` и `Cycle Alerts`.
- Priority: `P1`
- Agent: `Game Systems`
- Goal: перевести новый idle-вектор season 1 в конкретный экранный контракт для UI и frontend-реализации
- Scope:
  - экранная иерархия внимания
  - центральная роль комнаты героя
  - панели управления idle-циклом
  - блоки чтения idle-результатов
  - desktop/mobile layout
  - visual pillar под pixel-life fantasy
- Deliverables:
  - `docs/game/season-1-idle-main-screen-spec.md`
- Acceptance Criteria:
  - ясно, какие зоны есть на главном экране и зачем
  - описано, что игрок видит первым и чем управляет
  - зафиксирован MVP cut главного экрана новой idle-версии

### TASK-079 — Зафиксировать narrative idle core для season 1
- Status: `done`
- Note: создан `docs/game/season-1-narrative-idle-core.md`; зафиксирован жёсткий разворот от manager/life-sim логики к `story-driven idle` с персонажной прогрессией, юмором, драмой и иронией вокруг ядра роста.
- Priority: `P1`
- Agent: `Game Systems`
- Goal: вернуть season 1 в формат настоящей idle-игры, где сюжет усиливает прогрессию, а не заменяет её
- Scope:
  - новый продуктовый тезис
  - что производит idle-цикл
  - что игрок прокачивает
  - роль сцен и персонажей в idle-системе
  - место юмора, драмы и иронии
- Deliverables:
  - `docs/game/season-1-narrative-idle-core.md`
- Acceptance Criteria:
  - ясно, что в центре игры стоит idle-прогрессия
  - описано, как сюжет и персонажи усиливают idle-loop
  - зафиксировано, что manager/life-sim путь больше не является ядром сезона
### TASK-080 — Собрать idle progression model для season 1
- Status: `done`
- Note: создан `docs/game/season-1-idle-progression-model.md`; зафиксированы progression axes, production layers, типы билдов, стадии проекта, персонажные modifiers, automation line и точки, где в рост встраиваются юмор, драма и ирония.
- Priority: `P1`
- Agent: `Game Systems`
- Goal: определить конкретную модель прогрессии story-driven idle игры сезона 1
- Scope:
  - project line
  - build line
  - people line
  - automation line
  - studio vibe line
  - production layers и MVP progression model
- Deliverables:
  - `docs/game/season-1-idle-progression-model.md`
- Acceptance Criteria:
  - ясно, что именно игрок строит, апгрейдит и автоматизирует
  - описано, как персонажи усиливают progression model

### TASK-078 — Нормализовать build-flow для season 1 browser runtime
- Status: `done`
- Note: добавлен `composer build:season1` и `scripts/build-season1-runtime.mjs`; сборка компилирует `src/season1/*.ts` через локальный `typescript` из `laravel/node_modules` и зеркалит runtime в `public/`. README обновлён с инструкцией.
- Priority: `P1`
- Agent: `Game Developer`
- Goal: убрать ручную сборку season1 runtime и сделать её воспроизводимой одной командой
- Scope:
  - script для компиляции TS runtime
  - mirror `js/season1/*` -> `public/js/season1/*`
  - краткая dev-документация по запуску
- Deliverables:
  - `composer build:season1`
  - build script для season1 runtime
  - обновлённый README
- Acceptance Criteria:
  - season1 runtime собирается одной командой
  - обновление public mirror не делается вручную
  - инструкция локального запуска зафиксирована в репозитории

### TASK-077 — Перевести season 1 runtime на `Phaser + TypeScript`
- Status: `done`
- Note: `/season1.php` и Laravel view переведены на новый screen contract с `Phaser` room stage, TS runtime вынесен в `src/season1/*`, собран в `js/season1/*` и зеркалирован в `public/js/season1/*`; проверены `tsc`, `php -l` и season1 feature test.
- Priority: `P1`
- Agent: `Game Developer`
- Goal: перевести существующий `/season1.php` на новый browser runtime с `Phaser`-сценой и `TypeScript`-модулями
- Scope:
  - сохранение изолированного entrypoint `/season1.php`
  - `Phaser`-based `Room Stage`
  - `TypeScript`-слой для `state`, `tick resolver`, `content`, `UI binding`
  - idle-first экран по `season-1-idle-main-screen-spec`
  - smoke/regression проверка без поломки legacy `idle.php`
- Deliverables:
  - рабочий season 1 browser runtime на `Phaser + TypeScript`
  - модульная структура исходников новой idle-версии
  - обновлённые page/view/assets под новый runtime
- Acceptance Criteria:
  - `/season1.php` работает как отдельный новый slice
  - `Room Stage` рендерится через `Phaser`
  - основная экранная логика живёт в `TypeScript`
  - старая версия проекта не сломана

### TASK-076 — Собрать первый рабочий idle-slice season 1
- Status: `done`
- Priority: `P1`
- Agent: `Game Developer`
- Goal: превратить `season1.php` в рабочий `character-driven life-management idle` vertical slice
- Scope:
  - безопасный entrypoint новой idle-версии
  - Top HUD, Room Stage, Idle Results Rail, Routine Controls Panel, Project Panel, People/Circle Panel, Cycle Alerts
  - life modes, evening slots, project focus, social priority
  - auto-tick loop и result layer
  - meaningful idle modifiers минимум через 2-3 персонажей
- Deliverables:
  - playable idle-slice новой версии season 1
  - auto-tick runtime и локальное сохранение состояния
  - smoke/regression проверка entrypoint
- Acceptance Criteria:
  - новая версия ощущается как idle-игра, а не ручной daily sim
  - auto-ticks реально меняют состояние
  - игрок перенастраивает цикл, а не проживает каждый шаг вручную
  - старая игра и `idle.php` не сломаны

### TASK-072 — Собрать первый playable vertical slice season 1
- Status: `done`
- Note: добавлены отдельный entrypoint `/season1.php`, Laravel page adapter, изолированный UI/runtime vertical slice и feature test; реализованы 5 действий, day resolution loop, локальный state в `localStorage` и базовые unlock/guard conditions без вмешательства в `idle.php`.
- Priority: `P1`
- Agent: `Game Developer`
- Goal: поднять отдельный entrypoint новой игры и проверить day loop на реальном playable-срезе
- Scope:
  - отдельный route/page entrypoint новой игры
  - минимальный state contract для `calendar`, `resources`, `hero`, `project`, `relationships`, `group`, `room`
  - UI-скелет главного экрана
  - минимум 5 рабочих действий из MVP action catalog
  - day resolution loop с переходом между днями
- Deliverables:
  - отдельная playable-страница новой игры
  - клиентский runtime vertical slice
  - smoke/regression test на новый entrypoint
- Acceptance Criteria:
  - новая игра открывается отдельно от `idle.php`
  - можно прожить несколько дней подряд
  - ресурсы, проект, люди и состояние жизни реально меняются
  - есть базовые unlock conditions для части действий

## Epic 10 — Monetization & Legal Readiness

### TASK-041 — Зафиксировать монетизационную стратегию
- Priority: `P2`
- Agent: `Product Analyst`
- Goal: решить, на чём проект может зарабатывать без разрушения опыта игрока
- Scope:
  - cosmetics
  - premium convenience
  - season pass
  - ads decision
  - Telegram Mini App options
- Deliverables:
  - `docs/product/monetization-strategy.md`
- Acceptance Criteria:
  - описано, что продаётся
  - описано, что не продаётся
  - определены первые безопасные эксперименты

### TASK-042 — Подготовить legal minimum
- Priority: `P3`
- Agent: `Operations`
- Goal: снизить юридические риски при публичном запуске
- Scope:
  - privacy policy
  - terms of use
  - user data notice
- Deliverables:
  - legal docs drafts
- Acceptance Criteria:
  - есть минимальный набор документов для публичной эксплуатации

### TASK-043 — Подготовить go-to-market baseline
- Priority: `P3`
- Agent: `Growth`
- Goal: сделать проект готовым к публичному продвижению
- Scope:
  - позиционирование
  - лендинг value proposition
  - changelog/devlog для игроков
  - каналы привлечения
- Deliverables:
  - `docs/growth/go-to-market.md`
- Acceptance Criteria:
  - определены первые каналы роста и публичная упаковка продукта

## Epic 11 — Laravel Migration

### TASK-044 — Зафиксировать стратегию перехода на Laravel
- Status: `done`
- Note: создан `docs/architecture/laravel-migration-plan.md` с фазами миграции, границами rewrite, стоп-сигналами и безопасным порядком переноса API/pages на Laravel без big-bang rewrite.
- Priority: `P0`
- Agent: `Refactor Plan`
- Goal: принять управляемый план миграции на framework
- Scope:
  - migration phases
  - compatibility boundaries
  - rollout order
  - rewrite guardrails
- Deliverables:
  - `docs/architecture/laravel-migration-plan.md`
- Acceptance Criteria:
  - переход разбит на небольшие фазы
  - сохранены текущие URL и клиентские контракты как baseline
  - определено, что не переписывается в first pass

### TASK-045 — Зафиксировать Laravel decision record и freeze текущих контрактов
- Status: `done`
- Note: добавлены `docs/architecture/laravel-decision-record.md` и `docs/architecture/laravel-compatibility-checklist.md`; зафиксированы границы first-pass миграции, обязательные URL/JSON contracts и запрет на rewrite `idle.js`/core gameplay в этой волне.
- Priority: `P0`
- Agent: `Refactor Plan`
- Goal: исключить хаотичный rewrite при переходе на Laravel
- Scope:
  - список совместимых URL
  - JSON contracts
  - список legacy-частей, остающихся на переходный период
  - first-pass ограничения миграции
- Deliverables:
  - decision record
  - compatibility checklist
- Acceptance Criteria:
  - есть явный список контрактов, которые нельзя ломать
  - зафиксировано, что `idle.js` и core gameplay не переписываются в этой волне

### TASK-046 — Поднять Laravel skeleton внутри текущего репозитория
- Status: `done`
- Note: Laravel 12 skeleton поднят в `laravel/` как параллельный runtime; `artisan` и базовый route доступны, а `.env` подготовлен для development-окружения без конфликта с legacy root layout.
- Priority: `P0`
- Agent: `Backend Extraction`
- Goal: подготовить рабочий Laravel runtime рядом с текущим приложением
- Scope:
  - установка Laravel
  - базовый `.env`
  - app key
  - SQLite connection
  - smoke route
- Deliverables:
  - Laravel application skeleton
- Acceptance Criteria:
  - Laravel стартует локально
  - приложение видит текущее окружение и БД

### TASK-047 — Перенести инфраструктурный baseline в Laravel
- Status: `done`
- Note: добавлен `docs/architecture/laravel-bootstrap-baseline.md`; Laravel переведён на file sessions, dev SQLite и отдельный `legacy_sqlite` connection к `db/game.sqlite`, чтобы framework runtime уже видел текущие данные проекта без раннего вмешательства в игровую БД.
- Priority: `P0`
- Agent: `Backend Extraction`
- Goal: убрать самописный bootstrap из критического пути
- Scope:
  - config
  - sessions
  - logging
  - error handling
  - migrations baseline
  - test bootstrap
- Deliverables:
  - Laravel config baseline
  - migration strategy
- Acceptance Criteria:
  - инфраструктурный запуск больше не зависит от legacy bootstrap как primary path
  - Laravel покрывает env/config/session/logging baseline

### TASK-048 — Перенести `ajax/auth.php` на Laravel route/controller
- Status: `done`
- Note: `ajax/auth.php` переведён в thin shim на `laravel/public/index.php`, а в `laravel/routes/web.php` добавлен совместимый route `/ajax/auth.php` с Laravel controller; для переходного периода сохранён native PHP session bridge, чтобы legacy страницы продолжали читать `$_SESSION` без смены клиентских URL.
- Priority: `P0`
- Agent: `Backend Extraction`
- Goal: начать миграцию с ограниченного и хорошо тестируемого API-среза
- Scope:
  - login
  - register
  - logout
  - me
  - session auth compatibility
- Deliverables:
  - Laravel route/controller for auth API
  - regression coverage
- Acceptance Criteria:
  - фронтенд авторизации работает без изменения клиентских URL
  - ручной session bootstrap для auth API больше не нужен

### TASK-049 — Перенести `ajax/save.php` на Laravel route/controller
- Status: `done`
- Note: `ajax/save.php` переведён в thin shim на Laravel; в `laravel/routes/web.php` добавлен совместимый route `/ajax/save.php`, а Laravel controller переиспользует существующий `GameSaveService` и persistence-слой через legacy bridge, сохраняя URL и основные save/load action contracts.
- Priority: `P0`
- Agent: `Backend Extraction`
- Goal: перевести основной игровой API на Laravel без поломки idle-цикла
- Scope:
  - save
  - load
  - buy_prestige
  - minigame_reward
  - dungeon_clear
  - reset_progress
- Deliverables:
  - Laravel route/controller for save API
  - compatibility tests
- Acceptance Criteria:
  - idle/minigame/dungeon продолжают работать без изменения fetch-контрактов
  - legacy save endpoint либо удалён, либо оставлен как thin compatibility shim

### TASK-050 — Перенести page routes и рендеринг на Laravel
- Status: `done`
- Note: в `laravel/routes/web.php` добавлены page routes для `/`, `/index.php`, `/auth.php`, `/idle.php`, `/profile.php`, `/leaderboard.php`, `/game.php`, `/dungeon.php`, `/minigame.php`; Laravel page bridge рендерит существующие legacy PHP-страницы без переписывания HTML/JS и без смены asset paths.
- Priority: `P1`
- Agent: `Backend Extraction`
- Goal: убрать root PHP pages из роли основных entrypoint'ов
- Scope:
  - `index.php`
  - `auth.php`
  - `idle.php`
  - `profile.php`
  - `leaderboard.php`
  - `game.php`
  - `dungeon.php`
  - `minigame.php`
- Deliverables:
  - Laravel web routes
  - controllers/views strategy
- Acceptance Criteria:
  - страницы открываются через Laravel routing
  - текущие шаблоны и assets остаются совместимыми на переходный период

### TASK-051 — Перевести проект на `public/` как единственный web root
- Status: `done`
- Note: в корневом `public/` собран compatibility web root: page-level `public/*.php`, `public/ajax/*.php`, Apache fallback через `public/.htaccess` и временный mirror `public/css`, `public/js`, `public/assets`; добавлена документация `docs/devops/public-web-root.md` и обновлены deploy/environment docs.
- Priority: `P1`
- Agent: `DevOps Baseline`
- Goal: довести структуру до production-safe вида
- Scope:
  - public web root
  - asset path compatibility
  - OSPanel/local server reconfiguration
  - deploy docs update
- Deliverables:
  - updated local/prod serving strategy
- Acceptance Criteria:
  - веб-сервер смотрит в `public/`
  - внутренние PHP-файлы не доступны напрямую извне

### TASK-052 — Выключить legacy bootstrap и root adapters
- Status: `blocked`
- Note: после `TASK-050` страницы уже идут через Laravel routing, но HTML всё ещё рендерится из legacy root page files, а API-контроллеры держатся на native session/security bridge; полное выключение legacy слоя отложено до выполнения `TASK-053`–`TASK-060`.
- Priority: `P1`
- Agent: `Backend Extraction`
- Goal: завершить миграцию и убрать двойную архитектуру
- Scope:
  - legacy bootstrap
  - root adapters
  - obsolete helpers
  - migration cleanup
- Deliverables:
  - cleaned runtime path
- Acceptance Criteria:
  - проект запускается без зависимости от старых entrypoint'ов
  - dual-support слой удалён или сведён к минимуму

### TASK-053 — Убрать дублирование native session/security bridge в Laravel API
- Status: `done`
- Note: добавлен общий `LegacyApiController`, который централизует native session bootstrap, CSRF, rate limit, auth guard и JSON response helpers для compatibility routes; `AuthApiController` и `SaveApiController` переведены на него без смены старых `/ajax/*.php` контрактов.
- Priority: `P1`
- Agent: `Backend Extraction`
- Goal: перестать копировать ручной session/CSRF/rate-limit код по Laravel-контроллерам
- Scope:
  - общий session bootstrap для compatibility mode
  - единая CSRF-проверка для legacy AJAX routes
  - единая обвязка для rate limit и JSON error responses
  - устранение дублирования между `AuthApiController` и `SaveApiController`
- Deliverables:
  - shared Laravel compatibility layer для legacy API
  - обновлённые auth/save controllers без повторяющегося bootstrap-кода
- Acceptance Criteria:
  - в Laravel API-контроллерах нет копипасты `startNativeSession()` и однотипных response helper'ов
  - CSRF/rate-limit/session behavior остаётся совместимым с текущим фронтендом

### TASK-054 — Перевести auth flow с native `$_SESSION` bridge на Laravel session pipeline
- Status: `done`
- Note: добавлен `LegacySessionBridge`; `AuthApiController` и `SaveApiController` теперь читают auth/CSRF состояние из Laravel session как primary source и лишь синхронизируют его в native session для legacy pages. `public/ajax/auth.php` и `public/ajax/save.php` переведены на полный Laravel front controller, чтобы запросы шли через framework session middleware, а не мимо него.
- Priority: `P0`
- Agent: `Backend Extraction`
- Goal: убрать ручное управление PHP-сессией из auth/save HTTP-слоя
- Scope:
  - Laravel session store
  - login/register/logout/me
  - bridge для чтения auth-состояния legacy страницами на переходный период
  - совместимость cookie/session name
- Deliverables:
  - Laravel-based session auth implementation
  - documented compatibility strategy для legacy page reads
- Acceptance Criteria:
  - auth API больше не вызывает manual `session_start()` как основной путь
  - состояние логина переживает переход между Laravel route и legacy page render без регрессий
  - `ajax/auth.php` и `ajax/save.php` используют один источник истины по auth state

### TASK-055 — Вынести security/middleware-политику из контроллеров в Laravel middleware и requests
- Status: `done`
- Note: добавлены action-aware middleware `legacy.action`, `legacy.auth`, `legacy.csrf`, `legacy.throttle`, `legacy.validate` и request-классы `LegacyAuthRequest`/`LegacySaveRequest`; правила доступа, методов, CSRF, throttle и базовой input validation больше не живут в `AuthApiController` и `SaveApiController`, а централизованы на route pipeline.
- Priority: `P0`
- Agent: `Security Hardening`
- Goal: использовать framework pipeline вместо ручных проверок внутри action-методов
- Scope:
  - auth guard middleware
  - CSRF compatibility для legacy AJAX
  - throttle policies
  - request validation для auth/save actions
  - единый exception-to-JSON mapping
- Deliverables:
  - middleware/form-request слой для legacy-compatible routes
  - документация по новой HTTP-политике
- Acceptance Criteria:
  - контроллеры больше не содержат большую часть инфраструктурных проверок
  - правила доступа, throttle и валидации централизованы и покрывают текущие action'ы

### TASK-056 — Перенести shell-страницы на Laravel views без `require` root PHP-файлов
- Status: `done`
- Note: добавлены Laravel controllers для `/`, `/index.php`, `/auth.php`, `/profile.php`, `/leaderboard.php`, введён `PhpPageRenderer`, а HTML этих shell-страниц перенесён в `laravel/resources/views/legacy/pages/*`. Эти маршруты больше не рендерятся через `PageController -> require root file`, при этом сохранены текущие asset paths, nav/logout partials и совместимость с legacy session/auth state.
- Priority: `P1`
- Agent: `Backend Extraction`
- Goal: убрать `PageController -> require root file` как основной механизм рендера
- Scope:
  - `/`, `/auth.php`, `/profile.php`, `/leaderboard.php`
  - layout/head/nav/logout partials
  - прокидывание auth/user view data из Laravel controller
  - совместимость существующих CSS/JS asset paths
- Deliverables:
  - Laravel controllers/views для shell-страниц
  - минимизированный или удалённый `PageController` bridge для этих маршрутов
- Acceptance Criteria:
  - перечисленные страницы рендерятся из `laravel/resources/views` или эквивалентного Laravel view-layer
  - root `index.php`, `auth.php`, `profile.php`, `leaderboard.php` больше не нужны как renderer entrypoints

### TASK-057 — Перенести `idle.php`, `dungeon.php`, `minigame.php`, `game.php` на Laravel page adapters
- Status: `done`
- Note: добавлены Laravel controllers для `/idle.php`, `/dungeon.php`, `/minigame.php`, `/game.php`; HTML этих gameplay-страниц перенесён в `laravel/resources/views/legacy/pages/*`, а route rendering больше не проходит через `PageController -> require root file`. Сохранены текущие JS/CSS/CDN подключения, auth/CSRF context и server-side page data вроде idle greeting и dungeon account level.
- Priority: `P1`
- Agent: `Backend Extraction`
- Goal: убрать оставшиеся gameplay page entrypoint'ы из корня без переписывания клиентской логики
- Scope:
  - контроллеры и view adapters для игровых страниц
  - server-side page data, которые сейчас готовятся в root PHP
  - подключение существующих JS/CSS/CDN зависимостей
  - совместимость ссылок и asset URL
- Deliverables:
  - Laravel-rendered activity/game pages
  - список оставшихся legacy include/shim точек после переноса
- Acceptance Criteria:
  - игровые страницы открываются через Laravel views/controllers без `require` root PHP-файлов
  - `idle.js`, `dungeon.js`, inline game/minigame scripts работают без смены URL-контрактов

### TASK-058 — Перенести shared backend-слой в Laravel autoload/container и удалить `LegacyRuntime`
- Status: `pending`
- Priority: `P1`
- Agent: `Backend Extraction`
- Goal: избавиться от ручного подключения `src/` и `security.php` внутри Laravel runtime
- Scope:
  - PSR-4/autoload strategy для общего backend-кода
  - binding сервисов и репозиториев в Laravel container
  - перенос security helper'ов в framework-aware слой
  - удаление `LegacyRuntime` и связанных require_once мостов
- Deliverables:
  - Laravel-native bootstrap для shared services
  - обновлённая структура подключения backend-кода
- Acceptance Criteria:
  - Laravel runtime не зависит от `LegacyRuntime::initialize()`
  - сервисы и репозитории резолвятся через container/configuration, а не через manual wiring в контроллерах

### TASK-059 — Добавить Laravel feature/regression покрытие для migration compatibility
- Status: `pending`
- Priority: `P1`
- Agent: `Testing Bootstrap`
- Goal: зафиксировать переходный контракт до финального удаления legacy entrypoint'ов
- Scope:
  - feature tests для `/ajax/auth.php` и `/ajax/save.php`
  - smoke tests для page routes
  - проверки auth/session continuity между page и API routes
  - проверки compatibility response shape и статусов
- Deliverables:
  - Laravel-side feature/regression tests
  - documented smoke checklist для post-cutover проверки
- Acceptance Criteria:
  - критичные Laravel routes проверяются автотестами
  - перед удалением legacy adapters есть автоматическая страховка на совместимость

### TASK-060 — Закрыть cleanup-этап и завершить выключение legacy runtime
- Status: `pending`
- Priority: `P1`
- Agent: `Backend Extraction`
- Goal: довести миграцию до состояния single-runtime без двойной поддержки
- Scope:
  - удаление root adapters и obsolete shims
  - удаление старого bootstrap/security glue, если он больше не нужен runtime
  - обновление deploy/runbook/test docs под финальный Laravel flow
  - финальная ревизия public entrypoints
- Deliverables:
  - cleaned Laravel-first runtime
  - закрывающая документация по удалённым legacy-точкам
- Acceptance Criteria:
  - web/API runtime идёт через Laravel без обязательных root PHP adapters
  - `TASK-052` можно перевести из `blocked` в `done`
  - документация и smoke-check отражают финальное состояние проекта

## Рекомендуемый порядок запуска агентов

1. `TASK-001` -> `TASK-002` -> `TASK-003`
2. `TASK-005` -> `TASK-006` -> `TASK-007` -> `TASK-008`
3. `TASK-009` -> `TASK-010` -> `TASK-011` -> `TASK-012` -> `TASK-013`
4. `TASK-014` -> `TASK-015` -> `TASK-016` -> `TASK-017`
5. `TASK-018` -> `TASK-019` -> `TASK-020` -> `TASK-021` -> `TASK-022`
6. `TASK-027` -> `TASK-028` -> `TASK-029` -> `TASK-030`
7. `TASK-023` -> `TASK-024` -> `TASK-025` -> `TASK-026`
8. `TASK-031` -> `TASK-032` -> `TASK-033` -> `TASK-034`
9. `TASK-035` -> `TASK-036` -> `TASK-037`
10. `TASK-038` -> `TASK-039` -> `TASK-040` -> `TASK-061` -> `TASK-062` -> `TASK-063` -> `TASK-064` -> `TASK-065` -> `TASK-066` -> `TASK-067` -> `TASK-068` -> `TASK-069` -> `TASK-070` -> `TASK-071` -> `TASK-072` -> `TASK-073` -> `TASK-074`
11. `TASK-041` -> `TASK-042` -> `TASK-043`
12. `TASK-044` -> `TASK-045` -> `TASK-046` -> `TASK-047` -> `TASK-048` -> `TASK-049` -> `TASK-050` -> `TASK-051`
13. `TASK-053` -> `TASK-054` -> `TASK-055` -> `TASK-056` -> `TASK-057` -> `TASK-058` -> `TASK-059` -> `TASK-060` -> `TASK-052`

## Definition of Done для любой задачи

- Изменение локализовано и понятно.
- Не сломан существующий пользовательский сценарий без отдельного согласования.
- Добавлены или обновлены документы, если меняется архитектура или процесс.
- Если меняется код, есть проверка результата: тест, smoke-check или ручной сценарий.
- Если задача архитектурная, остаётся decision record или понятный итоговый документ.
