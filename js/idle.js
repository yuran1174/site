/* ================================================
   КОД И КОФЕ — Idle Game Logic
   Full game implementation
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
  getTotalBuildings,
  getUpgradeCount,
  getBuildingCost,
  getBuildingCostN,
  getClickMultiplier,
  getBuildingCps,
  getLocPerSecond,
  getLocPerClick,
  randomEventDelay,
  getPrestigeRequirements,
  getAccountLevel,
  getAccountLevelTitle,
  getPrestigeShopEffect,
  hasPrestigeShopItem,
  applyPrestigeShopEffects,
  isBuildingUnlocked,
} = window.IdleEconomy;

const {
  buildSaveData,
  saveGame,
  saveGameServer,
  applyLoadedData,
  applyOfflineProgress,
  loadGame,
  loadGameServer,
} = window.IdleSave;

const {
  renderProgressTab,
  renderActivitiesBar,
  showToast,
  shuffledNews,
  advanceTicker,
  renderBuildings,
  renderUpgrades,
  renderAchievements,
  updateOODisplay,
  updateTopBar,
  renderAll,
  initTabs,
} = window.IdleRender;

// ================================================
// GAME DATA DEFINITIONS
// ================================================

const RAW_GAME_DATA = window.IdleGameData || {};

function matchesRule(rule, s) {
  if (!rule) {
    return true;
  }

  switch (rule.type) {
    case 'totalLocAtLeast':
      return (s.totalLoc || 0) >= rule.value;
    case 'totalClicksAtLeast':
      return (s.totalClicks || 0) >= rule.value;
    case 'buildingCountAtLeast':
      return ((s.buildings || {})[rule.buildingId] || 0) >= rule.value;
    case 'totalBuildingsAtLeast':
      return getTotalBuildings(s) >= rule.value;
    case 'prestigeAtLeast':
      return (s.prestige || 0) >= rule.value;
    case 'upgradeCountAtLeast':
      return getUpgradeCount(s) >= rule.value;
    case 'locPerSecondAtLeast':
      return getLocPerSecond() >= rule.value;
    case 'eventCountAtLeast':
      return (s.eventCount || 0) >= rule.value;
    case 'maxOfflineAtLeast':
      return (s.maxOffline || 0) >= rule.value;
    case 'storyUnlocked':
      return !!(s.story && s.story[rule.chapterId]);
    case 'storyAllChapters':
      return STORY_CHAPTERS.every((chapter) => s.story && s.story[chapter.id]);
    case 'dungeonClearsAtLeast':
      return (s.dungeonClears || 0) >= rule.value;
    case 'locThisRunAtLeast':
      return (s.locThisRun || 0) >= rule.value;
    case 'accountLevelAtLeast':
      return getAccountLevel() >= rule.value;
    case 'prestigeShopTotalLevelsAtLeast':
      return Object.values(s.prestigeShop || {}).reduce((sum, value) => sum + value, 0) >= rule.value;
    case 'prestigeShopUniqueItemsAtLeast':
      return Object.keys(s.prestigeShop || {}).length >= rule.value;
    case 'allBaseBuildingsOwned':
      return BUILDINGS.filter((building) => !building.requiresShop).every((building) => ((s.buildings || {})[building.id] || 0) >= 1);
    default:
      return false;
  }
}

function buildEffect(effectRule) {
  if (!effectRule) {
    return undefined;
  }

  switch (effectRule.type) {
    case 'multiplyLoc':
      return (s) => {
        s.loc = Math.floor(s.loc * effectRule.value);
      };
    case 'subtractLocFlat':
      return (s) => {
        s.loc = Math.max(0, s.loc - effectRule.value);
      };
    default:
      return undefined;
  }
}

const BUILDINGS = RAW_GAME_DATA.buildings || [];
const UPGRADES = (RAW_GAME_DATA.upgrades || []).map((upgrade) => ({
  ...upgrade,
  unlockCondition: (s) => matchesRule(upgrade.unlockRule, s),
}));
const STORY_CHAPTERS = RAW_GAME_DATA.storyChapters || [];
const ACHIEVEMENTS = (RAW_GAME_DATA.achievements || []).map((achievement) => ({
  ...achievement,
  condition: (s) => matchesRule(achievement.rule, s),
}));
const EVENTS = (RAW_GAME_DATA.events || []).map((gameEvent) => ({
  ...gameEvent,
  condition: gameEvent.rule ? (s) => matchesRule(gameEvent.rule, s) : undefined,
  effect: buildEffect(gameEvent.effectRule),
}));
const NEWS_MESSAGES = RAW_GAME_DATA.newsMessages || [];

// ================================================
// GAME STATE
// ================================================

let state = createInitialState();
let tempState = createInitialTempState();

let tickCount = 0;
let nextEventIn = randomEventDelay();
let buyQty = 1;
let newsIndex = 0;
let newsTimer = 0;
let lastSaveTime       = Date.now();
let lastServerSaveTime = Date.now();
let lastTickTime       = Date.now();
let hiddenAt           = null;

// ================================================
// EVENTS
// ================================================

function triggerEvent() {
  let eligible = EVENTS.filter(e => !e.condition || e.condition(state));
  if (!eligible.length) return;

  // Apply event_luck: reduce bad events
  const luckReduction = getPrestigeShopEffect('eventLuckMult'); // 0..0.5
  if (luckReduction > 0) {
    const rand = Math.random();
    if (rand < luckReduction) {
      // Re-roll but only good/neutral events
      const good = eligible.filter(e => e.type !== 'bad');
      if (good.length > 0) eligible = good;
    }
  }

  const ev = eligible[Math.floor(Math.random() * eligible.length)];

  state.eventCount++;

  // Show toast
  const toastType = ev.type === 'good' ? 'good' : ev.type === 'bad' ? 'bad' : 'neutral';
  showToast('event_' + ev.id, ev.emoji + ' ' + ev.name, ev.text, toastType, 5000);

  // Apply immediate effects
  if (ev.effect) ev.effect(state);

  // Apply temp effects
  if (ev.pause) {
    tempState.paused = true;
    tempState.pauseUntil = Date.now() + ev.pause;
    setTimeout(() => { tempState.paused = false; }, ev.pause);
  }

  if (ev.tempMulti && ev.tempDuration) {
    tempState.globalMult = ev.tempMulti;
    tempState.activeEvent = ev;
    tempState.activeEventUntil = Date.now() + ev.tempDuration;
    setTimeout(() => {
      tempState.globalMult = 1;
      tempState.activeEvent = null;
    }, ev.tempDuration);
  }

  if (ev.tempClickMult && ev.tempDuration) {
    tempState.clickMult = ev.tempClickMult;
    tempState.activeEvent = ev;
    tempState.activeEventUntil = Date.now() + ev.tempDuration;
    setTimeout(() => {
      tempState.clickMult = 1;
      if (tempState.activeEvent === ev) tempState.activeEvent = null;
    }, ev.tempDuration);
  }

  if (ev.tempBuildingMult && ev.tempDuration) {
    Object.assign(tempState.buildingMult, ev.tempBuildingMult);
    tempState.activeEvent = ev;
    tempState.activeEventUntil = Date.now() + ev.tempDuration;
    setTimeout(() => {
      for (const k of Object.keys(ev.tempBuildingMult)) {
        delete tempState.buildingMult[k];
      }
      if (tempState.activeEvent === ev) tempState.activeEvent = null;
    }, ev.tempDuration);
  }

  // Update event badge
  updateEventBadge();
}

function updateEventBadge() {
  if (tempState.activeEvent) {
    $('#eventBadge').text(tempState.activeEvent.emoji + ' ' + tempState.activeEvent.name).show();
  } else {
    $('#eventBadge').hide();
  }
}

// ================================================
// PRESTIGE
// ================================================

function doPrestige() {
  const req     = getPrestigeRequirements();
  const _btypes = Object.keys(state.buildings).filter(k => (state.buildings[k]||0) > 0).length;
  const _upgc   = getUpgradeCount(state);
  const _ltr    = state.locThisRun || 0;
  if (_ltr < req.locThisRun || _btypes < req.buildingTypes || _upgc < req.upgrades) return;
  if (!confirm(
    `Переписать с нуля? (Престиж ${state.prestige + 1})\n` +
    `За этот ран: ${fmt(_ltr)} ЛОК\n\n` +
    `Ты теряешь всех сотрудников и улучшения, но получаешь постоянный бонус ×1.5 к производительности.\n` +
    `Достижения, прогресс и Очки Опыта сохраняются.`
  )) return;

  const overlay = $('#prestigeOverlay').show();
  const bar = $('#pmBar');
  const statusEl = $('#pmStatus');

  const messages = [
    'git reset --hard HEAD~∞',
    'rm -rf node_modules',
    'Deleting technical debt...',
    'Refactoring everything...',
    'npm install (это займёт время)',
    'Запуск чистого проекта...',
    'DONE. Всё теперь правильно.',
  ];

  let progress = 0;
  let msgIdx = 0;

  const interval = setInterval(() => {
    progress += 2;
    bar.css('width', progress + '%');
    if (progress % 15 === 0 && msgIdx < messages.length - 1) {
      msgIdx++;
      statusEl.text(messages[msgIdx]);
    }
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        // Award OO: max(1, floor(log10(totalLoc+1)) - 4)
        const ooEarned = Math.max(1, Math.floor(Math.log10(state.totalLoc + 1)) - 4);

        // Apply prestige
        state.prestige++;
        state.prestigeMulti *= 1.5;
        state.prestigePoints      = (state.prestigePoints || 0) + ooEarned;
        state.totalPrestigePoints = (state.totalPrestigePoints || 0) + ooEarned;
        state.loc        = 0;
        state.locThisRun = 0;
        state.buildings  = {};
        state.upgrades   = {};
        // Keep achievements, totalLoc, prestige stats, prestigeShop

        // Apply shop bonuses for new run
        applyPrestigeShopEffects();

        overlay.hide();
        renderAll();
        updateOODisplay();
        showToast('prestige_done', '✨ Престиж ' + state.prestige,
          `Перезапуск завершён! +${ooEarned} Очков Опыта! Бонус: ×${state.prestigeMulti.toFixed(2)}`,
          'prestige', 8000);
        saveGame();
        if (typeof IS_LOGGED_IN !== 'undefined' && IS_LOGGED_IN) saveGameServer();
      }, 500);
    }
  }, 50);
}

// ================================================
// BUYING BUILDINGS
// ================================================

function buyBuilding(buildingId) {
  const b = BUILDINGS.find(x => x.id === buildingId);
  if (!b) return;
  if (!isBuildingUnlocked(b)) return;

  const currentCount = state.buildings[buildingId] || 0;
  let qty = buyQty;
  if (buyQty === -1) {
    // Buy max
    qty = 0;
    let tempLoc = state.loc;
    let tempCount = currentCount;
    while (true) {
      const cost = getBuildingCost(b, tempCount);
      if (tempLoc < cost) break;
      tempLoc -= cost;
      tempCount++;
      qty++;
      if (qty >= 1000) break; // safety
    }
    if (qty === 0) {
      showToast('cantafford', '💸 Мало ЛОК', 'Не хватает средств для покупки ' + b.name, 'bad', 2000);
      return;
    }
  }

  // Automator: first junior is free
  let totalCost = getBuildingCostN(b, currentCount, qty);
  if (buildingId === 'junior' && currentCount === 0 && hasPrestigeShopItem('automator') && qty === 1) {
    totalCost = 0;
  }

  if (state.loc < totalCost) {
    showToast('cantafford', '💸 Мало ЛОК', 'Нужно ещё ' + fmt(totalCost - state.loc) + ' ЛОК', 'bad', 2000);
    return;
  }

  state.loc -= totalCost;
  state.buildings[buildingId] = currentCount + qty;

  const msg = qty > 1 ? `Нанято ${qty}×${b.emoji} ${b.name}` : `Нанят ${b.emoji} ${b.name}`;
  showToast('buy_' + buildingId, msg, b.desc, 'info', 2500);

  // Trigger re-render
  renderBuildings();
  renderUpgrades();
  updateTopBar();
}

function buyUpgrade(upgradeId) {
  const upg = UPGRADES.find(x => x.id === upgradeId);
  if (!upg) return;
  if (state.upgrades[upgradeId]) return;
  if (state.loc < upg.cost) {
    showToast('cantafford_upg', '💸 Мало ЛОК', 'Нужно ' + fmt(upg.cost) + ' ЛОК', 'bad', 2000);
    return;
  }

  state.loc -= upg.cost;
  state.upgrades[upgradeId] = true;

  showToast('upg_' + upgradeId, '✅ ' + upg.name, 'Улучшение применено: ' + upg.emoji, 'good', 3000);
  renderUpgrades();
  renderBuildings();
  updateTopBar();
}

// ================================================
// CLICK HANDLER
// ================================================

function handleClick(event) {
  if (tempState.paused) return;

  const lpc = getLocPerClick();
  state.loc         += lpc;
  state.totalLoc    += lpc;
  state.locThisRun   = (state.locThisRun || 0) + lpc;
  state.totalClicks++;

  // Spawn floating number
  spawnFloatNum('+' + fmt(lpc) + ' ЛОК', event.clientX, event.clientY);

  // Button animation
  const btn = $('#clickBtn');
  btn.addClass('clicking');
  setTimeout(() => btn.removeClass('clicking'), 80);
}

function spawnFloatNum(text, x, y) {
  const el = document.createElement('div');
  el.className = 'float-num';
  el.textContent = text;
  el.style.left = (x - 30) + 'px';
  el.style.top  = (y - 20) + 'px';
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// ================================================
// ACHIEVEMENT CHECKS
// ================================================

function checkAchievements() {
  checkStoryProgress();
  let newAchieve = false;
  for (const ach of ACHIEVEMENTS) {
    if (state.achievements[ach.id]) continue;
    try {
      if (ach.condition(state)) {
        state.achievements[ach.id] = true;
        newAchieve = true;
        showToast('ach_' + ach.id, '🏆 ' + ach.name, ach.desc, 'achievement', 5000);
        // Blink achievements tab
        const countEl = $('#achieveCount');
        countEl.addClass('pulse-yellow');
        setTimeout(() => countEl.removeClass('pulse-yellow'), 500);
      }
    } catch(e) {}
  }
  if (newAchieve) renderAchievements();
}

// ================================================
// STORY PROGRESS
// ================================================

function checkStoryProgress() {
  for (const ch of STORY_CHAPTERS) {
    if (!state.story[ch.id] && state.totalLoc >= ch.requiredLoc) {
      state.story[ch.id] = true;
      showToast('story_' + ch.id, ch.emoji + ' ' + ch.title, ch.text, 'story', 10000);
    }
  }
}

// ================================================
// PROGRESS TAB RENDER
// ================================================

// ================================================
// MAIN TICK LOOP
// ================================================

function gameTick() {
  const now     = Date.now();
  const elapsed = now - lastTickTime; // реальные мс с прошлого тика
  lastTickTime  = now;
  tickCount++;

  // Check pause
  if (tempState.paused && now < tempState.pauseUntil) {
    // Skip production
  } else {
    if (tempState.paused) tempState.paused = false;
    // Считаем по реальному прошедшему времени — работает и в фоне
    const lps    = getLocPerSecond();
    const gained = lps * (elapsed / 1000);
    state.loc         += gained;
    state.totalLoc    += gained;
    state.locThisRun   = (state.locThisRun || 0) + gained;
  }

  // Check event timer
  nextEventIn -= TICK_MS;
  if (nextEventIn <= 0) {
    triggerEvent();
    nextEventIn = randomEventDelay();
  }

  // Update event badge
  if (tickCount % 4 === 0) updateEventBadge();

  // Update displays every 5 ticks (4x/sec)
  if (tickCount % 5 === 0) {
    updateTopBar();
  }

  // Check achievements every 10 ticks
  if (tickCount % 10 === 0) {
    checkAchievements();
  }

  // Refresh shop affordability every 20 ticks (1x/sec)
  if (tickCount % 20 === 0) {
    renderBuildings();
    renderUpgrades();
  }

  // News ticker every ~8 seconds
  newsTimer += TICK_MS;
  if (newsTimer >= 8000) {
    newsTimer = 0;
    advanceTicker();
  }

  // Auto-save every SAVE_INTERVAL
  if (now - lastSaveTime >= SAVE_INTERVAL) {
    saveGame();
    lastSaveTime = now;
  }

  // Server save every SERVER_SAVE_INTERVAL
  if (now - lastServerSaveTime >= SERVER_SAVE_INTERVAL) {
    lastServerSaveTime = now;
    saveGameServer();
  }
}

// ================================================
// INIT
// ================================================

$(async function() {

  // Try to load from server first, fallback to localStorage
  let loaded = false;
  if (typeof IS_LOGGED_IN !== 'undefined' && IS_LOGGED_IN) {
    loaded = await loadGameServer();
    if (!loaded) loaded = loadGame();
  } else {
    loaded = loadGame();
  }

  // Init ticker
  $('#tickerText').text(shuffledNews[0]);

  // Render everything
  renderAll();
  updateOODisplay();

  // Bind click button
  $('#clickBtn').on('click', function(e) {
    handleClick(e);
    updateTopBar();
  });

  // Bind prestige button
  $('#prestigeBtn').on('click', doPrestige);

  // Init tabs
  initTabs();

  // Show greeting toast after a small delay
  setTimeout(() => {
    if (!loaded) {
      showToast('welcome', '👋 Добро пожаловать', 'Кликай на кнопку &lt;/&gt; чтобы писать код! Нанимай сотрудников для автоматической генерации ЛОК.', 'info', 7000);
    } else {
      showToast('welcome_back', '💻 С возвращением', 'Твоя команда скучала. Продолжаем писать код!', 'info', 4000);
    }
  }, 500);

  // Start game loop
  setInterval(gameTick, TICK_MS);

  // Mini-game reward integration — check on focus
  function checkMinigameReward() {
    const rewardStr = localStorage.getItem('minigame_reward');
    if (!rewardStr) return;
    try {
      const r = JSON.parse(rewardStr);
      // Only apply if reward is recent (within 10 minutes)
      if (Date.now() - (r.ts || 0) > 600000) {
        localStorage.removeItem('minigame_reward');
        return;
      }
      state.loc      += r.loc;
      state.totalLoc += r.loc;
      if (r.oo > 0) {
        state.prestigePoints      = (state.prestigePoints || 0) + r.oo;
        state.totalPrestigePoints = (state.totalPrestigePoints || 0) + r.oo;
        updateOODisplay();
      }
      // Dungeon clear tracking
      if (r.cleared) {
        state.dungeonClears = (state.dungeonClears || 0) + 1;
      }
      localStorage.removeItem('minigame_reward');
      updateTopBar();
      checkAchievements();
      saveGame();
      saveGameServer();
      const ooStr = r.oo > 0 ? ` и +${r.oo} ОО` : '';
      const sourceLabel = r.floorReached ? `🏰 Подземелье` : `🐛 Охота завершена`;
      const sourceDesc  = r.floorReached
        ? `Этаж ${r.floorReached}${r.cleared ? ' — ПОБЕДА!' : ''}! +${fmt(r.loc)} ЛОК${ooStr}`
        : `Поймал ${r.bugs} багов! +${fmt(r.loc)} ЛОК${ooStr}`;
      showToast('minigame', sourceLabel, sourceDesc, 'good', 5000);
    } catch(e) {
      localStorage.removeItem('minigame_reward');
    }
  }

  // Check on page load
  setTimeout(checkMinigameReward, 800);

  // Check when window gains focus
  window.addEventListener('focus', checkMinigameReward);

  // Page Visibility API — начисляем прогресс при возврате на вкладку
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      // Вкладка свёрнута — запоминаем момент
      hiddenAt = Date.now();
      saveGame(); // сохраняем перед уходом
    } else {
      // Вернулись — считаем сколько прошло
      checkMinigameReward();

      if (hiddenAt !== null) {
        const awayMs  = Date.now() - hiddenAt;
        const awaySec = awayMs / 1000;
        hiddenAt = null;

        // Сбрасываем lastTickTime чтобы следующий тик не посчитал двойное время
        lastTickTime = Date.now();

        // Extra offline hours from prestige shop
        const extraHours = getPrestigeShopEffect('offlineHours');
        const maxHours   = 8 + extraHours;

        // Начисляем заработанное
        const cappedSec = Math.min(awaySec, maxHours * 3600);
        const lps       = getLocPerSecond();
        const earned    = lps * cappedSec;

        if (earned > 0 && awaySec >= 5) {
          state.loc      += earned;
          state.totalLoc += earned;
          updateTopBar();
          checkAchievements();

          const timeStr = fmtTime(cappedSec);
          const locStr  = fmt(earned);
          showToast('away', '⏱️ Пока тебя не было',
            `Команда ${awaySec >= 60 ? 'не сидела сложа руки' : 'успела'}! За ${timeStr} написано <strong>+${locStr} ЛОК</strong>.`,
            'info', 6000);
        }
      }
    }
  });

  // Keyboard shortcut: Space = click
  $(document).on('keydown', function(e) {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      const btn = document.getElementById('clickBtn');
      const rect = btn.getBoundingClientRect();
      handleClick({ clientX: rect.left + rect.width/2, clientY: rect.top + rect.height/2 });
      updateTopBar();
    }
  });

  // Animate topbar loc on change
  let lastDisplayedLoc = 0;
  setInterval(() => {
    const cur = state.loc;
    if (Math.abs(cur - lastDisplayedLoc) > 0.5) {
      const el = document.getElementById('tbLoc');
      if (el) {
        el.textContent = fmt(cur);
        lastDisplayedLoc = cur;
      }
    }
  }, 100);

  // Save on tab/browser close
  window.addEventListener('beforeunload', () => {
    saveGame();
    if (typeof IS_LOGGED_IN !== 'undefined' && IS_LOGGED_IN) {
      // sendBeacon — не блокирует закрытие, но гарантирует доставку
      const saveData = buildSaveData();
      navigator.sendBeacon('ajax/save.php', new Blob(
        [JSON.stringify({ action: 'save', data: JSON.stringify(saveData), csrf: CSRF_TOKEN })],
        { type: 'application/json' }
      ));
    }
  });

});
