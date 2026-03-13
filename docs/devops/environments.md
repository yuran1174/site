# Стратегия окружений

## Цель

Разделить локальную разработку, stage и production на уровне явных переменных окружения и операционных правил.

## Окружения

### `development`

Назначение:
- локальная разработка
- ручная проверка UI и игровых flows
- запуск тестов и линтеров

Рекомендации:
- `APP_ENV=development`
- `APP_DEBUG=true`
- `APP_DISPLAY_ERRORS=true`
- `APP_LOG_ERRORS=true`
- SQLite в локальном пути
- `SESSION_COOKIE_SECURE=false`, если нет HTTPS

### `stage`

Назначение:
- предпрод-проверка deploy flow
- smoke/regression checks
- ручная QA перед production

Рекомендации:
- `APP_ENV=stage`
- `APP_DEBUG=false`
- `APP_DISPLAY_ERRORS=false`
- `APP_LOG_ERRORS=true`
- отдельная БД/копия данных stage
- HTTPS обязателен
- `SESSION_COOKIE_SECURE=true`

### `production`

Назначение:
- пользовательский трафик

Рекомендации:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_DISPLAY_ERRORS=false`
- `APP_LOG_ERRORS=true`
- отдельный production DB path
- HTTPS обязателен
- `SESSION_COOKIE_SECURE=true`

## Минимальный набор переменных

### Application

- `APP_ENV`
- `APP_DEBUG`
- `APP_DISPLAY_ERRORS`
- `APP_LOG_ERRORS`
- `APP_URL`
- `APP_TIMEZONE`

### Database

- `DB_DRIVER`
- `DB_PATH`
- `DB_MIGRATIONS_PATH`

### Session / Security

- `SESSION_USE_ONLY_COOKIES`
- `SESSION_USE_STRICT_MODE`
- `SESSION_COOKIE_HTTPONLY`
- `SESSION_COOKIE_SECURE`
- `SESSION_COOKIE_SAMESITE`
- `SESSION_COOKIE_PATH`
- `SESSION_COOKIE_DOMAIN`

### Storage

- `STORAGE_PATH`
- `STORAGE_LOGS_PATH`
- `STORAGE_RATELIMITS_PATH`
- `STORAGE_SESSIONS_PATH`
- `STORAGE_TMP_PATH`

## Правила

1. `.env` не коммитится.
2. Для каждого окружения используется свой набор значений.
3. Production не должен использовать `APP_DEBUG=true`.
4. Production и stage не должны писать в один и тот же SQLite-файл.
5. Любые новые runtime-path настройки добавляются в `config/` и `.env.example`, а не хардкодятся в PHP.
6. Для Laravel migration baseline document root локального и production сервера должен указывать на `/public`.

## Практическая схема файлов

- `.env.example` — шаблон
- `.env` — локальная разработка
- stage/prod переменные — через панель хостинга, system env или секреты CI/CD

Не нужно коммитить `.env.stage` или `.env.production`, если в проекте нет защищённого способа их хранения.
