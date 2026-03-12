# Dev seed baseline

Каталог содержит baseline-профили для локальной разработки и ручного smoke-тестирования.

## Профили

- `early-game.json` — ранний игрок
- `mid-game.json` — игрок середины прогрессии
- `late-game.json` — продвинутый игрок

## Как применить

Из корня проекта:

```bash
composer seed:dev
```

По умолчанию данные записываются в `db/game.sqlite`.

Для отдельной временной БД:

```bash
php scripts/seed/dev-seed.php --db=storage/tmp/dev-seed.sqlite
```

## Тестовые логины

У всех профилей пароль одинаковый:

```text
devpass123
```
