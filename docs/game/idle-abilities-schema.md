# Data-driven контракт active abilities

## Задача

После продуктового дизайна active abilities следующая точка риска это реализация "по месту": часть логики в `js/idle.js`, часть в save blob, часть в prestige shop, часть в UI. Это снова превратит систему в хардкод, который сложно балансировать и расширять.

Цель документа: зафиксировать минимальный контракт данных и runtime-слоёв так, чтобы active abilities можно было добавить как управляемую подсистему, а не как набор исключений.

## Какую проблему решаем

- способности должны жить в том же data-driven подходе, что здания, апгрейды, события и достижения
- unlock logic не должна размазываться между `profile.php`, `idle.php` и несколькими JS-модулями
- save/load слой должен понимать способности как часть progression snapshot
- аналитика должна видеть equip/use/effect без изобретения отдельных ad-hoc событий на каждую кнопку

## Принцип контракта

Нужно разделить систему на четыре слоя:

1. `config layer`
2. `runtime state`
3. `effect application`
4. `analytics + persistence hooks`

Каждый слой должен быть достаточно общим, чтобы добавить новую способность без новых специальных веток по всему проекту.

## Где хранить данные

Рекомендуемый первый шаг:

- не создавать новый файл сразу
- добавить раздел `abilities` в `data/game/idle-balance.js`

Почему так:

- текущий баланс уже централизуется в одном data-driven источнике
- это минимальный change surface для первой реализации
- позже способности можно вынести в `data/game/idle-abilities.js`, если объём реально вырастет

## Рекомендуемая структура конфига

```js
window.IdleGameData = {
  abilitySystem: {
    slotUnlocks: [],
    abilities: [],
    ui: {}
  }
};
```

### `abilitySystem.slotUnlocks`

Назначение:

- описывать, когда открывается дополнительный слот

Пример формы:

```js
slotUnlocks: [
  {
    slotIndex: 0,
    unlockRule: { type: 'prestigeAtLeast', value: 1 },
    source: 'base_unlock'
  },
  {
    slotIndex: 1,
    unlockRule: { type: 'prestigeShopLevelAtLeast', itemId: 'ability_slot_2', value: 1 },
    source: 'prestige_shop'
  },
  {
    slotIndex: 2,
    unlockRule: { type: 'prestigeShopLevelAtLeast', itemId: 'ability_slot_3', value: 1 },
    source: 'prestige_shop'
  }
]
```

Почему отдельный массив:

- слоты это отдельная progression-сущность
- их не нужно жёстко привязывать к конкретным ability definitions

### `abilitySystem.abilities`

Каждая способность должна иметь один и тот же shape.

Рекомендуемые поля:

- `id`
- `name`
- `emoji`
- `category`
- `description`
- `flavor`
- `unlockRule`
- `shopUnlock`
- `cooldownSec`
- `durationSec`
- `targeting`
- `effect`
- `uiPriority`
- `analyticsKey`
- `isEnabled`

### Пример ability definition

```js
{
  id: 'emergency_deploy',
  name: 'Экстренный деплой',
  emoji: '🚀',
  category: 'burst_economy',
  description: '+60% к ЛОК/с на 10 сек.',
  flavor: 'Срочный выкат фичи перед дедлайном.',
  unlockRule: { type: 'prestigeAtLeast', value: 1 },
  shopUnlock: null,
  cooldownSec: 90,
  durationSec: 10,
  targeting: 'self',
  effect: {
    type: 'tempGlobalMultiplier',
    value: 1.6
  },
  uiPriority: 10,
  analyticsKey: 'emergency_deploy',
  isEnabled: true
}
```

## Правила по полям

### `category`

Нужно для:

- группировки в UI
- future seasonal modifiers
- аналитики по классам способностей

Рекомендуемые значения первой итерации:

- `burst_economy`
- `click_amplifier`
- `conversion_utility`
- `risk_reward`

### `unlockRule`

Это общий progression gate.

Он должен использовать уже существующий язык rule-типов, где возможно:

- `prestigeAtLeast`
- `accountLevelAtLeast`
- `totalLocAtLeast`
- `prestigeShopLevelAtLeast`

Если текущий rule-engine не поддерживает нужный тип, лучше расширить его централизованно, а не писать локальную проверку только для abilities.

### `shopUnlock`

Нужно для способностей, которые не открываются автоматически, а покупаются в prestige shop.

Пример:

```js
shopUnlock: {
  itemId: 'unlock_code_review',
  cost: 3
}
```

Важно:

- `shopUnlock` не заменяет `unlockRule`
- он дополняет его, если нужен и progression gate, и покупка

### `targeting`

Нужно ограничить набор допустимых значений заранее:

- `self`
- `next_clicks`
- `next_purchase`
- `next_upgrade`

Это полезно, потому что effect-processing потом проще писать как таблицу обработчиков, а не как свободный набор исключений.

### `effect`

Главный принцип:

- один ability = один primary effect object на первой итерации

Не нужно сразу поддерживать composite effects. Иначе MVP расползётся.

Рекомендуемые типы эффектов для старта:

- `tempGlobalMultiplier`
- `tempClickMultiplier`
- `nextClicksMultiplier`
- `nextPurchaseDiscount`
- `nextPurchaseBonusValue`
- `tempGlobalMultiplierWithPenalty`

## Runtime state

В save/runtime нужны три разных понятия:

1. что у игрока открыто
2. что экипировано
3. что сейчас активно

Нельзя смешивать их в один флаг.

### Рекомендуемый shape в state

```js
state.abilities = {
  unlocked: {
    emergency_deploy: true,
    code_review: false
  },
  equipped: ['emergency_deploy'],
  cooldowns: {
    emergency_deploy: 0
  },
  activeEffects: [
    {
      abilityId: 'emergency_deploy',
      effectType: 'tempGlobalMultiplier',
      startedAt: 0,
      expiresAt: 0,
      value: 1.6
    }
  ],
  charges: {},
  lifetimeUses: {
    emergency_deploy: 12
  }
};
```

### Почему именно так

- `unlocked` отвечает за progression
- `equipped` отвечает за loadout и UI
- `cooldowns` нужны для восстановления после reload/save
- `activeEffects` нужны, чтобы не терять временный эффект при авто-сейве или обновлении страницы
- `lifetimeUses` пригодится для achievements, analytics и сезонных missions

## Что должно переживать save/load

Обязательно сохранять:

- unlocked abilities
- equipped loadout
- cooldown end timestamps
- active effect timestamps
- lifetime uses

Необязательно в MVP:

- отдельные charge counters
- build history
- per-run usage breakdown

## Совместимость с текущим save blob

Способности должны добавляться как новый под-объект в существующий save blob, а не как россыпь полей верхнего уровня.

Правильно:

```json
{
  "abilities": {
    "unlocked": {},
    "equipped": [],
    "cooldowns": {},
    "activeEffects": [],
    "lifetimeUses": {}
  }
}
```

Неправильно:

- `abilityCooldown1`
- `abilityCooldown2`
- `selectedAbilityLeft`
- `selectedAbilityRight`

Такие поля быстро ломают миграции и мешают добавлять третий слот.

## Runtime hooks

### 1. Unlock resolver

Должен проверять:

- базовые unlock rules
- shop unlock state
- slot unlock rules

Когда вызывать:

- при загрузке сохранения
- после престижа
- после покупки в prestige shop
- после изменения account level

### 2. Equip manager

Отвечает за:

- валидацию числа доступных слотов
- невозможность экипировать неоткрытую способность
- deterministic порядок слотов

### 3. Ability use handler

Общий обработчик должен:

- проверять unlock
- проверять equip
- проверять cooldown
- применять effect handler
- записывать cooldown
- логировать analytics event
- инициировать save при необходимости

### 4. Effect processor

Лучше иметь таблицу обработчиков по `effect.type`.

Пример:

```js
const abilityEffectHandlers = {
  tempGlobalMultiplier: applyTempGlobalMultiplier,
  tempClickMultiplier: applyTempClickMultiplier,
  nextClicksMultiplier: applyNextClicksMultiplier,
  nextPurchaseBonusValue: applyNextPurchaseBonusValue,
  tempGlobalMultiplierWithPenalty: applyRiskRewardMultiplier
};
```

Это дешевле поддерживать, чем огромный `switch` прямо в UI-кнопке.

## UI contract

UI не должен сам вычислять unlock-правила или форматировать сложные эффекты из raw runtime-состояния.

UI-слою нужно отдавать нормализованный view model:

```js
{
  slots: [
    {
      slotIndex: 0,
      isUnlocked: true,
      equippedAbilityId: 'emergency_deploy'
    }
  ],
  abilities: [
    {
      id: 'emergency_deploy',
      isUnlocked: true,
      isEquipped: true,
      isOnCooldown: false,
      cooldownRemainingSec: 0,
      shortDescription: '+60% к ЛОК/с на 10 сек.'
    }
  ]
}
```

Это уменьшает риск, что часть правил окажется зашита в render-функции.

## Требования к prestige shop

Если способности и слоты открываются через prestige shop, shop не должен хранить их как особый несистемный случай.

Нужно добавить новые item types, а не специальные if-ветки:

- `unlock_ability`
- `unlock_ability_slot`

Пример:

```js
{
  id: 'unlock_code_review',
  type: 'unlock_ability',
  abilityId: 'code_review',
  cost: 3,
  maxLevel: 1
}
```

Это позволит save/shop/security слоям использовать уже знакомую модель.

## Аналитика

Для первой реализации достаточно трёх событий, уже упомянутых в предыдущем документе:

- `idle_ability_equipped`
- `idle_ability_used`
- `idle_ability_effect_applied`

### Рекомендуемый payload

#### `idle_ability_equipped`

- `ability_id`
- `slot_index`
- `available_slots`
- `account_level`
- `prestige`

#### `idle_ability_used`

- `ability_id`
- `effect_type`
- `cooldown_sec`
- `loc_per_second_before`
- `loc_before`
- `source_surface: idle`

#### `idle_ability_effect_applied`

- `ability_id`
- `effect_type`
- `duration_sec`
- `value`
- `loc_per_second_after`
- `loc_after`

## Серверные требования

На первом этапе способности могут оставаться client-driven, но есть минимум того, что сервер должен понимать:

- shape поля `abilities` в save payload
- whitelist допустимых `abilityId`
- cap на число equipped slots
- reject несуществующих effect remnants в `activeEffects`

Серверу не нужно полностью симулировать ability logic в MVP, но он не должен слепо принимать произвольные структуры.

## Guardrails для anti-cheat baseline

- нельзя принимать неизвестные `abilityId`
- нельзя принимать `equipped.length` больше открытых слотов
- `expiresAt` и `cooldown` не должны уходить в абсурдно далёкое будущее
- ability unlock через shop должен следовать server-known whitelist item ids
- temporary effect не должен напрямую повышать `prestigePoints` или другие meta-currencies

## Rollout phases

### Фаза 1. Infrastructure

- добавить config schema
- расширить save blob
- добавить equip/use runtime handlers
- без сложных utility-эффектов

### Фаза 2. MVP abilities

- `Экстренный деплой`
- `Code Review`
- один слот по prestige unlock
- один shop unlock

### Фаза 3. Midgame depth

- второй слот
- `Фокус-спринт`
- analytics review после MVP

### Фаза 4. Risk/reward expansion

- `Ночной релиз`
- только после анализа usage и pacing impact

## Что не делать в первой реализации

- не добавлять дерево талантов
- не добавлять энергию/ману
- не добавлять заряды и recharge economy
- не делать отдельную страницу способностей
- не делать ability-specific серверные таблицы

Иначе система перестанет быть лёгким midgame-слоем и начнёт конкурировать с основным idle loop.

## Acceptance checklist для будущей реализации

- новую способность можно добавить через конфиг без правки 5 разных UI-веток
- save/load не теряет cooldown и active effect
- престиж корректно сбрасывает только то, что должно сбрасываться
- analytics видит equip/use/effect
- whitelist и shape validation на сервере не пропускают мусорные payloads

## Что делать дальше

- При реализации сначала расширить `data/game/idle-balance.js`, а не UI.
- После этого добавить state schema и save migration.
- Только потом подключать 2 MVP-способности и их UI.
