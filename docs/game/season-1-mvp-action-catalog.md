# MVP action catalog: Season 1 `Скуф-пати`

## Задача

После фиксации core systems, state schema, IA главного экрана и legacy cut list следующая опорная точка должна быть предельно прикладной:

> какие конкретно действия игрок может делать в новой игре и как они меняют состояние?

Этот документ собирает минимально достаточный action layer для MVP. Он нужен, чтобы:

- превратить абстрактный core loop в список реальных кнопок и решений;
- связать UI, state и контент в один работающий контракт;
- дать балансировке и реализации общий язык `cost -> effect -> risk`.

## Принципы action layer

## 1. Один вечер = одно meaningful decision

Игрок не должен кликать пять мелких бессмысленных действий подряд. Вечернее действие должно быть весомым решением с понятной ценой упущенной возможности.

## 2. У каждого действия есть не только effect, но и цена

Если действие только даёт плюс, оно разрушает ядро дефицита. Любой шаг должен тратить:

- `time`
- `energy`
- иногда `money`
- иногда `social courage`
- иногда `project focus`

## 3. У каждого действия есть риск или плохая версия исхода

Даже полезное действие может дать:

- слабый эффект
- рост усталости
- пустую встречу
- неловкий контакт
- поверхностный прогресс вместо прорыва

## 4. Действия должны менять не абстрактную мощность, а жизнь героя

Правильные эффекты для MVP:

- восстановление
- удержание финансовой устойчивости
- продвижение проекта
- укрепление связи
- повышение групповой собранности
- стабилизация комнаты и быта

## Формат описания действия

Каждое действие в MVP должно описываться одинаково:

- `id`
- `label`
- `category`
- `availability`
- `cost`
- `effect`
- `risk`
- `state hooks`
- `narrative role`

## Категории действий MVP

В первом playable билде достаточно пяти категорий:

1. `recovery`
2. `money`
3. `project`
4. `relationship`
5. `group`

Этого хватает, чтобы ядро уже работало как игра, а не как набор текстовых сцен.

## 1. Recovery actions

Это не filler. Recovery-действия удерживают игрока от spiral failure и дают право на следующий осмысленный шаг.

### `sleep_early`

- `label`: `Лечь пораньше`
- `category`: `recovery`
- `availability`: доступно всегда
- `cost`:
  - тратит вечернее окно
  - не даёт прогресса по проекту и связям в этот день
- `effect`:
  - `energy +2`
  - `stress -1`
  - снижает шанс плохого старта следующего дня
- `risk`:
  - ощущается как потерянный темп, если у игрока горит проектный или социальный слот
- `state hooks`:
  - `resources.energy`
  - `hero.stress`
  - `calendar.next_day_modifiers`
- `narrative role`:
  - подчёркивает, что иногда лучшая стратегия это не героизм, а восстановление

### `quiet_home_reset`

- `label`: `Привести себя и комнату в порядок`
- `category`: `recovery`
- `availability`: доступно, если `room.mess >= medium`
- `cost`:
  - `time: full_evening`
  - `energy: -1`
- `effect`:
  - `room.mess -1`
  - `hero.stability +1`
  - небольшой бонус к следующему `project` действию
- `risk`:
  - не даёт денег и не двигает отношения напрямую
- `state hooks`:
  - `room.mess`
  - `hero.stability`
  - `meta.next_project_bonus`
- `narrative role`:
  - показывает, что быт тоже часть прогресса, а не декоративный фон

## 2. Money actions

Эти действия нужны не для фарма, а для снятия давления бедности.

### `take_small_side_gig`

- `label`: `Взять мелкую подработку`
- `category`: `money`
- `availability`: доступно почти всегда
- `cost`:
  - `time: full_evening`
  - `energy: -2`
- `effect`:
  - `money +1`
  - снимает риск финансового провала на ближайшие дни
- `risk`:
  - `stress +1`
  - если делать часто, режет `project momentum`
- `state hooks`:
  - `resources.money`
  - `resources.energy`
  - `hero.stress`
  - `project.momentum`
- `narrative role`:
  - удерживает tension между выживанием и мечтой

### `take_exhausting_shift`

- `label`: `Убиться в смену`
- `category`: `money`
- `availability`: доступно только при низких деньгах или сюжетном давлении
- `cost`:
  - `time: full_evening`
  - `energy: -3`
  - `stress: +2`
- `effect`:
  - `money +2`
  - мгновенно закрывает краткосрочную дыру
- `risk`:
  - повышает шанс плохого следующего дня
  - блокирует часть social/project действий завтра
- `state hooks`:
  - `resources.money`
  - `resources.energy`
  - `hero.stress`
  - `calendar.next_day_modifiers`
- `narrative role`:
  - аварийная кнопка, которая спасает сегодня ценой завтрашнего ресурса

## 3. Project actions

Project actions должны быть короткой линией реального созидания, а не крафтовой фабрикой.

### `capture_project_notes`

- `label`: `Записать и собрать мысли`
- `category`: `project`
- `availability`: доступно всегда, если `energy >= 1`
- `cost`:
  - `time: full_evening`
  - `energy: -1`
- `effect`:
  - `project.clarity +1`
  - небольшой рост `project.seed`
- `risk`:
  - не создаёт showable result
  - при частом спаме даёт diminishing returns
- `state hooks`:
  - `project.clarity`
  - `project.seed`
- `narrative role`:
  - первый безопасный шаг, когда герой ещё не готов собирать руками

### `assemble_rough_prototype`

- `label`: `Собрать сырой прототип`
- `category`: `project`
- `availability`: если `project.clarity >= 1` и `energy >= 2`
- `cost`:
  - `time: full_evening`
  - `energy: -2`
  - `focus: -1`
- `effect`:
  - `project.prototype_progress +1`
  - шанс создать `showable_fragment`
- `risk`:
  - при низкой устойчивости даёт `stress +1`
  - может создать сырой и неловкий результат
- `state hooks`:
  - `project.prototype_progress`
  - `project.showable_fragment`
  - `hero.stress`
- `narrative role`:
  - момент, когда идея перестаёт жить только в голове

### `polish_existing_build`

- `label`: `Допилить то, что уже есть`
- `category`: `project`
- `availability`: если существует `project.showable_fragment`
- `cost`:
  - `time: full_evening`
  - `energy: -2`
- `effect`:
  - `project.quality +1`
  - снижает риск плохой реакции на показ
- `risk`:
  - не открывает новый контент так быстро, как сборка с нуля
- `state hooks`:
  - `project.quality`
  - `project.review_risk_modifier`
- `narrative role`:
  - закрепляет ритм не только "сделать", но и "довести до состояния, которое не стыдно показать"

### `prepare_to_show`

- `label`: `Подготовить к показу`
- `category`: `project`
- `availability`: если `project.prototype_progress >= threshold`
- `cost`:
  - `time: full_evening`
  - `energy: -1`
  - `social courage: -1`
- `effect`:
  - открывает relationship action типа `показать`
  - помечает проект как `ready_for_feedback`
- `risk`:
  - если качество низкое, игрок может сознательно открыть неудобный social risk
- `state hooks`:
  - `project.ready_for_feedback`
  - `hero.social_courage`
- `narrative role`:
  - мост между project loop и relationship loop

## 4. Relationship actions

Эти действия создают не просто сцены, а новые опции в ядре.

### `message_max`

- `label`: `Написать Максу`
- `category`: `relationship`
- `availability`: после первого знакомства с Максом
- `cost`:
  - `time: full_evening`
  - `social courage: -1`
- `effect`:
  - `relationship.max +1`
  - шанс открыть следующий контактный beat
- `risk`:
  - слабый ответ или отсутствие ответа в этот день
- `state hooks`:
  - `relationships.max`
  - `content.pending_replies`
- `narrative role`:
  - самый низкий порог входа в возврат связи с людьми

### `call_zhora`

- `label`: `Созвониться с Жорой`
- `category`: `relationship`
- `availability`: после открытия Жоры и при `energy >= 1`
- `cost`:
  - `time: full_evening`
  - `social courage: -1`
  - `energy: -1`
- `effect`:
  - `relationship.zhora +1`
  - `project.clarity +1`, если разговор идёт про идею
- `risk`:
  - при высоком стрессе разговор может пройти мимо
- `state hooks`:
  - `relationships.zhora`
  - `project.clarity`
  - `hero.stress`
- `narrative role`:
  - соединяет дружескую связь и структурирование проекта

### `meet_denis`

- `label`: `Встретиться с Денисом`
- `category`: `relationship`
- `availability`: после соответствующего unlock
- `cost`:
  - `time: full_evening`
  - `energy: -1`
  - иногда `money: -1`
- `effect`:
  - `relationship.denis +1`
  - `hero.loneliness -1`
  - может поднять `group.shared_context`
- `risk`:
  - вечер уходит в атмосферу без project progress
- `state hooks`:
  - `relationships.denis`
  - `hero.loneliness`
  - `group.shared_context`
- `narrative role`:
  - удерживает человеческое тепло как отдельную ценность, не сводя всё к полезности

### `show_build_to_zheka`

- `label`: `Показать Жеке, что сделал`
- `category`: `relationship`
- `availability`: если `project.ready_for_feedback = true` и открыт Жека
- `cost`:
  - `time: full_evening`
  - `energy: -1`
  - `social courage: -2`
- `effect`:
  - `relationship.zheka +1`
  - `project.feedback_tokens +1`
  - шанс открыть новый `project` modifier
- `risk`:
  - при слабом качестве игрок получает жёсткий, но полезный feedback
- `state hooks`:
  - `relationships.zheka`
  - `project.feedback_tokens`
  - `project.quality`
- `narrative role`:
  - ключевой crossover между уязвимостью героя и реальным ростом проекта

## 5. Group actions

Это actions, в которых важен не один человек, а ощущение возникающего круга.

### `friday_hangout`

- `label`: `Пойти на пятничную посиделку`
- `category`: `group`
- `availability`: по календарю, если открыт базовый круг контактов
- `cost`:
  - `time: full_evening`
  - `energy: -1`
  - иногда `money: -1`
- `effect`:
  - `group.circle_trust +1`
  - `group.shared_context +1`
  - маленький рост двух-трёх relationship tracks сразу
- `risk`:
  - не даёт быстрых денег и может не двинуть проект напрямую
  - при низкой энергии превращается в фон без сильного эффекта
- `state hooks`:
  - `group.circle_trust`
  - `group.shared_context`
  - `relationships.*`
- `narrative role`:
  - первый реальный мост от набора людей к ощущению "мы"

### `pitch_the_idea_to_circle`

- `label`: `Озвучить идею вслух всем`
- `category`: `group`
- `availability`: если `group.shared_context >= threshold` и `project.clarity >= threshold`
- `cost`:
  - `time: full_evening`
  - `energy: -1`
  - `social courage: -2`
- `effect`:
  - `group.momentum +1`
  - шанс открыть `group formation` beat
  - усиливает ценность следующих project actions
- `risk`:
  - если доверия мало, сцена проходит слабо и может поднять `hero.self_doubt`
- `state hooks`:
  - `group.momentum`
  - `group.circle_trust`
  - `project.clarity`
  - `hero.self_doubt`
- `narrative role`:
  - момент, когда идея перестаёт быть внутренним монологом и становится социальным фактом

## Системные типы эффектов

Чтобы action catalog не расползался, в MVP нужно держать ограниченный словарь эффектов:

- `resource_shift`
- `project_progress`
- `relationship_gain`
- `group_gain`
- `room_stabilization`
- `next_day_modifier`
- `unlock_flag`
- `risk_flag`

Это даст state schema предсказуемую форму и упростит реализацию резолва действий.

## MVP minimum set

Для первого playable достаточно 10 действий:

1. `sleep_early`
2. `quiet_home_reset`
3. `take_small_side_gig`
4. `take_exhausting_shift`
5. `capture_project_notes`
6. `assemble_rough_prototype`
7. `polish_existing_build`
8. `message_max`
9. `show_build_to_zheka`
10. `friday_hangout`

Если этот набор работает, уже можно проверять:

- чувствуется ли дефицит
- есть ли meaningful вечерний выбор
- понятно ли, как проект и люди пересекаются
- работает ли ранний темп первых 7-10 дней

## Что сознательно не входит в первый action pass

Пока не нужны:

- магазинные действия
- длинные production chains
- повторяемые minigame actions
- боевые действия
- коллекционные действия
- сложные multi-step craft trees
- отдельные UI-режимы под каждую категорию

Это либо legacy-шум, либо premature complexity.

## Вывод

MVP action catalog должен ощущаться не как список кнопок, а как таблица взрослых компромиссов.

Игроку постоянно должно быть больно выбирать между:

- выжить сегодня
- не развалиться
- не бросить проект
- не потерять людей
- начать превращать контакты в круг

Если action layer удерживает это напряжение, у новой игры есть настоящее ядро.
