# MVP game state schema: Season 1 `Скуф-пати`

## Задача

Ядро игры уже описано на уровне систем. Следующий шаг — не интерфейс, а state model. Нужно зафиксировать, какие данные реально нужны игре, чтобы:

- проживать daily loop
- держать ресурсное давление
- двигать проект
- учитывать связи с персонажами
- открывать progression акта 1

Цель документа: определить минимальный, но достаточный state schema для первой играбельной версии.

## Принцип

State должен быть:

- достаточно маленьким для MVP
- достаточно явным для сценарных и системных unlock'ов
- пригодным для save/load без россыпи ad-hoc полей

Главное правило:

- не хранить всё подряд
- хранить только то, что реально влияет на решения игрока, progression и ближайшие сцены

## Верхнеуровневые блоки состояния

Для MVP игре достаточно таких state slices:

1. `calendar`
2. `resources`
3. `hero`
4. `project`
5. `relationships`
6. `group`
7. `room`
8. `progression`
9. `content`
10. `meta`

## 1. `calendar`

Этот блок нужен для day loop и weekly rhythm.

```json
{
  "calendar": {
    "day": 1,
    "weekday": "monday",
    "week": 1,
    "phase": "morning"
  }
}
```

### Обязательные поля

- `day`
- `weekday`
- `week`
- `phase`

### Зачем

- открывать пятничные и выходные ритмы
- контролировать фазу дня
- считать progression окна

## 2. `resources`

Это главный pressure-layer.

```json
{
  "resources": {
    "time_evening": 2,
    "energy": 55,
    "money": 1200,
    "impulse": 18,
    "stress": 34
  }
}
```

### Обязательные поля

- `time_evening`
- `energy`
- `money`
- `impulse`
- `stress`

### Почему именно они

- `time_evening` задаёт реальную агентность вечера
- `energy` определяет, что герой тянет
- `money` держит взрослое давление
- `impulse` даёт шанс на хороший вечер
- `stress` нужен как контрвес к слишком линейной модели энергии

### Инварианты

- `energy` в диапазоне `0..100`
- `impulse` в диапазоне `0..100`
- `stress` в диапазоне `0..100`
- `time_evening` не уходит в минус
- `money` может быть низким, но не должен уходить в бесконечный мусорный минус в MVP

## 3. `hero`

Этот блок нужен не для RPG-статов, а для жизненного состояния.

```json
{
  "hero": {
    "burnout": 22,
    "stability": 15,
    "has_acknowledged_idea": false,
    "last_outcome": "heavy_but_useful"
  }
}
```

### Обязательные поля

- `burnout`
- `stability`
- `has_acknowledged_idea`
- `last_outcome`

### Зачем

- `burnout` — более длинная тень, чем энергия одного дня
- `stability` — медленно растущая устойчивость жизни
- `has_acknowledged_idea` — критичный narrative/system flag
- `last_outcome` — нужен для триггеров и утренних последствий

## 4. `project`

Это основной производственный контур игры.

```json
{
  "project": {
    "seed": 1,
    "clarity": 12,
    "prototype_quality": 8,
    "showable_build": false,
    "last_action": "drafted_idea"
  }
}
```

### Обязательные поля

- `seed`
- `clarity`
- `prototype_quality`
- `showable_build`
- `last_action`

### Что они значат

- `seed`: проект вообще начал существовать или нет
- `clarity`: насколько идея стала оформленной
- `prototype_quality`: насколько есть что показывать
- `showable_build`: binary gate для ряда сцен
- `last_action`: полезно для реактивного narrative и последствий

### Инварианты

- `showable_build = true` только если `seed > 0` и `prototype_quality` выше минимального порога

## 5. `relationships`

Ключевой блок новой игры.

```json
{
  "relationships": {
    "cash": {
      "introduced": true,
      "bond": 1,
      "last_interaction_day": 1
    },
    "max": {
      "introduced": false,
      "bond": 0,
      "last_interaction_day": null
    },
    "zhora": {
      "introduced": false,
      "bond": 0,
      "last_interaction_day": null
    },
    "denis": {
      "introduced": false,
      "bond": 0,
      "last_interaction_day": null
    },
    "zheka": {
      "introduced": false,
      "bond": 0,
      "last_interaction_day": null
    },
    "kostya": {
      "introduced": false,
      "bond": 0,
      "last_interaction_day": null
    },
    "ilya": {
      "introduced": false,
      "bond": 0,
      "last_interaction_day": null
    }
  }
}
```

### Обязательные поля на персонажа

- `introduced`
- `bond`
- `last_interaction_day`

### Чего пока не надо

- сложных ветвящихся morality-таблиц
- десятка подстатов на каждого персонажа

Для MVP `bond` + `introduced` + `last_interaction_day` достаточно.

## 6. `group`

Этот блок отличает "есть люди" от "есть круг".

```json
{
  "group": {
    "circle_trust": 0,
    "group_momentum": 0,
    "shared_context": 0
  }
}
```

### Обязательные поля

- `circle_trust`
- `group_momentum`
- `shared_context`

### Зачем

- `circle_trust`: насколько группа уже чувствует себя группой
- `group_momentum`: идея ещё жива между встречами или нет
- `shared_context`: был ли уже совместный опыт, а не только отдельные контакты

## 7. `room`

Комната — это spatial feedback loop.

```json
{
  "room": {
    "comfort": 8,
    "order": 5,
    "project_corner": 3,
    "upgrades": {
      "desk_lamp": true,
      "second_monitor": false,
      "better_chair": false
    }
  }
}
```

### Обязательные поля

- `comfort`
- `order`
- `project_corner`
- `upgrades`

### Зачем

- `comfort` влияет на восстановление
- `order` влияет на ощущение стабильности и некоторые проектные действия
- `project_corner` отражает, стало ли пространство ближе к рабочему месту для своей игры

### Принцип

Room state должен влиять мягко, а не превращаться в доминирующую экономическую таблицу.

## 8. `progression`

Это системные флаги акта и сезона.

```json
{
  "progression": {
    "act": 1,
    "act_1_completed": false,
    "team_gathering_started": false,
    "season_intent": 0
  }
}
```

### Обязательные поля

- `act`
- `act_1_completed`
- `team_gathering_started`
- `season_intent`

### Зачем

- `season_intent` нужен как более честный сезонный вектор, чем старая мета-валюта
- `team_gathering_started` — ключевой флаг перехода от акта 1 к следующему слою игры

## 9. `content`

Нужен для контроля сцен и их одноразовости.

```json
{
  "content": {
    "seen_scenes": [],
    "available_scenes": [],
    "cooldowns": {
      "max_house_talk": 0,
      "zhora_call": 0
    }
  }
}
```

### Обязательные поля

- `seen_scenes`
- `available_scenes`
- `cooldowns`

### Зачем

- не повторять большие сцены хаотично
- управлять pacing
- различать "сцена уже увидена" и "сцена пока недоступна"

## 10. `meta`

Это не лор, а технический контур состояния.

```json
{
  "meta": {
    "version": 1,
    "last_save_day": 1,
    "last_save_phase": "night"
  }
}
```

### Обязательные поля

- `version`
- `last_save_day`
- `last_save_phase`

## Полный MVP shape

Ниже — пример минимально достаточного save shape.

```json
{
  "calendar": {},
  "resources": {},
  "hero": {},
  "project": {},
  "relationships": {},
  "group": {},
  "room": {},
  "progression": {},
  "content": {},
  "meta": {}
}
```

## Какие значения реально двигают акт 1

Для первого акта критичны:

- `day`
- `weekday`
- `time_evening`
- `energy`
- `money`
- `impulse`
- `stress`
- `has_acknowledged_idea`
- `seed`
- `prototype_quality`
- `showable_build`
- `bond_max`
- `bond_zhora`
- `bond_denis`
- `bond_zheka`
- `bond_kostya`
- `bond_ilya`
- `circle_trust`
- `group_momentum`
- `act_1_completed`
- `seen_scenes`

Если какого-то из этих полей нет, progression акта 1 начинает держаться на костылях.

## Чего не должно быть в MVP schema

Не нужно тащить в первую итерацию:

- отдельные деревья навыков
- инвентарь предметов с десятками позиций
- отдельные project-subsystems на каждый компонент игры
- сложные скрытые personality metrics
- отношения "каждый с каждым"
- боевые или тактические состояния legacy dungeon

Это всё увеличит сложность, не усилив первое playable ядро.

## Базовые инварианты игры

### Инвариант 1

Нельзя иметь `showable_build = true`, если проект ещё не существует.

### Инвариант 2

Нельзя иметь положительный `circle_trust`, если не открыто хотя бы два человека кроме Кэша.

### Инвариант 3

Нельзя ставить `team_gathering_started = true` до завершения акта 1.

### Инвариант 4

`bond` не должен расти без реального действия игрока или крупной сцены.

### Инвариант 5

`room` не должен давать больший прирост, чем основные человеческие и дневные системы.

## Что может быть вычисляемым, а не сохраняемым

Чтобы не раздувать save:

Можно вычислять на лету:

- доступные вечерние действия
- доступные сцены
- активные narrative triggers
- тип исхода текущего дня

Не надо хранить это как постоянные поля, если они выводятся из состояния.

## Практический смысл для реализации

Если разработчик начинает с этого schema, он уже может:

1. собрать один редьюсер/менеджер состояния;
2. сделать прототип главного экрана;
3. проверять progression акта 1 без захардкоженного хаоса;
4. безопасно сохранять и грузить состояние новой игры.

## Что делать дальше

Самый логичный следующий шаг:

1. собрать `main screen information architecture`, чтобы этот state разложился в экран;
2. или собрать `legacy cut list`, чтобы понять, какие существующие системы точно выкидываются из runtime новой версии.
