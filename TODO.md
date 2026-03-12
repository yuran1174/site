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
- Status: `partial`
- Note: добавлены `.env.example` и базовый `config/` (`app.php`, `database.php`), но полноценное разделение dev/prod и замена всех захардкоженных значений по проекту ещё не завершены.
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
- Status: `partial`
- Note: добавлен `src/Infrastructure/Database/`, а `db.php` переведён в thin wrapper над `DatabaseManager`; часть кода всё ещё зависит от `DB::get()` как compatibility-слоя.
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
- Status: `partial`
- Note: добавлены cap'ы наград, нормализация save payload, серверный пересчёт `prestigeMulti`, логирование подозрительных скачков и `docs/security/anti-cheat-baseline.md`; полноценной серверно-авторитативной модели прогресса пока нет.
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
- Status: `partial`
- Note: добавлены PHP formatter/lint baseline (`php-cs-fixer`, `tests/Tools/php-lint.php`, composer scripts `lint`, `format`, `format:check`); JS linting strategy и конфиг пока не введены.
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
10. `TASK-038` -> `TASK-039` -> `TASK-040`
11. `TASK-041` -> `TASK-042` -> `TASK-043`

## Definition of Done для любой задачи

- Изменение локализовано и понятно.
- Не сломан существующий пользовательский сценарий без отдельного согласования.
- Добавлены или обновлены документы, если меняется архитектура или процесс.
- Если меняется код, есть проверка результата: тест, smoke-check или ручной сценарий.
- Если задача архитектурная, остаётся decision record или понятный итоговый документ.
