# Monitoring And Uptime

## Цель

Получать сигнал о проблемах раньше, чем придёт жалоба пользователя.

## Минимальный baseline

### 1. Error logging

Уже есть:
- `APP_LOG_ERRORS`
- security logging в `storage/logs/security.log`

Нужно считать baseline-обязательным:
- хранить PHP error log отдельно от web access log
- не показывать ошибки пользователю в production
- периодически проверять размер логов и ротацию

### 2. Security / abuse signals

Уже есть:
- CSRF failures
- rate limit events
- malformed payload logging
- suspicious save/reward jumps

Источник:
- `storage/logs/security.log`

### 3. Uptime checks

Минимальный набор URL:
- `/index.php`
- `/auth.php`
- `/idle.php`
- `/ajax/auth.php?action=me`

Для API baseline достаточно проверять:
- HTTP status
- время ответа
- отсутствие 5xx

### 4. SQLite health

Для проекта на SQLite нужно наблюдать:
- доступность файла БД
- права на запись
- наличие свободного места на диске
- успешное создание backup

## Рекомендуемый baseline для stage/prod

### Application

- uptime monitor с интервалом 1 минута
- алерт при 2-3 подряд сбоях
- ручной smoke-check после deploy

### Logs

- ежедневная проверка PHP error log
- ежедневная проверка `storage/logs/security.log`
- ротация или архивирование логов

### Deployment

- алерт на неуспешный deploy
- фиксация release SHA в release notes или changelog deploy-а

## Что можно использовать

Подходящие внешние инструменты:
- Uptime Kuma
- Better Stack Uptime
- Healthchecks.io
- Sentry для PHP errors, если проект дорастёт до внешнего error tracking

Важно:
- не подменять реальную observability “фиктивной интеграцией”
- если внешний сервис ещё не подключён, это должно быть явно задокументировано как prerequisite

## Минимальный операционный регламент

1. Проверять uptime dashboard после каждого deploy
2. Проверять error/security logs ежедневно или после инцидента
3. При росте числа 5xx сначала смотреть:
   - права на `storage/`
   - права на SQLite path
   - последние migration changes
   - security log

## Текущий статус

Автоматизировано:
- CI baseline
- security log baseline
- application bootstrap/config baseline

Пока только документировано:
- production uptime monitoring
- external alerting
- formal log rotation
- deploy-time health gate
