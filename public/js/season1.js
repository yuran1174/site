(function () {
  'use strict';

  const STORAGE_KEY = 'season1_dev_fantasy_v4';
  const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const WEEKDAY_LABELS = {
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье'
  };
  const SLOT_LABELS = ['Утро', 'День', 'Вечер', 'Ночь'];
  const PLAYER_NAME = (window.SEASON1_BOOTSTRAP && window.SEASON1_BOOTSTRAP.playerName) || 'Основатель';

  const PEOPLE = [
    { id: 'max', name: 'Макс', role: 'Помогает качать комьюнити и находить первые громкие показы.' },
    { id: 'kostya', name: 'Костя', role: 'Даёт ощущение команды и стабилизирует общий production rhythm.' },
    { id: 'zheka', name: 'Жека', role: 'Подключается к коду и превращает прототип в реальный билд.' },
    { id: 'ilya', name: 'Илья', role: 'Приносит чувство направления и помогает собирать studio identity.' }
  ];

  const UPGRADES = [
    { id: 'whiteboard', label: 'Whiteboard', threshold: 18 },
    { id: 'second_monitor', label: 'Second monitor', threshold: 36 },
    { id: 'capture_corner', label: 'Capture corner', threshold: 54 },
    { id: 'community_wall', label: 'Community wall', threshold: 72 }
  ];

  const ACTIONS = [
    {
      id: 'design',
      label: 'Дизайн-сессия',
      icon: '🎨',
      scene: 'project',
      description: 'Разгоняет vision и делает игру узнаваемой.',
      preview: ['+9 vision', '+5 inspiration', '-8 stamina'],
      apply: function (state) {
        applyDelta(state, { stamina: -8, inspiration: 5, vision: 9, quality: 2 });
        addFeed(state, 'Вижен игры становится яснее', 'Сеттинг, тон и ядро идеи начинают складываться в проект, который можно объяснить одним предложением.');
      }
    },
    {
      id: 'build',
      label: 'Собрать билд',
      icon: '🧩',
      scene: 'project',
      description: 'Главный push в prototype progress.',
      preview: ['+11 prototype', '+3 quality', '-12 stamina'],
      require: function (state) {
        if (state.resources.stamina < 16) {
          return 'Нужно больше stamina.';
        }
        if (state.resources.inspiration < 10) {
          return 'Нужен хоть какой-то spark.';
        }
        return null;
      },
      apply: function (state) {
        applyDelta(state, { stamina: -12, inspiration: -4, prototype: 11, quality: 3 });
        addFeed(state, 'Билд реально подрос', 'Это уже не мечта про игру, а кусок playable experience, который можно прожимать руками.');
      }
    },
    {
      id: 'juice',
      label: 'Полировка и juice',
      icon: '✨',
      scene: 'clean',
      description: 'Делает проект вкусным, а не просто рабочим.',
      preview: ['+9 quality', '+6 hype', '-8 stamina'],
      require: function (state) {
        if (state.project.prototype < 18) {
          return 'Сначала нужен более плотный билд.';
        }
        return null;
      },
      apply: function (state) {
        applyDelta(state, { stamina: -8, quality: 9, hype: 6, studio: 2 });
        addFeed(state, 'Проект стал выглядеть дороже', 'Анимации, отклик и мелкие детали резко меняют восприятие игры без полной смены ядра.');
      }
    },
    {
      id: 'network',
      label: 'Нетворк',
      icon: '🤝',
      scene: 'hangout',
      description: 'Двигает комьюнити, союзников и шансы на showcase.',
      preview: ['+10 hype', '+8 fanbase', '+bond'],
      apply: function (state) {
        applyDelta(state, { stamina: -6, inspiration: 3, hype: 10, fanbase: 8, momentum: 5 });
        state.relationships.max.bond = clamp(state.relationships.max.bond + 1, 0, 10);
        if (state.relationships.kostya.unlocked) {
          state.relationships.kostya.bond = clamp(state.relationships.kostya.bond + 1, 0, 10);
        }
        addFeed(state, 'Про игру начали говорить', 'Один удачный разговор на встрече комьюнити двигает visibility сильнее, чем ещё один молчаливый вечер в одиночку.');
      }
    },
    {
      id: 'contract',
      label: 'Контрактная работа',
      icon: '📦',
      scene: 'work',
      description: 'Приносит budget, но ворует темп собственного проекта.',
      preview: ['+180 budget', '-10 stamina', '-3 inspiration'],
      apply: function (state) {
        applyDelta(state, { budget: 180, stamina: -10, inspiration: -3, momentum: -2 });
        addFeed(state, 'Контракт закрыл budget gap', 'Деньги для студии пришли, но свой проект на этот слот не вырос.');
      }
    },
    {
      id: 'upgrade',
      label: 'Апгрейд студии',
      icon: '🛠️',
      scene: 'clean',
      description: 'Растит пространство и открывает feeling прогресса.',
      preview: ['-120 budget', '+10 studio', '+5 quality'],
      require: function (state) {
        if (state.resources.budget < 120) {
          return 'Недостаточно budget.';
        }
        return null;
      },
      apply: function (state) {
        applyDelta(state, { budget: -120, studio: 10, quality: 5, inspiration: 4 });
        unlockUpgrades(state);
        addFeed(state, 'Студия стала выглядеть серьёзнее', 'Новый апгрейд сразу меняет атмосферу: теперь пространство продаёт амбицию, а не просто вмещает компьютер.');
      }
    }
  ];

  const elements = {
    resetRun: document.getElementById('resetRun'),
    dayLabel: document.getElementById('dayLabel'),
    weekLabel: document.getElementById('weekLabel'),
    slotLabel: document.getElementById('slotLabel'),
    objectiveText: document.getElementById('objectiveText'),
    hudStats: document.getElementById('hudStats'),
    sceneTitle: document.getElementById('sceneTitle'),
    sceneMood: document.getElementById('sceneMood'),
    currentAction: document.getElementById('currentAction'),
    sceneText: document.getElementById('sceneText'),
    sceneStats: document.getElementById('sceneStats'),
    roomStage: document.getElementById('roomStage'),
    timelineHint: document.getElementById('timelineHint'),
    timeline: document.getElementById('timeline'),
    actionHint: document.getElementById('actionHint'),
    actionGrid: document.getElementById('actionGrid'),
    projectTitle: document.getElementById('projectTitle'),
    projectDeadline: document.getElementById('projectDeadline'),
    projectSummary: document.getElementById('projectSummary'),
    projectBars: document.getElementById('projectBars'),
    peopleList: document.getElementById('peopleList'),
    feedList: document.getElementById('feedList'),
    eventModal: document.getElementById('eventModal'),
    eventTitle: document.getElementById('eventTitle'),
    eventText: document.getElementById('eventText'),
    eventChoices: document.getElementById('eventChoices')
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function nextWeekday(current) {
    return WEEKDAYS[(WEEKDAYS.indexOf(current) + 1) % WEEKDAYS.length];
  }

  function createInitialState() {
    return {
      calendar: { day: 1, week: 1, weekday: 'monday', slotIndex: 0 },
      resources: { budget: 640, stamina: 68, inspiration: 52, hype: 6, fanbase: 0 },
      studio: { level: 18, upgrades: ['whiteboard'] },
      hero: { name: PLAYER_NAME, lastAction: 'project', lastActionLabel: 'собирает первый питч' },
      project: { vision: 12, prototype: 4, quality: 2, showcase: 0, shipped: false, milestoneInDays: 14 },
      relationships: {
        max: { unlocked: true, bond: 2 },
        kostya: { unlocked: true, bond: 1 },
        zheka: { unlocked: false, bond: 0 },
        ilya: { unlocked: false, bond: 0 }
      },
      momentum: 14,
      today: { actions: [null, null, null, null] },
      pendingEvent: null,
      content: {
        feed: [
          {
            day: 1,
            title: 'Инди-забег начался',
            text: 'Студия ещё домашняя, но у проекта уже есть тон, амбиция и шанс стать чем-то большим, чем локальный прототип.'
          }
        ]
      },
      meta: { version: 4 }
    };
  }

  function validateState(candidate) {
    return candidate && candidate.meta && candidate.meta.version === 4 && candidate.calendar && candidate.resources && candidate.project && candidate.today;
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

  function addFeed(state, title, text) {
    state.content.feed.unshift({ day: state.calendar.day, title: title, text: text });
    state.content.feed = state.content.feed.slice(0, 10);
  }

  function applyDelta(state, delta) {
    state.resources.budget = clamp(state.resources.budget + (delta.budget || 0), 0, 99999);
    state.resources.stamina = clamp(state.resources.stamina + (delta.stamina || 0), 0, 100);
    state.resources.inspiration = clamp(state.resources.inspiration + (delta.inspiration || 0), 0, 100);
    state.resources.hype = clamp(state.resources.hype + (delta.hype || 0), 0, 100);
    state.resources.fanbase = clamp(state.resources.fanbase + (delta.fanbase || 0), 0, 99999);
    state.project.vision = clamp(state.project.vision + (delta.vision || 0), 0, 100);
    state.project.prototype = clamp(state.project.prototype + (delta.prototype || 0), 0, 100);
    state.project.quality = clamp(state.project.quality + (delta.quality || 0), 0, 100);
    state.project.showcase = clamp(state.project.showcase + (delta.showcase || 0), 0, 100);
    state.studio.level = clamp(state.studio.level + (delta.studio || 0), 0, 100);
    state.momentum = clamp(state.momentum + (delta.momentum || 0), 0, 100);
  }

  function unlockUpgrades(state) {
    UPGRADES.forEach(function (upgrade) {
      if (state.studio.level >= upgrade.threshold && state.studio.upgrades.indexOf(upgrade.id) === -1) {
        state.studio.upgrades.push(upgrade.id);
        addFeed(state, 'Студия получила апгрейд: ' + upgrade.label, 'Визуально и эмоционально space выросло. Это уже похоже на место, где делают игру, а не просто сидят за ноутом.');
      }
    });
  }

  function unlockPeople(state) {
    if (!state.relationships.zheka.unlocked && state.project.prototype >= 24) {
      state.relationships.zheka.unlocked = true;
      addFeed(state, 'Жека вошёл в командный контур', 'Playable build стал достаточно плотным, чтобы Жека захотел вписаться и помочь с production-side.');
    }
    if (!state.relationships.ilya.unlocked && state.resources.hype >= 28) {
      state.relationships.ilya.unlocked = true;
      addFeed(state, 'Илья почувствовал потенциал проекта', 'Как только вокруг игры появился шум, в круг вернулся человек, который умеет превращать локальный проект в историю.');
    }
  }

  function getPhase(state) {
    if (state.project.shipped) {
      return 'launched';
    }
    if (state.project.vision < 26) {
      return 'vision';
    }
    if (state.project.prototype < 34) {
      return 'prototype';
    }
    if (state.project.quality < 26) {
      return 'juice';
    }
    if (state.resources.hype < 30 || state.resources.fanbase < 60) {
      return 'community';
    }
    return 'showcase';
  }

  function phaseTitle(phase) {
    if (phase === 'vision') {
      return 'Формируется чёткий вижен';
    }
    if (phase === 'prototype') {
      return 'Вертикальный slice собирается';
    }
    if (phase === 'juice') {
      return 'Проекту нужна магия и вкус';
    }
    if (phase === 'community') {
      return 'Пора расти за пределы комнаты';
    }
    if (phase === 'showcase') {
      return 'Все линии ведут к большому показу';
    }
    return 'Игра уже вышла в свет';
  }

  function phaseSummary(phase) {
    if (phase === 'vision') {
      return 'Сейчас важнее не количество кликов, а ощущение, что проект можно питчить как цельную мечту.';
    }
    if (phase === 'prototype') {
      return 'Время превращать обещание в playable вертикальный slice.';
    }
    if (phase === 'juice') {
      return 'Основа уже есть, теперь нужен вкус: polish, juice и ощущение качества.';
    }
    if (phase === 'community') {
      return 'Хорошая игра без аудитории остаётся закрытой папкой на диске.';
    }
    if (phase === 'showcase') {
      return 'Остался шаг до первого громкого показа. Теперь важны timing, pitch и уверенность.';
    }
    return 'Шоукейс состоялся. Дальше начинается жизнь проекта в людях.';
  }

  function canShowcase(state) {
    return !state.project.shipped && state.project.vision >= 26 && state.project.prototype >= 34 && state.project.quality >= 26 && state.resources.hype >= 30 && state.resources.fanbase >= 60;
  }

  function makeEvent(id, title, text, choices) {
    return { id: id, title: title, text: text, choices: choices };
  }

  function applyChoice(state, choice) {
    applyDelta(state, choice.delta || {});
    if (choice.relationships) {
      Object.keys(choice.relationships).forEach(function (id) {
        if (state.relationships[id]) {
          state.relationships[id].bond = clamp(state.relationships[id].bond + choice.relationships[id], 0, 10);
        }
      });
    }
    if (choice.shipProject) {
      state.project.shipped = true;
    }
    if (choice.unlock) {
      state.relationships[choice.unlock].unlocked = true;
    }
    unlockUpgrades(state);
    unlockPeople(state);
    addFeed(state, choice.feedTitle, choice.feedText);
    state.pendingEvent = null;
    saveState(state);
    render(state);
  }

  function maybeTriggerEvent(state, actionId) {
    if (actionId === 'network' && state.resources.hype >= 18 && !state.relationships.ilya.unlocked) {
      state.pendingEvent = makeEvent(
        'community_pitch',
        'Комьюнити-питч выстрелил',
        'После локальной встречи про твой проект заговорили громче обычного. Можно либо вложиться в devlog, либо быстро собрать mini-demo для стримера.',
        [
          {
            label: 'Сделать devlog',
            delta: { hype: 8, fanbase: 18, vision: 4 },
            feedTitle: 'Devlog разогнал интерес',
            feedText: 'Люди начали следить не только за игрой, но и за твоим путём её сборки.'
          },
          {
            label: 'Собрать mini-demo',
            delta: { prototype: 6, quality: 3, stamina: -6, fanbase: 12 },
            feedTitle: 'Mini-demo ушёл в руки стримеру',
            feedText: 'Рискованный ход, но он сделал игру заметной быстрее, чем обычный пост.'
          }
        ]
      );
      return true;
    }
    if (actionId === 'build' && state.project.prototype >= 24 && !state.relationships.zheka.unlocked) {
      state.pendingEvent = makeEvent(
        'zheka_join',
        'Жека хочет вписаться',
        'Увидев вертикальный slice, Жека предлагает помочь собрать production pipeline. Брать его в контур или остаться соло ещё на пару недель?',
        [
          {
            label: 'Подключить Жеку',
            unlock: 'zheka',
            delta: { quality: 6, momentum: 6 },
            feedTitle: 'Жека вошёл в проект',
            feedText: 'Проект резко стал выглядеть взрослее: меньше хаоса, больше инженерного ритма.'
          },
          {
            label: 'Пока остаться одному',
            delta: { vision: 4, inspiration: 4 },
            feedTitle: 'Пока курс держится соло',
            feedText: 'Это даёт творческий контроль, но не ускоряет production.'
          }
        ]
      );
      return true;
    }
    if (canShowcase(state)) {
      state.pendingEvent = makeEvent(
        'showcase',
        'Первый большой showcase',
        'У проекта есть билд, вкус и аудитория. Выбор теперь не в том, готова ли игра, а в том, как именно о ней заявить.',
        [
          {
            label: 'Громкий публичный показ',
            delta: { fanbase: 80, hype: 18, momentum: 10 },
            shipProject: true,
            feedTitle: 'Показ прошёл громко',
            feedText: 'Комната перестала быть концом истории. Теперь у проекта есть настоящая сцена и живые люди вокруг.'
          },
          {
            label: 'Камерный demo-night',
            delta: { fanbase: 45, quality: 6, momentum: 8 },
            shipProject: true,
            feedTitle: 'Demo-night собрал своих',
            feedText: 'Показ получился меньше по охвату, но дал правильную химию и уверенность для следующего рывка.'
          }
        ]
      );
      return true;
    }
    return false;
  }

  function endDay(state) {
    applyDelta(state, { stamina: 10, inspiration: 4, budget: -20 });
    state.project.milestoneInDays -= 1;
    if (state.calendar.day % 7 === 0) {
      applyDelta(state, { budget: -140, hype: 2 });
      addFeed(state, 'Неделя закрыта', 'Расходы студии съели часть бюджета, но за неделю проект стал заметнее на рынке идей.');
    }
    if (state.project.milestoneInDays <= 0 && !state.project.shipped) {
      state.project.milestoneInDays = 7;
      applyDelta(state, { hype: 8, momentum: 6, budget: 120 });
      addFeed(state, 'Milestone review прошёл', 'Даже без релиза команда получила новый ориентир, чуть больше денег и ощущение прогресса.');
    }
    unlockUpgrades(state);
    unlockPeople(state);
    state.calendar.day += 1;
    state.calendar.weekday = nextWeekday(state.calendar.weekday);
    if (state.calendar.weekday === 'monday') {
      state.calendar.week += 1;
    }
    state.calendar.slotIndex = 0;
    state.today.actions = [null, null, null, null];
  }

  function executeAction(state, actionId) {
    if (state.pendingEvent) {
      return;
    }
    const action = ACTIONS.find(function (item) {
      return item.id === actionId;
    });
    if (!action) {
      return;
    }
    const reason = action.require ? action.require(state) : null;
    if (reason) {
      return;
    }
    action.apply(state);
    state.hero.lastAction = action.scene;
    state.hero.lastActionLabel = action.label.toLowerCase();
    state.today.actions[state.calendar.slotIndex] = { actionId: action.id, label: action.label, icon: action.icon };
    state.calendar.slotIndex += 1;
    unlockUpgrades(state);
    unlockPeople(state);
    if (!state.pendingEvent) {
      maybeTriggerEvent(state, action.id);
    }
    if (state.calendar.slotIndex >= SLOT_LABELS.length) {
      endDay(state);
      if (!state.pendingEvent) {
        maybeTriggerEvent(state, action.id);
      }
    }
    saveState(state);
    render(state);
  }

  function statChip(label, value) {
    return '<span class="s1-stat-chip"><span>' + label + '</span><strong>' + value + '</strong></span>';
  }

  function tag(text) {
    return '<span class="s1-tag">' + text + '</span>';
  }

  function sceneState(state) {
    if (state.project.shipped) {
      return {
        title: 'Студия только что пережила свой первый громкий показ',
        mood: 'Проект вышел в свет',
        text: 'Теперь пространство вокруг героя ощущается как стартовая база настоящей инди-истории, а не как временное убежище.',
        scene: 'hangout'
      };
    }
    if (state.resources.hype >= 28 && state.resources.fanbase >= 40) {
      return {
        title: 'Вокруг проекта уже есть ощутимый шум',
        mood: 'Комьюнити растёт',
        text: 'Теперь важно не только делать хорошую игру, но и выдерживать темп, который заметили другие люди.',
        scene: 'hangout'
      };
    }
    if (state.project.prototype >= 20) {
      return {
        title: 'На столе уже лежит настоящий vertical slice',
        mood: 'Игра обретает форму',
        text: 'Каждый следующий слот решает, будет ли это просто крепкий прототип или реально запоминающийся инди-проект.',
        scene: 'project'
      };
    }
    return {
      title: 'Домашняя студия только набирает форму',
      mood: 'Первый прототип в воздухе',
      text: 'Сейчас фантазия проекта важна не меньше кода. Игрок должен чувствовать рост мира, студии и команды одновременно.',
      scene: state.hero.lastAction
    };
  }

  function renderHud(state) {
    elements.dayLabel.textContent = WEEKDAY_LABELS[state.calendar.weekday] + ', день ' + state.calendar.day;
    elements.weekLabel.textContent = 'Неделя ' + state.calendar.week;
    elements.slotLabel.textContent = SLOT_LABELS[Math.min(state.calendar.slotIndex, SLOT_LABELS.length - 1)];
    elements.objectiveText.textContent = state.project.shipped
      ? 'Первый показ состоялся. Теперь проект уже живёт в людях и в следующем рывке студии.'
      : 'Собери vertical slice, прокачай studio presence и доведи игру до showcase.';
    elements.hudStats.innerHTML = [
      statChip('Budget', state.resources.budget + ' ₽'),
      statChip('Stamina', state.resources.stamina),
      statChip('Inspiration', state.resources.inspiration),
      statChip('Hype', state.resources.hype),
      statChip('Fanbase', state.resources.fanbase),
      statChip('Studio', state.studio.level)
    ].join('');
  }

  function renderScene(state) {
    const scene = sceneState(state);
    elements.sceneTitle.textContent = scene.title;
    elements.sceneMood.textContent = scene.mood;
    elements.currentAction.textContent = state.hero.lastActionLabel;
    elements.sceneText.textContent = scene.text;
    elements.roomStage.dataset.scene = scene.scene;
    elements.sceneStats.innerHTML = [
      tag('milestone: ' + state.project.milestoneInDays + ' дн.'),
      tag('upgrades: ' + state.studio.upgrades.length),
      tag('momentum: ' + state.momentum)
    ].join('');
  }

  function renderTimeline(state) {
    elements.timelineHint.textContent = state.pendingEvent ? 'Сначала реши сюжетное событие' : 'Слот ' + (state.calendar.slotIndex + 1) + ' из 4';
    elements.timeline.innerHTML = SLOT_LABELS.map(function (label, index) {
      const entry = state.today.actions[index];
      const classNames = ['s1-timeline-slot'];
      if (entry) {
        classNames.push('is-filled');
      }
      if (index === state.calendar.slotIndex && !entry && state.calendar.slotIndex < SLOT_LABELS.length) {
        classNames.push('is-current');
      }
      return '<article class="' + classNames.join(' ') + '"><small>' + label + '</small><strong>' + (entry ? entry.icon + ' ' + entry.label : 'Открытый продакшен-слот') + '</strong><span>' + (entry ? 'Этот слот уже стал частью истории проекта.' : 'Выбери, что сейчас важнее: билд, комьюнити или рост студии.') + '</span></article>';
    }).join('');
  }

  function renderActions(state) {
    elements.actionHint.textContent = state.pendingEvent
      ? 'Пока событие не закрыто, следующий ход заблокирован.'
      : 'Каждое действие двигает одну из трёх осей: игра, студия, аудитория.';
    elements.actionGrid.innerHTML = ACTIONS.map(function (action) {
      const reason = state.pendingEvent ? 'Сначала выбери исход события.' : (action.require ? action.require(state) : null);
      const deltas = action.preview.map(function (item) {
        return '<span class="s1-delta ' + (item.indexOf('-') === 0 ? 'is-bad' : 'is-good') + '">' + item + '</span>';
      }).join('');
      return '<button class="s1-action-button" type="button" data-action-id="' + action.id + '"' + (reason ? ' disabled' : '') + '><div class="s1-action-head"><h3>' + action.label + '</h3><span class="s1-action-icon">' + action.icon + '</span></div><p>' + action.description + '</p><div class="s1-action-deltas">' + deltas + '</div><small>' + (reason || 'Доступно сейчас') + '</small></button>';
    }).join('');
  }

  function renderProject(state) {
    const phase = getPhase(state);
    const bars = [
      { label: 'Vision', value: state.project.vision },
      { label: 'Prototype', value: state.project.prototype },
      { label: 'Quality', value: state.project.quality },
      { label: 'Showcase', value: state.resources.hype }
    ];
    elements.projectTitle.textContent = phaseTitle(phase);
    elements.projectDeadline.textContent = 'Milestone: ' + state.project.milestoneInDays + ' дней';
    elements.projectSummary.textContent = phaseSummary(phase);
    elements.projectBars.innerHTML = bars.map(function (bar) {
      return '<article class="s1-progress-card"><h3>' + bar.label + '</h3><strong>' + bar.value + '/100</strong><div class="s1-progress-bar"><div class="s1-progress-fill" style="width:' + bar.value + '%"></div></div></article>';
    }).join('');
  }

  function renderPeople(state) {
    elements.peopleList.innerHTML = PEOPLE.map(function (person) {
      const relation = state.relationships[person.id];
      if (!relation.unlocked) {
        return '<article class="s1-person-card"><h3>' + person.name + '</h3><p>' + person.role + '</p><div class="s1-person-meta">' + tag('locked by story') + '</div></article>';
      }
      return '<article class="s1-person-card"><h3>' + person.name + '</h3><p>' + person.role + '</p><div class="s1-person-meta">' + tag('bond: ' + relation.bond) + tag('active in studio') + '</div></article>';
    }).join('');
  }

  function renderFeed(state) {
    elements.feedList.innerHTML = state.content.feed.map(function (item) {
      return '<article class="s1-feed-item"><small>День ' + item.day + '</small><h3>' + item.title + '</h3><p>' + item.text + '</p></article>';
    }).join('');
  }

  function renderEvent(state) {
    if (!state.pendingEvent) {
      elements.eventModal.hidden = true;
      elements.eventChoices.innerHTML = '';
      return;
    }
    elements.eventModal.hidden = false;
    elements.eventTitle.textContent = state.pendingEvent.title;
    elements.eventText.textContent = state.pendingEvent.text;
    elements.eventChoices.innerHTML = state.pendingEvent.choices.map(function (choice, index) {
      return '<button class="s1-choice-button" type="button" data-choice-index="' + index + '">' + choice.label + '</button>';
    }).join('');
  }

  function render(state) {
    renderHud(state);
    renderScene(state);
    renderTimeline(state);
    renderActions(state);
    renderProject(state);
    renderPeople(state);
    renderFeed(state);
    renderEvent(state);
  }

  const state = loadState();

  elements.actionGrid.addEventListener('click', function (event) {
    const button = event.target.closest('[data-action-id]');
    if (!button) {
      return;
    }
    executeAction(state, button.getAttribute('data-action-id'));
  });

  elements.eventChoices.addEventListener('click', function (event) {
    const button = event.target.closest('[data-choice-index]');
    if (!button || !state.pendingEvent) {
      return;
    }
    const choice = state.pendingEvent.choices[Number(button.getAttribute('data-choice-index'))];
    if (!choice) {
      return;
    }
    applyChoice(state, choice);
  });

  elements.resetRun.addEventListener('click', function () {
    const fresh = createInitialState();
    saveState(fresh);
    window.location.reload();
  });

  render(state);
}());
