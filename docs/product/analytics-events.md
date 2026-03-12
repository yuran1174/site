# Каталог продуктовых событий

## Задача

Продукту нужна событийная аналитика, которая показывает не pageviews, а реальные решения игрока:

- вошёл ли он в основной idle loop
- дошёл ли до первого престижа
- пользуется ли активными режимами
- где теряется между страницами и наградами

Этот документ задаёт минимальный event schema baseline для `TASK-035`.

## Принципы

- События описывают действия или подтверждённые результаты, а не каждую отрисовку UI.
- По возможности считать события только в точке успешного действия.
- Один и тот же продуктовый факт не должен логироваться из двух мест как два разных события.
- У каждого события должен быть понятный `trigger`, `actor scope` и набор обязательных параметров.

## Модель события

Рекомендуемый конверт для всех product events:

```json
{
  "event_name": "prestige_completed",
  "occurred_at": "2026-03-13T12:34:56Z",
  "event_version": 1,
  "source_surface": "idle",
  "session_id": "uuid-or-generated-id",
  "device_id": "anonymous-stable-id",
  "user_id": 123,
  "is_authenticated": true,
  "payload": {}
}
```

## Общие поля

Обязательные:

- `event_name`
- `occurred_at`
- `event_version`
- `source_surface`
- `session_id`
- `device_id`
- `is_authenticated`

Опциональные:

- `user_id`
- `payload`

## Скоуп идентичности

До логина:

- связываем события через `device_id + session_id`

После логина:

- добавляем `user_id`
- сохраняем `device_id`, чтобы видеть guest -> account conversion

## Набор событий первой очереди

Это минимальный baseline, который уже даёт ответы на метрики из `docs/product/metrics.md`.

### 1. `session_started`

Когда слать:

- при первом открытии игровой поверхности в новой сессии

Поверхности:

- `idle`
- `minigame`
- `dungeon`
- `profile`

Обязательный payload:

- `entry_point`: `direct`, `nav`, `return_from_activity`, `post_login`, `unknown`
- `account_level`
- `prestige`

Зачем:

- считать session volume
- строить retention и blended session map

### 2. `idle_activated`

Когда слать:

- один раз на игрока, когда выполнены activation criteria из `metrics.md`

Payload:

- `time_from_first_idle_session_sec`
- `total_loc`
- `total_clicks`
- `building_count`

Зачем:

- измерять activation rate не по page open, а по реальному входу в loop

### 3. `building_purchased`

Когда слать:

- после успешной покупки здания

Payload:

- `building_id`
- `quantity`
- `new_count`
- `cost_total`
- `loc_after`
- `loc_per_second_after`

Зачем:

- понимать pacing ранней экономики
- видеть, где ломается progression curve

### 4. `upgrade_purchased`

Когда слать:

- после успешной покупки апгрейда

Payload:

- `upgrade_id`
- `category`
- `cost`
- `loc_after`
- `loc_per_second_after`

Зачем:

- смотреть, какие апгрейды реально покупают и где unlock pacing работает плохо

### 5. `prestige_started`

Когда слать:

- когда игрок подтверждает престиж и запускает flow

Payload:

- `current_prestige`
- `loc_this_run`
- `building_types`
- `upgrade_count`
- `predicted_oo_reward`

Зачем:

- видеть намерение престижить
- отделять страх/отмену от успешного завершения

### 6. `prestige_completed`

Когда слать:

- только после фактического увеличения `prestige`

Payload:

- `new_prestige`
- `oo_earned`
- `prestige_multiplier_after`
- `total_loc_lifetime`
- `account_level_after`

Зачем:

- считать prestige conversion
- измерять first prestige time и repeat prestige rate

### 7. `prestige_shop_purchase`

Когда слать:

- после успешной покупки в prestige shop

Payload:

- `item_id`
- `new_level`
- `remaining_oo`
- `current_prestige`

Зачем:

- видеть, какие permanent upgrades реально выбирают игроки

### 8. `minigame_started`

Когда слать:

- при нажатии на старт мини-игры

Payload:

- `account_level`
- `prestige`

Зачем:

- считать minigame engagement

### 9. `minigame_finished`

Когда слать:

- по завершении раунда мини-игры

Payload:

- `bugs_caught`
- `loc_reward`
- `oo_reward`
- `duration_sec`

Зачем:

- оценивать skill spread и reward curve

### 10. `minigame_reward_applied`

Когда slать:

- когда награда подтверждённо применена локально или сервером

Payload:

- `apply_mode`: `local`, `server`
- `bugs_caught`
- `loc_reward`
- `oo_reward`

Зачем:

- видеть, сколько результатов игры реально доходит до прогрессии

### 11. `dungeon_started`

Когда слать:

- после выбора класса и старта run

Payload:

- `class_id`
- `account_level`
- `prestige`
- `dungeon_clears_lifetime`

Зачем:

- считать dungeon engagement
- сравнивать спрос на классы

### 12. `dungeon_finished`

Когда слать:

- при смерти или при победе

Payload:

- `result`: `death`, `clear`
- `floor_reached`
- `player_level`
- `xp_earned`
- `loc_reward`
- `oo_reward`
- `class_id`

Зачем:

- понимать completion funnel
- балансировать сложность и награды

### 13. `auth_registered`

Когда слать:

- после успешной регистрации

Payload:

- `source_surface`
- `had_guest_progress`: `true/false`

Зачем:

- считать register conversion

### 14. `auth_logged_in`

Когда слать:

- после успешного логина

Payload:

- `source_surface`
- `had_guest_progress`: `true/false`

Зачем:

- считать login conversion

### 15. `save_succeeded`

Когда слать:

- после успешного server save

Payload:

- `save_origin`: `idle_manual`, `idle_interval`, `post_prestige`, `reward_merge`, `unknown`
- `total_loc`
- `prestige`
- `account_level`

Зачем:

- считать save coverage
- видеть, когда игрок реально фиксирует прогресс

## События второй очереди

Не обязательны для первого baseline, но полезны позже:

- `story_chapter_unlocked`
- `achievement_unlocked`
- `random_event_triggered`
- `activity_card_clicked`
- `profile_opened`
- `leaderboard_opened`

Причина не брать в первую очередь:

- они полезны для depth analysis, но не критичны для top-line KPI

## Карта событий к метрикам

### Activation

- `session_started`
- `idle_activated`

### Retention

- `session_started`

### Average Session Length

- `session_started`
- future `session_ended`

### Login Conversion

- `auth_registered`
- `auth_logged_in`

### Prestige Conversion

- `prestige_completed`

### Dungeon Engagement

- `dungeon_started`
- `dungeon_finished`

### Minigame Engagement

- `minigame_started`
- `minigame_finished`
- `minigame_reward_applied`

### Save Coverage

- `save_succeeded`

## Точки истины

Чтобы не плодить дублей, события лучше считать в таких местах:

- `prestige_completed`: в idle runtime после фактического увеличения `state.prestige`
- `prestige_shop_purchase`: в успешном ответе `buy_prestige`
- `minigame_finished`: в `minigame.php` на result screen
- `minigame_reward_applied`: при успешном apply flow
- `dungeon_started`: в `startGame(classId)` после выбора класса
- `dungeon_finished`: в `showDeath()` и `showWin()`
- `save_succeeded`: после успешного server response
- `auth_registered` / `auth_logged_in`: в успешном auth flow

## Правила против шума

- Не логировать клик по основной кнопке каждую миллисекунду.
- Не логировать каждый idle tick.
- Не логировать каждый render/updateTopBar.
- Не логировать локальные промежуточные состояния, если есть итоговое подтверждённое событие.

## Риски

- Если считать события и на клиенте, и на сервере без общего ключа, появятся дубли.
- Если не привязать guest events к device identity, login conversion будет занижен.
- Если не различать `finished` и `reward_applied`, minigame/dungeon будут выглядеть успешнее, чем есть на самом деле.

## Следующий шаг

Техническая реализация должна начать с первой очереди событий и не пытаться сразу покрыть весь продукт. Достаточно, чтобы первый rollout дал надёжные данные по:

- activation
- login conversion
- first prestige
- minigame engagement
- dungeon engagement
- save coverage
