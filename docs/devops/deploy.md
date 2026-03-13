# Deploy Strategy

## Цель

Сделать deploy повторяемым и достаточно безопасным для небольшого PHP + SQLite проекта.

## Предпосылки

- target host умеет запускать PHP 8.3+
- есть writable storage path
- есть writable DB path
- production использует HTTPS
- окружение получает корректные env values
- web server должен смотреть в `/public`, а не в корень репозитория

## Рекомендуемый release flow

1. Изменения попадают в `main`
2. CI проходит базовые проверки:
   - `composer validate`
   - `composer install`
   - `composer lint`
   - `composer test`
   - `composer format:check`
3. Деплой берёт конкретный commit SHA
4. На сервер доставляется код релиза
5. Устанавливаются production dependencies
6. document root сервера указывает на `public/`
7. Применяются миграции через обычный bootstrap/первое подключение к БД или через отдельный warmup step
8. Выполняется smoke-check ключевых страниц
9. Трафик переключается на новый release

## Минимальный пошаговый deploy

### 1. Подготовить релиз

- проверить зелёный CI
- зафиксировать commit SHA

### 2. Обновить код на сервере

Примерно:

```bash
git fetch origin
git checkout <release-sha>
composer install --no-dev --optimize-autoloader
```

Если Laravel runtime ещё живёт в подпапке `laravel/`, нужно убедиться, что его зависимости тоже установлены и доступны.

### 3. Проверить env

Проверить:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_DISPLAY_ERRORS=false`
- `SESSION_COOKIE_SECURE=true`
- корректный `DB_PATH`

### 4. Проверить writable пути

- `storage/logs`
- `storage/ratelimits`
- `storage/sessions`
- `storage/tmp`
- директория SQLite-файла
- `laravel/storage/*`, если framework runtime пишет свои логи/кэш

### 5. Применить миграции

Текущая baseline-стратегия:
- миграции применяются автоматически при первом подключении к БД

Практический вариант:
- после доставки кода выполнить один HTTP warmup request или CLI bootstrap, чтобы миграции применились до реального трафика

### 6. Smoke-check

Проверить:
- `/`
- `/index.php`
- `/auth.php`
- `/idle.php`
- `/leaderboard.php`
- auth login/register

См. также:
- `docs/devops/public-web-root.md`

## Rollback

Rollback обязателен, потому что проект использует SQLite и файловые runtime-артефакты.

Минимальный rollback flow:

1. Остановить выкладку нового релиза
2. Переключить код на предыдущий стабильный commit
3. Проверить env и writable paths
4. Выполнить smoke-check
5. Если проблема связана с БД:
   - восстановить SQLite из backup
   - проверить совместимость кода и схемы

## Backup strategy

Минимум:
- регулярная копия SQLite-файла
- хранение нескольких последних backup-версий
- backup перед deploy с миграцией

## Asset/versioning strategy

Сейчас проект использует статические `css/` и `js/` файлы без build pipeline.

Baseline-подход:
- на небольших релизах достаточно cache busting через query string или version stamp
- при крупных изменениях фронтенда лучше ввести версионирование ассетов централизованно

## Что ещё не автоматизировано

- отдельная release-команда для миграций
- автоматический health-check gate до переключения трафика
- автоматический rollback
