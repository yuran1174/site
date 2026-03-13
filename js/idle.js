/* ================================================
   КОД И КОФЕ — Idle Game Logic
   Orchestration layer
   ================================================ */

'use strict';

const {
  TICK_MS,
  SAVE_INTERVAL,
  SERVER_SAVE_INTERVAL,
  createInitialState,
  createInitialTempState,
} = window.IdleRuntime;

const {
  fmt,
  fmtTime,
  getLocPerSecond,
  randomEventDelay,
  getPrestigeShopEffect,
} = window.IdleEconomy;

const {
  buildSaveData,
  saveGame,
  saveGameServer,
  loadGame,
  loadGameServer,
} = window.IdleSave;

const {
  showToast,
  shuffledNews,
  advanceTicker,
  renderBuildings,
  renderUpgrades,
  updateOODisplay,
  updateTopBar,
  renderAll,
  initTabs,
} = window.IdleRender;

const {
  BUILDINGS,
  UPGRADES,
  STORY_CHAPTERS,
  ACHIEVEMENTS,
  EVENTS,
  NEWS_MESSAGES,
} = window.IdleData;

const {
  triggerEvent,
  updateEventBadge,
  doPrestige,
  handleClick,
  checkAchievements,
} = window.IdleActions;

let state = createInitialState();
let tempState = createInitialTempState();

let tickCount = 0;
let nextEventIn = randomEventDelay();
let buyQty = 1;
let newsIndex = 0;
let newsTimer = 0;
let lastSaveTime = Date.now();
let lastServerSaveTime = Date.now();
let lastTickTime = Date.now();
let hiddenAt = null;

// Compatibility bridge for split files that still access shared idle state as globals.
Object.defineProperties(window, {
  state: {
    configurable: true,
    get: () => state,
    set: (value) => {
      state = value;
    },
  },
  tempState: {
    configurable: true,
    get: () => tempState,
    set: (value) => {
      tempState = value;
    },
  },
  BUILDINGS: {
    configurable: true,
    get: () => BUILDINGS,
  },
  UPGRADES: {
    configurable: true,
    get: () => UPGRADES,
  },
  STORY_CHAPTERS: {
    configurable: true,
    get: () => STORY_CHAPTERS,
  },
  ACHIEVEMENTS: {
    configurable: true,
    get: () => ACHIEVEMENTS,
  },
  EVENTS: {
    configurable: true,
    get: () => EVENTS,
  },
  NEWS_MESSAGES: {
    configurable: true,
    get: () => NEWS_MESSAGES,
  },
  buyQty: {
    configurable: true,
    get: () => buyQty,
    set: (value) => {
      buyQty = value;
    },
  },
  newsIndex: {
    configurable: true,
    get: () => newsIndex,
    set: (value) => {
      newsIndex = value;
    },
  },
});

function gameTick() {
  const now = Date.now();
  const elapsed = now - lastTickTime;
  lastTickTime = now;
  tickCount++;

  if (tempState.paused && now < tempState.pauseUntil) {
    // production paused by random event
  } else {
    if (tempState.paused) tempState.paused = false;
    const lps = getLocPerSecond();
    const gained = lps * (elapsed / 1000);
    state.loc += gained;
    state.totalLoc += gained;
    state.locThisRun = (state.locThisRun || 0) + gained;
  }

  nextEventIn -= TICK_MS;
  if (nextEventIn <= 0) {
    triggerEvent();
    nextEventIn = randomEventDelay();
  }

  if (tickCount % 4 === 0) updateEventBadge();
  if (tickCount % 5 === 0) updateTopBar();
  if (tickCount % 10 === 0) checkAchievements();

  if (tickCount % 20 === 0) {
    renderBuildings();
    renderUpgrades();
  }

  newsTimer += TICK_MS;
  if (newsTimer >= 8000) {
    newsTimer = 0;
    advanceTicker();
  }

  if (now - lastSaveTime >= SAVE_INTERVAL) {
    saveGame();
    lastSaveTime = now;
  }

  if (now - lastServerSaveTime >= SERVER_SAVE_INTERVAL) {
    lastServerSaveTime = now;
    saveGameServer();
  }
}

$(async function () {
  if (window.ApiSession) {
    try {
      const token = await window.ApiSession.getCsrfToken(true);
      if (token) {
        CSRF_TOKEN = token;
      }
    } catch (error) {}
  }

  let loaded = false;
  if (typeof IS_LOGGED_IN !== 'undefined' && IS_LOGGED_IN) {
    loaded = await loadGameServer();
    if (!loaded) loaded = loadGame();
  } else {
    loaded = loadGame();
  }

  $('#tickerText').text(shuffledNews[0]);

  renderAll();
  updateOODisplay();

  $('#clickBtn').on('click', function (event) {
    handleClick(event);
    updateTopBar();
  });

  $('#prestigeBtn').on('click', doPrestige);

  initTabs();

  setTimeout(() => {
    if (!loaded) {
      showToast(
        'welcome',
        '👋 Добро пожаловать',
        'Кликай на кнопку &lt;/&gt; чтобы писать код! Нанимай сотрудников для автоматической генерации ЛОК.',
        'info',
        7000
      );
    } else {
      showToast('welcome_back', '💻 С возвращением', 'Твоя команда скучала. Продолжаем писать код!', 'info', 4000);
    }
  }, 500);

  setInterval(gameTick, TICK_MS);

  function checkMinigameReward() {
    const rewardStr = localStorage.getItem('minigame_reward');
    if (!rewardStr) return;

    try {
      const reward = JSON.parse(rewardStr);
      if (Date.now() - (reward.ts || 0) > 600000) {
        localStorage.removeItem('minigame_reward');
        return;
      }

      state.loc += reward.loc;
      state.totalLoc += reward.loc;
      if (reward.oo > 0) {
        state.prestigePoints = (state.prestigePoints || 0) + reward.oo;
        state.totalPrestigePoints = (state.totalPrestigePoints || 0) + reward.oo;
        updateOODisplay();
      }
      if (reward.cleared) {
        state.dungeonClears = (state.dungeonClears || 0) + 1;
      }

      localStorage.removeItem('minigame_reward');
      updateTopBar();
      checkAchievements();
      saveGame();
      saveGameServer();

      const ooStr = reward.oo > 0 ? ` и +${reward.oo} ОО` : '';
      const sourceLabel = reward.floorReached ? '🏰 Подземелье' : '🐛 Охота завершена';
      const sourceDesc = reward.floorReached
        ? `Этаж ${reward.floorReached}${reward.cleared ? ' — ПОБЕДА!' : ''}! +${fmt(reward.loc)} ЛОК${ooStr}`
        : `Поймал ${reward.bugs} багов! +${fmt(reward.loc)} ЛОК${ooStr}`;
      showToast('minigame', sourceLabel, sourceDesc, 'good', 5000);
    } catch (error) {
      localStorage.removeItem('minigame_reward');
    }
  }

  setTimeout(checkMinigameReward, 800);
  window.addEventListener('focus', checkMinigameReward);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (window.__DEV_RESETTING_PROGRESS) {
        return;
      }
      hiddenAt = Date.now();
      saveGame();
      return;
    }

    checkMinigameReward();

    if (hiddenAt === null) return;

    const awayMs = Date.now() - hiddenAt;
    const awaySec = awayMs / 1000;
    hiddenAt = null;
    lastTickTime = Date.now();

    const extraHours = getPrestigeShopEffect('offlineHours');
    const maxHours = 8 + extraHours;
    const cappedSec = Math.min(awaySec, maxHours * 3600);
    const lps = getLocPerSecond();
    const earned = lps * cappedSec;

    if (earned > 0 && awaySec >= 5) {
      state.loc += earned;
      state.totalLoc += earned;
      updateTopBar();
      checkAchievements();

      const timeStr = fmtTime(cappedSec);
      const locStr = fmt(earned);
      showToast(
        'away',
        '⏱️ Пока тебя не было',
        `Команда ${awaySec >= 60 ? 'не сидела сложа руки' : 'успела'}! За ${timeStr} написано <strong>+${locStr} ЛОК</strong>.`,
        'info',
        6000
      );
    }
  });

  $(document).on('keydown', function (event) {
    if (event.code === 'Space' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
      event.preventDefault();
      const btn = document.getElementById('clickBtn');
      const rect = btn.getBoundingClientRect();
      handleClick({ clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 });
      updateTopBar();
    }
  });

  let lastDisplayedLoc = 0;
  setInterval(() => {
    const currentLoc = state.loc;
    if (Math.abs(currentLoc - lastDisplayedLoc) > 0.5) {
      const el = document.getElementById('tbLoc');
      if (el) {
        el.textContent = fmt(currentLoc);
        lastDisplayedLoc = currentLoc;
      }
    }
  }, 100);

  window.addEventListener('beforeunload', () => {
    if (window.__DEV_RESETTING_PROGRESS) {
      return;
    }

    saveGame();
    if (typeof IS_LOGGED_IN !== 'undefined' && IS_LOGGED_IN) {
      const saveData = buildSaveData();
      navigator.sendBeacon(
        'ajax/save.php',
        new Blob(
          [JSON.stringify({ action: 'save', data: JSON.stringify(saveData), csrf: CSRF_TOKEN })],
          { type: 'application/json' }
        )
      );
    }
  });
});
