# Storage Strategy для product analytics events

## Цель

Отделить продуктовую аналитику от:

- игрового save blob
- security logs
- leaderboard projection

Analytics события нужны для append-only анализа поведения, а не для хранения текущего состояния игрока.

## Почему нельзя писать аналитику в `game_saves`

- `game_saves.save_data` хранит snapshot состояния, а не историю действий
- события быстро раздуют JSON blob
- аналитика требует фильтрации по времени, типу события и сегментам
- смешивание state и event history ухудшит и запись, и чтение

## Почему analytics не должны жить в security log

- security log описывает подозрительные или защитные события
- у security и product analytics разные пользователи, разные retention windows и разные вопросы к данным

## Рекомендуемое baseline-хранилище

Минимальный вариант для текущего этапа:

- отдельная SQLite-таблица `analytics_events`

Почему это подходит сейчас:

- проект уже использует SQLite
- объём событий пока умеренный
- событийному baseline не нужен внешний аналитический стек на первом шаге

## Предлагаемая таблица

```sql
CREATE TABLE analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    event_version INTEGER NOT NULL DEFAULT 1,
    source_surface TEXT NOT NULL,
    session_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    user_id INTEGER NULL,
    is_authenticated INTEGER NOT NULL DEFAULT 0,
    payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Индексы первой очереди

```sql
CREATE INDEX idx_analytics_events_name_time
    ON analytics_events (event_name, occurred_at);

CREATE INDEX idx_analytics_events_user_time
    ON analytics_events (user_id, occurred_at);

CREATE INDEX idx_analytics_events_device_time
    ON analytics_events (device_id, occurred_at);

CREATE INDEX idx_analytics_events_session
    ON analytics_events (session_id);
```

## Поля и их роль

### `event_name`

- имя события по каталогу из `docs/product/analytics-events.md`

### `occurred_at`

- фактическое время события
- использовать UTC

### `event_version`

- даёт возможность менять payload без слома downstream-расчётов

### `source_surface`

- `idle`, `minigame`, `dungeon`, `auth`, `profile`

### `session_id`

- связка событий в рамках одной сессии

### `device_id`

- главный ключ для guest analytics и guest -> login conversion

### `user_id`

- появляется после аутентификации

### `payload_json`

- гибкое поле для event-specific параметров

## Режим записи

Рекомендуемый baseline:

- append-only inserts
- без update уже записанных event rows
- без попытки пересчитывать историю на месте

## Где логировать

На ранней стадии допустима гибридная схема:

- клиент шлёт analytics-событие в отдельный endpoint
- сервер добавляет общие поля и пишет событие в таблицу

Почему не чисто клиент:

- часть ключевых событий должна подтверждаться сервером
- сервер лучше контролирует timestamp, user binding и антиспам

Почему не чисто сервер:

- часть UX-событий существует только на клиенте, например старт сессии или старт minigame run

## Идемпотентность и дубли

Чтобы не ловить двойные записи, у client-tracked событий нужен `event_uuid`.

Рекомендация:

- добавить в контракт ещё одно поле `event_uuid`
- на сервере держать уникальный индекс по `event_uuid`

Если это кажется лишним для первого запуска, допустим временный вариант без dedupe только для low-volume rollout, но это слабее.

## Срок хранения

Baseline:

- сырые события хранить минимум 90 дней
- агрегаты по дням можно хранить дольше

Причина:

- D1/D7 retention и анализ cohort behavior требуют истории

## Что агрегировать позже

После появления реального event потока стоит добавить daily aggregate слой:

- `analytics_daily_players`
- `analytics_daily_events`
- `analytics_daily_funnels`

Но это не нужно в первой итерации. Сначала важнее иметь сырые события и корректный schema contract.

## Границы системы

В `analytics_events` не должны попадать:

- полный `save_data`
- секреты сессии
- пароли и auth-sensitive значения
- security-only payloads

Допустимо хранить:

- account level
- prestige
- выбранный класс dungeon
- reward amounts
- агрегированные progression snapshots в payload

## Growth path

### Этап 1. SQLite baseline

- одна таблица событий
- несколько ключевых индексов
- простые SQL-агрегации

### Этап 2. Daily aggregates

- materialized daily summaries
- cohort queries без полного сканирования сырья

### Этап 3. Выход за пределы SQLite

Триггеры перехода:

- событий становится заметно больше, чем игровых write-операций
- cohort/segment queries начинают мешать runtime
- нужны near-real-time dashboards

Тогда analytics уходит в отдельное хранилище или отдельную БД, а не в основную игровую SQLite.

## Итоговое решение

- Product analytics хранить отдельно от `game_saves`, `leaderboard` и `security.log`
- На текущем этапе использовать отдельную таблицу `analytics_events`
- Считать таблицу append-only event log
- Начинать с минимального event schema из `docs/product/analytics-events.md`
