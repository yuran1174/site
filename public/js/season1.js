(function () {
  'use strict';

  const STORAGE_KEY = 'season1_idle_slice_v2';
  const TICK_MS = 15000;
  const MAX_OFFLINE_CYCLES = 24;
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

  const LIFE_MODES = [
    { id: 'survival', label: 'Выживание' },
    { id: 'side_hustle', label: 'Подработка' },
    { id: 'recovery', label: 'Восстановление' },
    { id: 'project_focus', label: 'Фокус на проект' },
    { id: 'people_focus', label: 'Фокус на людях' },
  ];

  const SLOT_OPTIONS = [
    { id: 'rest', label: 'Отдых' },
    { id: 'project', label: 'Проект' },
    { id: 'people', label: 'Люди' },
    { id: 'room', label: 'Комната' },
    { id: 'side_hustle', label: 'Подработка' },
  ];

  const PROJECT_FOCUSES = [
    { id: 'clarify', label: 'Clarify' },
    { id: 'build', label: 'Build' },
    { id: 'polish', label: 'Polish' },
    { id: 'show', label: 'Show' },
  ];

  const PEOPLE = [
    { id: 'max', name: 'Макс', role: 'Разгоняет social warmth и вытаскивает цикл из глухой бытовухи.' },
    { id: 'zhora', name: 'Жора', role: 'Помогает не сдуваться и лучше прожимать clarify-цикл.' },
    { id: 'zheka', name: 'Жека', role: 'Подкручивает build/polish и делает проект менее кривым.' },
    { id: 'kostya', name: 'Костя', role: 'Даёт физическое ощущение круга и стабилизирует пятничный ритм.' },
    { id: 'ilya', name: 'Илья', role: 'Поднимает group pulse и возвращает ощущение старой химии.' },
  ];

  const elements = {
    runCycleNow: document.getElementById('runCycleNow'),
    resetRun: document.getElementById('resetRun'),
    hudDay: document.getElementById('hudDay'),
    cycleStatus: document.getElementById('cycleStatus'),
    hudStats: document.getElementById('hudStats'),
    roomTitle: document.getElementById('roomTitle'),
    roomMoodTag: document.getElementById('roomMoodTag'),
    roomSummary: document.getElementById('roomSummary'),
    roomStats: document.getElementById('roomStats'),
    roomStage: document.getElementById('roomStage'),
    lastTickInfo: document.getElementById('lastTickInfo'),
    resultsRail: document.getElementById('resultsRail'),
    lifeModeControl: document.getElementById('lifeModeControl'),
    slotControls: document.getElementById('slotControls'),
    projectFocusControl: document.getElementById('projectFocusControl'),
    socialPriorityControl: document.getElementById('socialPriorityControl'),
    projectTitle: document.getElementById('projectTitle'),
    projectTag: document.getElementById('projectTag'),
    projectSummary: document.getElementById('projectSummary'),
    projectStats: document.getElementById('projectStats'),
    groupStats: document.getElementById('groupStats'),
    peopleList: document.getElementById('peopleList'),
    alertList: document.getElementById('alertList'),
    positiveList: document.getElementById('positiveList'),
    feedList: document.getElementById('feedList'),
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createInitialState() {
    const now = Date.now();
    return {
      calendar: { day: 1, weekday: 'monday', week: 1, phase: 'idle' },
      resources: { money: 780, energy: 58, focus: 46, mood: 52, stress: 39 },
      hero: { name: PLAYER_NAME, life_mode: 'survival', stability: 24, burnout: 22 },
      routine: { evening_slots: ['rest', 'project'], project_focus: 'clarify', social_priority: ['max'] },
      project: { clarity: 3, prototype: 1, quality: 0, showability: 0 },
      relationships: {
        max: { introduced: true, bond: 2, readiness: 56 },
        zhora: { introduced: false, bond: 0, readiness: 0 },
        zheka: { introduced: false, bond: 0, readiness: 0 },
        kostya: { introduced: true, bond: 2, readiness: 48 },
        ilya: { introduced: true, bond: 2, readiness: 45 },
      },
      group: { circle_trust: 1, group_momentum: 0 },
      room: { order: 36, comfort: 33, project_corner: 24 },
      results: { money_delta: 0, energy_delta: 0, project_delta: 0, bond_delta: 0, room_delta: 0 },
      system: { total_cycles: 0, last_tick_at: now, last_tick_label: 'Стартовый idle-срез' },
      content: { feed: [{ day: 1, weekday: 'monday', title: 'Idle-срез собран', text: 'Теперь герой не проживает каждый вечер вручную. Игрок настраивает жизнь, а система сама показывает, во что она превращается.' }] },
      meta: { version: 2 },
    };
  }

  function validateState(candidate) {
    return candidate && candidate.calendar && candidate.resources && candidate.hero && candidate.routine && candidate.project && candidate.relationships && candidate.group && candidate.room && candidate.results && candidate.system;
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

  function saveState(currentState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  }

  function pushFeed(currentState, title, text) {
    currentState.content.feed.unshift({ day: currentState.calendar.day, weekday: currentState.calendar.weekday, title: title, text: text });
    currentState.content.feed = currentState.content.feed.slice(0, 8);
  }

  function nextWeekday(weekday) {
    return WEEKDAYS[(WEEKDAYS.indexOf(weekday) + 1) % WEEKDAYS.length];
  }

  function isSecondSlotUnlocked(currentState) {
    return currentState.resources.energy >= 45 || currentState.hero.stability >= 30;
  }

  function getPrioritizedPeople(currentState) {
    return currentState.routine.social_priority.filter(function (id) {
      return currentState.relationships[id] && currentState.relationships[id].introduced;
    });
  }

  function advanceCalendar(currentState) {
    const next = nextWeekday(currentState.calendar.weekday);
    currentState.calendar.day += 1;
    currentState.calendar.weekday = next;
    if (next === 'monday') {
      currentState.calendar.week += 1;
    }
  }

  function applyLifeMode(currentState, deltas) {
    if (currentState.hero.life_mode === 'survival') {
      deltas.money += 170; deltas.energy -= 8; deltas.focus -= 2; deltas.mood -= 1; deltas.stress += 2;
    } else if (currentState.hero.life_mode === 'side_hustle') {
      deltas.money += 280; deltas.energy -= 15; deltas.focus -= 6; deltas.mood -= 4; deltas.stress += 8; deltas.project -= 1;
    } else if (currentState.hero.life_mode === 'recovery') {
      deltas.money += 80; deltas.energy += 7; deltas.focus += 5; deltas.mood += 6; deltas.stress -= 7;
    } else if (currentState.hero.life_mode === 'project_focus') {
      deltas.money += 120; deltas.energy -= 12; deltas.focus -= 8; deltas.project += 2; deltas.stress += 5;
    } else if (currentState.hero.life_mode === 'people_focus') {
      deltas.money += 100; deltas.energy -= 7; deltas.mood += 4; deltas.stress -= 1; deltas.bond += 1;
    }
  }

  function applyProjectTick(currentState, deltas, slotUsedProject) {
    const focus = currentState.routine.project_focus;
    let gain = slotUsedProject ? 2 : 0;
    if (currentState.hero.life_mode === 'project_focus') {
      gain += 2;
    }
    if (focus === 'clarify') {
      currentState.project.clarity = clamp(currentState.project.clarity + gain, 0, 100);
      deltas.project += gain;
    } else if (focus === 'build') {
      currentState.project.prototype = clamp(currentState.project.prototype + gain, 0, 100);
      deltas.project += gain;
    } else if (focus === 'polish') {
      currentState.project.quality = clamp(currentState.project.quality + Math.max(1, gain - 1), 0, 100);
      deltas.project += Math.max(1, gain - 1);
    } else if (focus === 'show') {
      currentState.project.showability = clamp(currentState.project.showability + Math.max(1, gain - 1), 0, 100);
      deltas.project += Math.max(1, gain - 1);
    }
  }

  function applySocialTick(currentState, deltas, slotUsedPeople) {
    const priorities = getPrioritizedPeople(currentState);
    PEOPLE.forEach(function (person) {
      const relation = currentState.relationships[person.id];
      if (!relation || !relation.introduced) {
        return;
      }
      relation.readiness = clamp(relation.readiness + 6 + (priorities.indexOf(person.id) !== -1 ? 8 : 0), 0, 100);
    });
    if (slotUsedPeople) {
      priorities.forEach(function (id) {
        const relation = currentState.relationships[id];
        relation.bond = clamp(relation.bond + 1, 0, 10);
        relation.readiness = clamp(relation.readiness - 22, 0, 100);
        deltas.bond += 1;
      });
    }
  }

  function applyCharacterModifiers(currentState, deltas) {
    const priorities = getPrioritizedPeople(currentState);
    if (priorities.indexOf('max') !== -1 && currentState.relationships.max.introduced) {
      deltas.mood += 3; deltas.stress -= 2;
    }
    if (priorities.indexOf('zhora') !== -1 && currentState.relationships.zhora.introduced && currentState.routine.project_focus === 'clarify') {
      currentState.project.clarity = clamp(currentState.project.clarity + 1, 0, 100); deltas.project += 1; deltas.stress -= 1;
    }
    if (priorities.indexOf('zheka') !== -1 && currentState.relationships.zheka.introduced && (currentState.routine.project_focus === 'build' || currentState.routine.project_focus === 'polish')) {
      currentState.project.quality = clamp(currentState.project.quality + 1, 0, 100); deltas.project += 1; deltas.focus += 2;
    }
    if (priorities.indexOf('kostya') !== -1 && priorities.indexOf('ilya') !== -1 && currentState.calendar.weekday === 'friday') {
      currentState.group.circle_trust = clamp(currentState.group.circle_trust + 1, 0, 100); currentState.group.group_momentum = clamp(currentState.group.group_momentum + 1, 0, 100); deltas.bond += 1; deltas.mood += 2;
    }
  }

  function unlockCharacters(currentState) {
    if (!currentState.relationships.zhora.introduced && currentState.relationships.max.bond >= 3) {
      currentState.relationships.zhora.introduced = true;
      currentState.relationships.zhora.readiness = 42;
      pushFeed(currentState, 'Жора открылся как idle modifier', 'После нескольких тёплых контактов Макс снова вывел героя на Жору. Теперь clarify-цикл можно подпитывать удалённой поддержкой.');
    }
    if (!currentState.relationships.zheka.introduced && currentState.project.clarity >= 6) {
      currentState.relationships.zheka.introduced = true;
      currentState.relationships.zheka.readiness = 38;
      pushFeed(currentState, 'Жека вошёл в контур проекта', 'Идея стала достаточно собранной, чтобы Жека начал влиять не на разговоры, а на сам project throughput.');
    }
  }

  function describeCycleNarrative(currentState) {
    if (currentState.resources.money < 220) {
      return 'Цикл снова уходит в money crunch. Без перенастройки life_mode или слотов герой продолжит вытаскивать только быт.';
    }
    if (currentState.resources.energy < 24 || currentState.hero.burnout > 60) {
      return 'Ритм стал слишком тяжёлым. Сейчас это уже не productive grind, а прямой путь в burnout risk.';
    }
    if (currentState.project.clarity + currentState.project.prototype + currentState.project.quality > 18) {
      return 'Проект наконец начинает выглядеть как что-то, что можно показывать не только коту.';
    }
    if (currentState.group.group_momentum > 2) {
      return 'Круг уже не просто висит в памяти. Idle-цикл начал производить общее настроение, а не только цифры.';
    }
    return 'Цикл живёт. Пока ещё шатко, но уже видно, что проблему можно решать настройкой жизни, а не ручным проживанием каждого вечера.';
  }

  function runSingleCycle(currentState) {
    const slotCount = isSecondSlotUnlocked(currentState) ? 2 : 1;
    const slots = currentState.routine.evening_slots.slice(0, slotCount);
    const beforeProject = currentState.project.clarity + currentState.project.prototype + currentState.project.quality + currentState.project.showability;
    const beforeBond = PEOPLE.reduce(function (sum, person) {
      const relation = currentState.relationships[person.id];
      return sum + (relation && relation.introduced ? relation.bond : 0);
    }, 0);
    const beforeRoom = currentState.room.order + currentState.room.comfort + currentState.room.project_corner;
    const deltas = { money: -130, energy: 0, focus: 0, mood: 0, stress: 0, project: 0, bond: 0, room: 0 };

    applyLifeMode(currentState, deltas);
    applyProjectTick(currentState, deltas, slots.indexOf('project') !== -1);
    applySocialTick(currentState, deltas, slots.indexOf('people') !== -1);
    applyCharacterModifiers(currentState, deltas);

    if (slots.indexOf('rest') !== -1) {
      deltas.energy += 10; deltas.mood += 5; deltas.stress -= 6;
    }
    if (slots.indexOf('side_hustle') !== -1) {
      deltas.money += 120; deltas.energy -= 8; deltas.stress += 4;
    }
    if (slots.indexOf('room') !== -1) {
      deltas.room += 8; currentState.room.comfort = clamp(currentState.room.comfort + 3, 0, 100);
    } else {
      deltas.room -= currentState.hero.life_mode === 'side_hustle' ? 5 : 3;
      currentState.room.comfort = clamp(currentState.room.comfort - 1, 0, 100);
    }

    currentState.resources.money = clamp(currentState.resources.money + deltas.money, 0, 9999);
    currentState.resources.energy = clamp(currentState.resources.energy + deltas.energy, 0, 100);
    currentState.resources.focus = clamp(currentState.resources.focus + deltas.focus + Math.floor(currentState.room.project_corner / 25), 0, 100);
    currentState.resources.mood = clamp(currentState.resources.mood + deltas.mood + (currentState.group.group_momentum > 0 ? 1 : 0), 0, 100);
    currentState.resources.stress = clamp(currentState.resources.stress + deltas.stress + (currentState.resources.money < 220 ? 4 : 0), 0, 100);
    currentState.room.order = clamp(currentState.room.order + deltas.room, 0, 100);
    currentState.room.project_corner = clamp(currentState.room.project_corner + (slots.indexOf('project') !== -1 ? 2 : 0), 0, 100);
    currentState.hero.burnout = clamp(currentState.hero.burnout + (currentState.resources.energy < 25 ? 5 : -1) + (currentState.resources.stress > 70 ? 3 : 0), 0, 100);
    currentState.hero.stability = clamp(currentState.hero.stability + (currentState.hero.life_mode === 'recovery' ? 2 : 0) + (currentState.room.order > 50 ? 1 : 0), 0, 100);

    unlockCharacters(currentState);
    advanceCalendar(currentState);
    currentState.system.total_cycles += 1;

    const afterProject = currentState.project.clarity + currentState.project.prototype + currentState.project.quality + currentState.project.showability;
    const afterBond = PEOPLE.reduce(function (sum, person) {
      const relation = currentState.relationships[person.id];
      return sum + (relation && relation.introduced ? relation.bond : 0);
    }, 0);
    const afterRoom = currentState.room.order + currentState.room.comfort + currentState.room.project_corner;

    currentState.results = {
      money_delta: deltas.money,
      energy_delta: deltas.energy,
      project_delta: afterProject - beforeProject,
      bond_delta: afterBond - beforeBond,
      room_delta: afterRoom - beforeRoom,
    };

    pushFeed(currentState, 'Idle-цикл прожит', describeCycleNarrative(currentState));
  }

  function processAutoTicks(currentState, forceOne) {
    const now = Date.now();
    let cycles = forceOne ? 1 : Math.floor((now - currentState.system.last_tick_at) / TICK_MS);
    cycles = Math.min(cycles, MAX_OFFLINE_CYCLES);
    if (cycles <= 0) {
      return false;
    }
    for (let index = 0; index < cycles; index += 1) {
      runSingleCycle(currentState);
    }
    currentState.system.last_tick_at = now;
    currentState.system.last_tick_label = forceOne ? 'Ручной прогон idle-цикла' : 'Авто-прогон за ' + cycles + ' цикл(ов)';
    return true;
  }

  function formatDelta(value, suffix) {
    const sign = value > 0 ? '+' : '';
    return sign + value + (suffix || '');
  }

  function statChip(label, value) {
    return '<div class="s1-stat-chip"><span>' + label + '</span><strong>' + value + '</strong></div>';
  }

  function deriveAlerts(currentState) {
    const alerts = [];
    const positives = [];
    if (currentState.resources.money < 250) {
      alerts.push({ id: 'money_crunch', text: 'money_crunch: денег осталось на пару тяжёлых циклов.' });
    }
    if (currentState.resources.energy < 28 || currentState.resources.stress > 72 || currentState.hero.burnout > 60) {
      alerts.push({ id: 'burnout_risk', text: 'burnout_risk: цикл жрёт героя быстрее, чем восстанавливает.' });
    }
    if (currentState.room.order < 28) {
      alerts.push({ id: 'room_decline', text: 'room_decline: бардак начал бить по recovery и focus.' });
    }
    if (currentState.resources.money > 520 && currentState.resources.energy > 48 && currentState.resources.stress < 44 && currentState.room.order > 42) {
      positives.push({ id: 'stable_routine', text: 'stable_routine: жизнь наконец перестаёт разваливаться между циклами.' });
    }
    if (currentState.results.project_delta >= 3 || (currentState.project.clarity + currentState.project.prototype + currentState.project.quality) > 16) {
      positives.push({ id: 'project_flow', text: 'project_flow: idle-контур реально двигает проект, а не просто имитирует занятость.' });
    }
    return { alerts: alerts, positives: positives };
  }

  function describeRoom(currentState) {
    if (currentState.room.order < 24) {
      return 'Комната снова скатывается в усталый хаос. Recovery проседает, а рабочий угол перестаёт чувствоваться местом силы.';
    }
    if (currentState.room.order > 58 && currentState.room.comfort > 48) {
      return 'Комната уже выглядит не как случайная съёмка, а как место, где цикл действительно помогает жить и собирать своё.';
    }
    return 'Пока это ещё не маленькая студия, но уже и не просто тесная комната, где герой задыхается от рутины.';
  }

  function describeProject(currentState) {
    if (currentState.project.showability > 8) {
      return 'Проект уже подходит к стадии, где idle-цикл производит не только заметки, но и что-то, что не стыдно показывать людям.';
    }
    if (currentState.project.prototype > 6) {
      return 'Есть движение в build-слое. Следующий вопрос уже не "идея ли это", а "что из этого собрать дальше".';
    }
    return 'Проект пока в ранней фазе: нужно удержать clarity, не развалиться по энергии и только потом давить build/polish.';
  }

  function describeCycleStatus(currentState) {
    const derived = deriveAlerts(currentState);
    if (derived.alerts.length > 0) {
      return derived.alerts[0].id;
    }
    if (derived.positives.length > 0) {
      return derived.positives[0].id;
    }
    return 'Цикл стабилизируется';
  }

  function renderHud(currentState) {
    elements.hudDay.textContent = WEEKDAY_LABELS[currentState.calendar.weekday] + ', день ' + currentState.calendar.day;
    elements.cycleStatus.textContent = describeCycleStatus(currentState);
    elements.hudStats.innerHTML = [
      statChip('life_mode', currentState.hero.life_mode),
      statChip('Деньги', currentState.resources.money + ' ₽'),
      statChip('Энергия', currentState.resources.energy),
      statChip('Focus', currentState.resources.focus),
      statChip('Mood', currentState.resources.mood),
      statChip('Stress', currentState.resources.stress)
    ].join('');
  }

  function renderRoom(currentState) {
    elements.roomTitle.textContent = currentState.room.order > 52 ? 'Комната начинает держать цикл' : 'Комната всё ещё спорит с жизнью героя';
    elements.roomMoodTag.textContent = currentState.room.order < 28 ? 'decline' : (currentState.room.order > 52 ? 'stable' : 'шатко');
    elements.roomSummary.textContent = describeRoom(currentState);
    elements.roomStats.innerHTML = [
      '<span class="s1-tag">Order: ' + currentState.room.order + '</span>',
      '<span class="s1-tag">Comfort: ' + currentState.room.comfort + '</span>',
      '<span class="s1-tag">Project corner: ' + currentState.room.project_corner + '</span>',
      '<span class="s1-tag">Stability: ' + currentState.hero.stability + '</span>'
    ].join('');
    elements.roomStage.dataset.mood = currentState.room.order < 28 ? 'decline' : (currentState.room.order > 52 ? 'stable' : 'mixed');
  }

  function renderResults(currentState) {
    elements.lastTickInfo.textContent = currentState.system.last_tick_label;
    elements.resultsRail.innerHTML = [
      { label: 'money_delta', value: formatDelta(currentState.results.money_delta, ' ₽') },
      { label: 'energy_delta', value: formatDelta(currentState.results.energy_delta) },
      { label: 'project_delta', value: formatDelta(currentState.results.project_delta) },
      { label: 'bond_delta', value: formatDelta(currentState.results.bond_delta) },
      { label: 'room_delta', value: formatDelta(currentState.results.room_delta) }
    ].map(function (item) {
      return '<article class="s1-result-card"><small>' + item.label + '</small><strong>' + item.value + '</strong></article>';
    }).join('');
  }

  function renderControls(currentState) {
    elements.lifeModeControl.innerHTML = LIFE_MODES.map(function (mode) {
      return '<button class="s1-segment-button ' + (currentState.hero.life_mode === mode.id ? 'is-active' : '') + '" type="button" data-life-mode="' + mode.id + '">' + mode.label + '</button>';
    }).join('');

    elements.slotControls.innerHTML = [0, 1].map(function (slotIndex) {
      const locked = slotIndex === 1 && !isSecondSlotUnlocked(currentState);
      const options = SLOT_OPTIONS.map(function (option) {
        return '<option value="' + option.id + '"' + (currentState.routine.evening_slots[slotIndex] === option.id ? ' selected' : '') + '>' + option.label + '</option>';
      }).join('');
      return '<label class="s1-slot-card ' + (locked ? 'is-locked' : '') + '"><span>Слот ' + (slotIndex + 1) + (locked ? ' · заблокирован состоянием' : '') + '</span><select data-slot-index="' + slotIndex + '"' + (locked ? ' disabled' : '') + '>' + options + '</select></label>';
    }).join('');

    elements.projectFocusControl.innerHTML = PROJECT_FOCUSES.map(function (focus) {
      return '<button class="s1-segment-button ' + (currentState.routine.project_focus === focus.id ? 'is-active' : '') + '" type="button" data-project-focus="' + focus.id + '">' + focus.label + '</button>';
    }).join('');

    elements.socialPriorityControl.innerHTML = PEOPLE.map(function (person) {
      const relation = currentState.relationships[person.id];
      const introduced = relation && relation.introduced;
      const active = currentState.routine.social_priority.indexOf(person.id) !== -1;
      return '<button class="s1-priority-chip ' + (active ? 'is-active' : '') + '" type="button" data-priority-id="' + person.id + '"' + (introduced ? '' : ' disabled') + '>' + person.name + '</button>';
    }).join('');
  }

  function renderProject(currentState) {
    elements.projectTitle.textContent = (currentState.project.clarity + currentState.project.prototype + currentState.project.quality) > 18 ? 'Проект поехал как система' : 'Проект ещё требует ручной дисциплины';
    elements.projectTag.textContent = currentState.routine.project_focus;
    elements.projectSummary.textContent = describeProject(currentState);
    elements.projectStats.innerHTML = [
      '<span class="s1-tag">Clarity: ' + currentState.project.clarity + '</span>',
      '<span class="s1-tag">Build: ' + currentState.project.prototype + '</span>',
      '<span class="s1-tag">Polish: ' + currentState.project.quality + '</span>',
      '<span class="s1-tag">Show: ' + currentState.project.showability + '</span>'
    ].join('');
  }

  function renderPeople(currentState) {
    elements.groupStats.innerHTML = [
      '<span class="s1-tag">circle_trust: ' + currentState.group.circle_trust + '</span>',
      '<span class="s1-tag">group_momentum: ' + currentState.group.group_momentum + '</span>'
    ].join('');
    elements.peopleList.innerHTML = PEOPLE.map(function (person) {
      const relation = currentState.relationships[person.id];
      const introduced = relation && relation.introduced;
      const readyText = introduced ? 'readiness: ' + relation.readiness : 'пока не в цикле';
      return '<article class="s1-person-card"><h3>' + person.name + '</h3><p>' + person.role + '</p><div class="s1-person-meta"><span class="s1-tag">' + (introduced ? 'bond: ' + relation.bond : 'locked') + '</span><span class="s1-tag ' + (introduced ? 'is-good' : 'is-risk') + '">' + readyText + '</span></div></article>';
    }).join('');
  }

  function renderAlerts(currentState) {
    const derived = deriveAlerts(currentState);
    elements.alertList.innerHTML = derived.alerts.length === 0
      ? '<div class="s1-alert-card is-positive">Критических alerts нет. Это редкость, но пока держится.</div>'
      : derived.alerts.map(function (item) { return '<div class="s1-alert-card is-alert">' + item.text + '</div>'; }).join('');
    elements.positiveList.innerHTML = derived.positives.length === 0
      ? '<div class="s1-alert-card">Положительные устойчивые состояния ещё не закрепились.</div>'
      : derived.positives.map(function (item) { return '<div class="s1-alert-card is-positive">' + item.text + '</div>'; }).join('');
  }

  function renderFeed(currentState) {
    elements.feedList.innerHTML = currentState.content.feed.map(function (item) {
      return '<article class="s1-feed-item"><small>' + WEEKDAY_LABELS[item.weekday] + ' · день ' + item.day + '</small><h3>' + item.title + '</h3><p>' + item.text + '</p></article>';
    }).join('');
  }

  function render(currentState) {
    renderHud(currentState);
    renderRoom(currentState);
    renderResults(currentState);
    renderControls(currentState);
    renderProject(currentState);
    renderPeople(currentState);
    renderAlerts(currentState);
    renderFeed(currentState);
  }

  function togglePriority(currentState, personId) {
    const current = currentState.routine.social_priority.slice();
    const index = current.indexOf(personId);
    if (index !== -1) {
      current.splice(index, 1);
    } else if (current.length < 2) {
      current.push(personId);
    } else {
      current.shift();
      current.push(personId);
    }
    currentState.routine.social_priority = current;
  }

  let state = loadState();
  processAutoTicks(state, false);
  saveState(state);
  render(state);

  elements.runCycleNow.addEventListener('click', function () {
    processAutoTicks(state, true);
    saveState(state);
    render(state);
  });

  elements.resetRun.addEventListener('click', function () {
    state = createInitialState();
    saveState(state);
    render(state);
  });

  elements.lifeModeControl.addEventListener('click', function (event) {
    const button = event.target.closest('[data-life-mode]');
    if (!button) {
      return;
    }
    state.hero.life_mode = button.getAttribute('data-life-mode');
    saveState(state);
    render(state);
  });

  elements.slotControls.addEventListener('change', function (event) {
    const select = event.target.closest('[data-slot-index]');
    if (!select) {
      return;
    }
    state.routine.evening_slots[Number(select.getAttribute('data-slot-index'))] = select.value;
    saveState(state);
    render(state);
  });

  elements.projectFocusControl.addEventListener('click', function (event) {
    const button = event.target.closest('[data-project-focus]');
    if (!button) {
      return;
    }
    state.routine.project_focus = button.getAttribute('data-project-focus');
    saveState(state);
    render(state);
  });

  elements.socialPriorityControl.addEventListener('click', function (event) {
    const button = event.target.closest('[data-priority-id]');
    if (!button) {
      return;
    }
    togglePriority(state, button.getAttribute('data-priority-id'));
    saveState(state);
    render(state);
  });

  window.setInterval(function () {
    if (processAutoTicks(state, false)) {
      saveState(state);
      render(state);
    }
  }, 5000);
}());
