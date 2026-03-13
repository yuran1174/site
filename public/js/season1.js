(function () {
  'use strict';

  const STORAGE_KEY = 'season1_vertical_slice_v1';
  const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const WEEKDAY_LABELS = {
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье',
  };
  const PLAYER_NAME = (window.SEASON1_BOOTSTRAP && window.SEASON1_BOOTSTRAP.playerName) || 'Герой';

  const elements = {
    dayTitle: document.getElementById('dayTitle'),
    phaseBadge: document.getElementById('phaseBadge'),
    dayMood: document.getElementById('dayMood'),
    statusStats: document.getElementById('statusStats'),
    roomTitle: document.getElementById('roomTitle'),
    roomSummary: document.getElementById('roomSummary'),
    roomStats: document.getElementById('roomStats'),
    projectTitle: document.getElementById('projectTitle'),
    projectSummary: document.getElementById('projectSummary'),
    projectStats: document.getElementById('projectStats'),
    peopleList: document.getElementById('peopleList'),
    actionsList: document.getElementById('actionsList'),
    feedList: document.getElementById('feedList'),
    resetRun: document.getElementById('resetRun'),
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createInitialState() {
    return {
      calendar: {
        day: 1,
        weekday: 'monday',
        week: 1,
        phase: 'evening',
      },
      resources: {
        time_evening: 2,
        energy: 62,
        money: 900,
        impulse: 28,
        stress: 36,
      },
      hero: {
        name: PLAYER_NAME,
        burnout: 24,
        stability: 18,
        has_acknowledged_idea: false,
        last_outcome: 'heavy_but_useful',
      },
      project: {
        seed: 0,
        clarity: 0,
        prototype_quality: 0,
        showable_build: false,
        last_action: 'none',
      },
      relationships: {
        cash: { introduced: true, bond: 2, last_interaction_day: 1 },
        max: { introduced: true, bond: 1, last_interaction_day: 0 },
        zhora: { introduced: false, bond: 0, last_interaction_day: null },
        denis: { introduced: false, bond: 0, last_interaction_day: null },
        zheka: { introduced: false, bond: 0, last_interaction_day: null },
        kostya: { introduced: true, bond: 2, last_interaction_day: 0 },
        ilya: { introduced: true, bond: 2, last_interaction_day: 0 },
      },
      group: {
        circle_trust: 0,
        group_momentum: 0,
        shared_context: 0,
      },
      room: {
        comfort: 22,
        order: 18,
        project_corner: 12,
        upgrades: {
          desk_lamp: true,
          second_monitor: false,
          better_chair: false,
        },
      },
      content: {
        feed: [
          {
            day: 1,
            weekday: 'monday',
            title: 'Старт среза',
            text: 'Новая игра живёт отдельно от idle-режима. Сегодня надо вытянуть вечер и решить, во что его вложить.',
          },
        ],
      },
      meta: {
        version: 1,
      },
    };
  }

  function validateState(candidate) {
    return candidate && candidate.calendar && candidate.resources && candidate.hero && candidate.project && candidate.relationships && candidate.group && candidate.room;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return createInitialState();
      }

      const parsed = JSON.parse(raw);
      return validateState(parsed) ? parsed : createInitialState();
    } catch (error) {
      return createInitialState();
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function pushFeed(state, title, text) {
    state.content.feed.unshift({
      day: state.calendar.day,
      weekday: state.calendar.weekday,
      title: title,
      text: text,
    });
    state.content.feed = state.content.feed.slice(0, 8);
  }

  function statChip(label, value) {
    return '<div class="s1-stat-chip"><span>' + label + '</span><strong>' + value + '</strong></div>';
  }

  function isWeekend(weekday) {
    return weekday === 'saturday' || weekday === 'sunday';
  }

  function describeDayMood(state) {
    if (state.resources.energy <= 25) {
      return 'После обязательного дня сил почти нет. Любой тяжёлый шаг будет дорогим.';
    }

    if (state.resources.stress >= 65) {
      return 'День вязкий и шумный. Если полезешь в сложное, есть риск только сильнее перегореть.';
    }

    if (state.calendar.weekday === 'friday') {
      return 'Пятничное окно наконец открылось. Сегодня можно вложиться не только в выживание, но и в круг.';
    }

    if (state.project.clarity >= 4) {
      return 'Идея уже держится лучше. Есть шанс сделать вечер, который реально двинет проект.';
    }

    return 'Обычный взрослый вечер: немного сил, немного денег, один реальный выбор.';
  }

  function describeRoom(state) {
    if (state.room.order >= 40 && state.room.project_corner >= 28) {
      return 'Комната уже перестала быть просто местом ночёвки. Здесь начинает ощущаться будущая своя студия.';
    }

    if (state.room.order <= 16) {
      return 'В комнате всё ещё видно, как жизнь давит первой. Но рабочий угол уже пытается отбить себе место.';
    }

    return 'Жильё пока держится на честном слове, коте Кэше и одном рабочем островке у монитора.';
  }

  function describeProject(state) {
    if (state.project.showable_build) {
      return 'Есть что показать. Это ещё не нормальный билд, но идея уже не живёт только в голове.';
    }

    if (state.project.clarity >= 4) {
      return 'Идея начинает собираться в понятную форму. Следующий шаг уже можно обсуждать вслух.';
    }

    if (state.project.seed > 0) {
      return 'Есть заметки и сырой каркас. Пока это больше импульс, чем продукт.';
    }

    return 'Проект ещё не оформился. Пока живёт как смутное ощущение, что надо делать что-то своё.';
  }

  function relationshipStatus(character, state) {
    if (!character.introduced) {
      return 'Пока линия не открыта.';
    }

    if (character.bond >= 4) {
      return 'Контакт уже тёплый, можно говорить серьёзнее.';
    }

    if (state.calendar.day - (character.last_interaction_day || 0) >= 3) {
      return 'Давно не писал. Связь надо подхватывать снова.';
    }

    return 'Связь живая, но пока хрупкая.';
  }

  function unlockStateChanges(state) {
    if (!state.relationships.zhora.introduced && state.relationships.max.bond >= 2) {
      state.relationships.zhora.introduced = true;
      state.relationships.zhora.last_interaction_day = state.calendar.day;
      pushFeed(state, 'Жора появился на радаре', 'Макс скинул контакт Жоры и предложил созвониться позже, когда идея станет плотнее.');
    }

    if (!state.relationships.zheka.introduced && state.project.clarity >= 4) {
      state.relationships.zheka.introduced = true;
      pushFeed(state, 'Открыт Жека', 'Идея стала достаточно внятной, чтобы показать её Жеке без ощущения полной кринжатины.');
    }

    if (!state.relationships.denis.introduced && state.resources.money >= 1200) {
      state.relationships.denis.introduced = true;
      pushFeed(state, 'Мимолётный след Дениса', 'На очередной подработке снова всплыло имя Дениса. Прошлое пока только мелькает, но уже не исчезает.');
    }
  }

  function applyDailyPressure(state) {
    const roomRecovery = Math.floor((state.room.comfort + state.room.order) / 24);
    const stabilityBuffer = Math.floor(state.hero.stability / 12);
    const nextWeekdayIndex = (WEEKDAYS.indexOf(state.calendar.weekday) + 1) % WEEKDAYS.length;
    const nextWeekday = WEEKDAYS[nextWeekdayIndex];

    state.calendar.day += 1;
    state.calendar.weekday = nextWeekday;
    state.calendar.phase = 'evening';
    if (nextWeekday === 'monday') {
      state.calendar.week += 1;
    }

    state.resources.time_evening = isWeekend(nextWeekday) ? 3 : 2;
    state.resources.energy = clamp(state.resources.energy - (isWeekend(nextWeekday) ? 4 : 12) + roomRecovery, 0, 100);
    state.resources.stress = clamp(state.resources.stress + (isWeekend(nextWeekday) ? -6 : 7) - stabilityBuffer, 0, 100);
    state.resources.impulse = clamp(state.resources.impulse - 3 + Math.min(2, state.group.group_momentum), 0, 100);
    state.resources.money = clamp(state.resources.money - (isWeekend(nextWeekday) ? 90 : 140), 0, 9999);
    state.hero.burnout = clamp(state.hero.burnout + (state.resources.energy < 28 ? 5 : -2) + (state.resources.stress > 68 ? 4 : 0), 0, 100);

    if (state.resources.money <= 180) {
      state.resources.stress = clamp(state.resources.stress + 8, 0, 100);
      pushFeed(state, 'Деньги впритык', 'Быт снова жрёт голову. Если ещё пару дней так, придётся уходить в подработку без вариантов.');
    }

    unlockStateChanges(state);
  }

  const actions = [
    {
      id: 'sleep_early',
      title: 'Лечь пораньше',
      effect: 'Восстановить силы и немного снять стресс.',
      cost: 'Вечер уходит целиком, проект и люди стоят на месте.',
      available: function () {
        return { ok: true, reason: 'Иногда лучший ход - не героизм, а сон.' };
      },
      apply: function (state) {
        state.resources.energy = clamp(state.resources.energy + 18, 0, 100);
        state.resources.stress = clamp(state.resources.stress - 12, 0, 100);
        state.hero.stability = clamp(state.hero.stability + 2, 0, 100);
        state.hero.burnout = clamp(state.hero.burnout - 5, 0, 100);
        pushFeed(state, 'Ранний отбой', PLAYER_NAME + ' выбрал не ломать себя об вечер. Иногда это и есть полезный ход.');
      },
    },
    {
      id: 'take_small_side_gig',
      title: 'Взять мелкую подработку',
      effect: 'Подлатать деньги ценой сил и нервов.',
      cost: 'Минус энергия, плюс бытовая усталость.',
      available: function (state) {
        if (state.resources.energy < 24) {
          return { ok: false, reason: 'С такой энергией подработка превратится в самоубийство.' };
        }

        return { ok: true, reason: 'Доступно почти всегда, пока держишься на ногах.' };
      },
      apply: function (state) {
        state.resources.money = clamp(state.resources.money + 380, 0, 9999);
        state.resources.energy = clamp(state.resources.energy - 14, 0, 100);
        state.resources.stress = clamp(state.resources.stress + 9, 0, 100);
        state.resources.impulse = clamp(state.resources.impulse - 4, 0, 100);
        state.hero.burnout = clamp(state.hero.burnout + 4, 0, 100);
        pushFeed(state, 'Подработка закрыла дыру', 'Деньги пришли, но вечер снова ушёл не в мечту, а в выживание.');
      },
    },
    {
      id: 'capture_project_notes',
      title: 'Записать и собрать мысли',
      effect: 'Подвинуть ясность проекта и укрепить рабочий угол.',
      cost: 'Требует энергии и не решает денежную боль.',
      available: function (state) {
        if (state.resources.energy < 34) {
          return { ok: false, reason: 'Голова уже не держит проектный вечер.' };
        }

        if (state.resources.stress > 82) {
          return { ok: false, reason: 'Сначала снизь перегруз. Иначе вечер уйдёт в тупое залипание.' };
        }

        return { ok: true, reason: 'Безопасный проектный шаг, пока ещё нечего показывать.' };
      },
      apply: function (state) {
        state.project.seed = clamp(state.project.seed + 1, 0, 100);
        state.project.clarity = clamp(state.project.clarity + 2, 0, 100);
        state.project.last_action = 'capture_project_notes';
        state.resources.energy = clamp(state.resources.energy - 11, 0, 100);
        state.resources.impulse = clamp(state.resources.impulse + 7, 0, 100);
        state.resources.stress = clamp(state.resources.stress + 2, 0, 100);
        state.room.project_corner = clamp(state.room.project_corner + 2, 0, 100);
        state.hero.has_acknowledged_idea = true;
        if (state.project.clarity >= 6) {
          state.project.prototype_quality = clamp(state.project.prototype_quality + 1, 0, 100);
        }
        if (state.project.clarity >= 7) {
          state.project.showable_build = true;
        }
        pushFeed(state, 'Собраны заметки', 'Идея стала плотнее. Это ещё не билд, но уже не просто тоска о несделанном.');
      },
    },
    {
      id: 'message_max',
      title: 'Написать Максу',
      effect: 'Подогреть связь и вернуть себе импульс.',
      cost: 'Не даёт денег и требует социального ресурса.',
      available: function (state) {
        if (!state.relationships.max.introduced) {
          return { ok: false, reason: 'Макс ещё не вошёл в этот цикл.' };
        }

        if (state.resources.energy < 28) {
          return { ok: false, reason: 'На живой контакт сегодня уже не хватит внутренней батарейки.' };
        }

        return { ok: true, reason: 'Низкий порог входа в восстановление старой связи.' };
      },
      apply: function (state) {
        state.relationships.max.bond = clamp(state.relationships.max.bond + 1, 0, 10);
        state.relationships.max.last_interaction_day = state.calendar.day;
        state.resources.energy = clamp(state.resources.energy - 6, 0, 100);
        state.resources.impulse = clamp(state.resources.impulse + 8, 0, 100);
        state.resources.stress = clamp(state.resources.stress - 5, 0, 100);
        if (state.project.clarity >= 3) {
          state.group.shared_context = clamp(state.group.shared_context + 1, 0, 10);
        }
        pushFeed(state, 'Макс ответил', 'Разговор короткий, но живой. Появилось ощущение, что это всё ещё можно делать не в одиночку.');
      },
    },
    {
      id: 'friday_hangout',
      title: 'Пойти на пятничную посиделку',
      effect: 'Сдвинуть круг друзей, а не только одного человека.',
      cost: 'Доступно только по пятницам и требует приличного остатка сил.',
      available: function (state) {
        if (state.calendar.weekday !== 'friday') {
          return { ok: false, reason: 'Сейчас не пятница. До живого ритуала круга ещё надо дожить.' };
        }

        if (state.resources.energy < 32) {
          return { ok: false, reason: 'На посиделку надо прийти живым, а не пустой оболочкой.' };
        }

        if (state.resources.money < 120) {
          return { ok: false, reason: 'Даже на такой вечер нужен небольшой бытовой запас.' };
        }

        return { ok: true, reason: 'Главный групповой шаг раннего slice.' };
      },
      apply: function (state) {
        state.group.circle_trust = clamp(state.group.circle_trust + 2, 0, 10);
        state.group.shared_context = clamp(state.group.shared_context + 2, 0, 10);
        state.group.group_momentum = clamp(state.group.group_momentum + 1, 0, 10);
        state.relationships.kostya.bond = clamp(state.relationships.kostya.bond + 1, 0, 10);
        state.relationships.ilya.bond = clamp(state.relationships.ilya.bond + 1, 0, 10);
        state.relationships.kostya.last_interaction_day = state.calendar.day;
        state.relationships.ilya.last_interaction_day = state.calendar.day;
        state.resources.energy = clamp(state.resources.energy - 10, 0, 100);
        state.resources.money = clamp(state.resources.money - 140, 0, 9999);
        state.resources.impulse = clamp(state.resources.impulse + 10, 0, 100);
        state.resources.stress = clamp(state.resources.stress - 4, 0, 100);
        state.room.comfort = clamp(state.room.comfort + 1, 0, 100);
        pushFeed(state, 'Пятничный ритуал сработал', 'Костя и Илья снова стали не фоном, а настоящим кругом. Вечер не про продуктивность, а про "мы".');
      },
    },
  ];

  function renderStatus(state) {
    elements.dayTitle.textContent = WEEKDAY_LABELS[state.calendar.weekday] + ', день ' + state.calendar.day;
    elements.phaseBadge.textContent = 'Вечер';
    elements.dayMood.textContent = describeDayMood(state);
    elements.statusStats.innerHTML = [
      statChip('Энергия', state.resources.energy),
      statChip('Деньги', state.resources.money + ' ₽'),
      statChip('Импульс', state.resources.impulse),
      statChip('Стресс', state.resources.stress),
      statChip('Вечер', state.resources.time_evening + ' окна'),
      statChip('Выгорание', state.hero.burnout),
    ].join('');
  }

  function renderRoom(state) {
    elements.roomTitle.textContent = state.room.project_corner >= 26 ? 'Комната начинает работать на тебя' : 'Съёмная комната и шаткая стабильность';
    elements.roomSummary.textContent = describeRoom(state);
    elements.roomStats.innerHTML = [
      '<span class="s1-tag">Уют: ' + state.room.comfort + '</span>',
      '<span class="s1-tag">Порядок: ' + state.room.order + '</span>',
      '<span class="s1-tag">Project corner: ' + state.room.project_corner + '</span>',
      '<span class="s1-tag ' + (state.room.upgrades.desk_lamp ? 'is-good' : '') + '">Лампа: ' + (state.room.upgrades.desk_lamp ? 'есть' : 'нет') + '</span>',
      '<span class="s1-tag ' + (state.room.upgrades.second_monitor ? 'is-good' : '') + '">2-й монитор: ' + (state.room.upgrades.second_monitor ? 'есть' : 'нет') + '</span>',
    ].join('');
  }

  function renderProject(state) {
    elements.projectTitle.textContent = state.project.showable_build ? 'Есть что показать' : (state.project.clarity >= 4 ? 'Идея собирается' : 'Идея ещё сырая');
    elements.projectSummary.textContent = describeProject(state);
    elements.projectStats.innerHTML = [
      '<span class="s1-tag">Seed: ' + state.project.seed + '</span>',
      '<span class="s1-tag">Clarity: ' + state.project.clarity + '</span>',
      '<span class="s1-tag">Качество: ' + state.project.prototype_quality + '</span>',
      '<span class="s1-tag ' + (state.project.showable_build ? 'is-good' : 'is-risk') + '">Показывать: ' + (state.project.showable_build ? 'можно' : 'рано') + '</span>',
    ].join('');
  }

  function renderPeople(state) {
    const people = [
      { id: 'max', name: 'Макс', role: 'Старый диджей и тёплый контакт' },
      { id: 'kostya', name: 'Костя', role: 'Пятничная опора круга' },
      { id: 'ilya', name: 'Илья', role: 'Живая связь старой тройки' },
      { id: 'zhora', name: 'Жора', role: 'Внешний взгляд и память о старом безумии' },
      { id: 'zheka', name: 'Жека', role: 'Потенциальный технический союзник' },
    ];

    elements.peopleList.innerHTML = people.map(function (person) {
      const relation = state.relationships[person.id];
      const unlocked = relation.introduced;
      return '' +
        '<article class="s1-person-card">' +
          '<h3>' + person.name + '</h3>' +
          '<p>' + person.role + '</p>' +
          '<div class="s1-person-meta">' +
            '<span class="s1-tag">' + (unlocked ? 'Связь: ' + relation.bond : 'Пока закрыт') + '</span>' +
            '<span class="s1-tag ' + (unlocked ? 'is-good' : 'is-risk') + '">' + relationshipStatus(relation, state) + '</span>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  function renderActions(state) {
    elements.actionsList.innerHTML = actions.map(function (action) {
      const availability = action.available(state);
      return '' +
        '<article class="s1-action-card ' + (availability.ok ? '' : 'is-locked') + '">' +
          '<div>' +
            '<h3>' + action.title + '</h3>' +
            '<p>' + action.effect + '</p>' +
            '<div class="s1-action-meta">' +
              '<span class="s1-tag">Эффект</span>' +
              '<span class="s1-tag">' + action.cost + '</span>' +
              '<span class="s1-tag ' + (availability.ok ? 'is-good' : 'is-risk') + '">' + availability.reason + '</span>' +
            '</div>' +
          '</div>' +
          '<button class="s1-action-button" type="button" data-action-id="' + action.id + '"' + (availability.ok ? '' : ' disabled') + '>Выбрать</button>' +
        '</article>';
    }).join('');
  }

  function renderFeed(state) {
    elements.feedList.innerHTML = state.content.feed.map(function (item) {
      return '' +
        '<article class="s1-feed-item">' +
          '<small>' + WEEKDAY_LABELS[item.weekday] + ' · день ' + item.day + '</small>' +
          '<h3>' + item.title + '</h3>' +
          '<p>' + item.text + '</p>' +
        '</article>';
    }).join('');
  }

  function render(state) {
    renderStatus(state);
    renderRoom(state);
    renderProject(state);
    renderPeople(state);
    renderActions(state);
    renderFeed(state);
  }

  function resolveAction(actionId) {
    const action = actions.find(function (entry) {
      return entry.id === actionId;
    });
    if (!action) {
      return;
    }

    const availability = action.available(state);
    if (!availability.ok) {
      return;
    }

    const nextState = deepClone(state);
    action.apply(nextState);
    applyDailyPressure(nextState);
    state = nextState;
    saveState(state);
    render(state);
  }

  let state = loadState();
  saveState(state);
  render(state);

  elements.actionsList.addEventListener('click', function (event) {
    const button = event.target.closest('[data-action-id]');
    if (!button) {
      return;
    }

    resolveAction(button.getAttribute('data-action-id'));
  });

  elements.resetRun.addEventListener('click', function () {
    state = createInitialState();
    saveState(state);
    render(state);
  });
}());
