# Жизнь программиста

Юмористический PHP-проект с лендингом, idle-игрой, текстовым квестом, dungeon-режимом и серверными сохранениями на SQLite.

## Требования

- PHP 8.3+
- Composer 2
- Node.js 22+ для JS lint
- Локальный веб-сервер

Репозиторий исторически запускался через OSPanel на Windows, но текущая структура также позволяет локальный запуск через встроенный PHP server для базовой разработки.

## Быстрый старт

1. Установить зависимости:

```bash
composer install
```

2. Создать локальный env-файл:

```bash
cp .env.example .env
```

На Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. При необходимости поправить `.env`:

- `APP_URL`
- `APP_TIMEZONE`
- `DB_PATH`
- `DB_MIGRATIONS_PATH`
- session/storage settings

4. Убедиться, что writable-директории доступны для записи:

- `db/` или путь из `DB_PATH`
- `storage/logs/`
- `storage/ratelimits/`
- `storage/tmp/`

5. Запустить локальный сервер.

Вариант A: OSPanel / локальный Apache/Nginx
- направить document root на корень проекта

Вариант B: встроенный PHP server

```bash
php -S 127.0.0.1:8080
```

После этого проект будет доступен на `http://127.0.0.1:8080`.

## База данных и миграции

- SQLite-файл создаётся автоматически по пути из `DB_PATH`
- при первом подключении запускается migration runner
- актуальная схема хранится в `migrations/`

Документация:
- `docs/data/migration-flow.md`

## Полезные команды

Запуск тестов:

```bash
composer test
```

Сборка browser runtime для `/season1.php`:

```bash
cd laravel
npm install
cd ..
composer build:season1
```

Команда компилирует `src/season1/*.ts` через локальный `typescript` из `laravel/node_modules`, обновляет `js/season1/*` и зеркалит runtime в `public/js/season1/*` плюс `public/css/season1.css`.

PHP + JS lint:

```bash
composer lint
```

Проверка форматирования:

```bash
composer format:check
```

Автоформатирование:

```bash
composer format
```

## Структура, важная для запуска

- `bootstrap/app.php` — общий bootstrap
- `config/` — конфигурация приложения, БД, security и storage
- `migrations/` — SQL-миграции
- `src/` — backend-логика
- `storage/` — логи, rate limits, tmp
- `tests/` — integration tests и test tooling

## Проверка локального запуска

Минимальный smoke-check после старта:

1. Открыть `/index.php`
2. Открыть `/auth.php`
3. Зарегистрировать тестового пользователя
4. Открыть `/idle.php`
5. Проверить, что сервер создаёт SQLite и пишет runtime-файлы в `storage/`

## Документация DevOps

- `docs/devops/environments.md`
- `docs/devops/deploy.md`
- `docs/devops/monitoring.md`
