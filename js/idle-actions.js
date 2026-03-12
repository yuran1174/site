'use strict';

(() => {
  function triggerEvent() {
    let eligible = EVENTS.filter((eventItem) => !eventItem.condition || eventItem.condition(state));
    if (!eligible.length) return;

    const luckReduction = getPrestigeShopEffect('eventLuckMult');
    if (luckReduction > 0) {
      const rand = Math.random();
      if (rand < luckReduction) {
        const good = eligible.filter((eventItem) => eventItem.type !== 'bad');
        if (good.length > 0) eligible = good;
      }
    }

    const eventItem = eligible[Math.floor(Math.random() * eligible.length)];

    state.eventCount++;

    const toastType = eventItem.type === 'good' ? 'good' : eventItem.type === 'bad' ? 'bad' : 'neutral';
    showToast('event_' + eventItem.id, eventItem.emoji + ' ' + eventItem.name, eventItem.text, toastType, 5000);

    if (eventItem.effect) eventItem.effect(state);

    if (eventItem.pause) {
      tempState.paused = true;
      tempState.pauseUntil = Date.now() + eventItem.pause;
      setTimeout(() => {
        tempState.paused = false;
      }, eventItem.pause);
    }

    if (eventItem.tempMulti && eventItem.tempDuration) {
      tempState.globalMult = eventItem.tempMulti;
      tempState.activeEvent = eventItem;
      tempState.activeEventUntil = Date.now() + eventItem.tempDuration;
      setTimeout(() => {
        tempState.globalMult = 1;
        tempState.activeEvent = null;
      }, eventItem.tempDuration);
    }

    if (eventItem.tempClickMult && eventItem.tempDuration) {
      tempState.clickMult = eventItem.tempClickMult;
      tempState.activeEvent = eventItem;
      tempState.activeEventUntil = Date.now() + eventItem.tempDuration;
      setTimeout(() => {
        tempState.clickMult = 1;
        if (tempState.activeEvent === eventItem) tempState.activeEvent = null;
      }, eventItem.tempDuration);
    }

    if (eventItem.tempBuildingMult && eventItem.tempDuration) {
      Object.assign(tempState.buildingMult, eventItem.tempBuildingMult);
      tempState.activeEvent = eventItem;
      tempState.activeEventUntil = Date.now() + eventItem.tempDuration;
      setTimeout(() => {
        for (const key of Object.keys(eventItem.tempBuildingMult)) {
          delete tempState.buildingMult[key];
        }
        if (tempState.activeEvent === eventItem) tempState.activeEvent = null;
      }, eventItem.tempDuration);
    }

    updateEventBadge();
  }

  function updateEventBadge() {
    if (tempState.activeEvent) {
      $('#eventBadge').text(tempState.activeEvent.emoji + ' ' + tempState.activeEvent.name).show();
    } else {
      $('#eventBadge').hide();
    }
  }

  function doPrestige() {
    const req = getPrestigeRequirements();
    const buildingTypes = Object.keys(state.buildings).filter((key) => (state.buildings[key] || 0) > 0).length;
    const upgradeCount = getUpgradeCount(state);
    const locThisRun = state.locThisRun || 0;
    if (locThisRun < req.locThisRun || buildingTypes < req.buildingTypes || upgradeCount < req.upgrades) return;
    if (!confirm(
      `Переписать с нуля? (Престиж ${state.prestige + 1})\n` +
      `За этот ран: ${fmt(locThisRun)} ЛОК\n\n` +
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
          const ooEarned = Math.max(1, Math.floor(Math.log10(state.totalLoc + 1)) - 4);

          state.prestige++;
          state.prestigeMulti *= 1.5;
          state.prestigePoints = (state.prestigePoints || 0) + ooEarned;
          state.totalPrestigePoints = (state.totalPrestigePoints || 0) + ooEarned;
          state.loc = 0;
          state.locThisRun = 0;
          state.buildings = {};
          state.upgrades = {};

          applyPrestigeShopEffects();

          overlay.hide();
          renderAll();
          updateOODisplay();
          showToast(
            'prestige_done',
            '✨ Престиж ' + state.prestige,
            `Перезапуск завершён! +${ooEarned} Очков Опыта! Бонус: ×${state.prestigeMulti.toFixed(2)}`,
            'prestige',
            8000
          );
          saveGame();
          if (typeof IS_LOGGED_IN !== 'undefined' && IS_LOGGED_IN) saveGameServer();
        }, 500);
      }
    }, 50);
  }

  function buyBuilding(buildingId) {
    const building = BUILDINGS.find((item) => item.id === buildingId);
    if (!building) return;
    if (!isBuildingUnlocked(building)) return;

    const currentCount = state.buildings[buildingId] || 0;
    let qty = buyQty;
    if (buyQty === -1) {
      qty = 0;
      let tempLoc = state.loc;
      let tempCount = currentCount;
      while (true) {
        const cost = getBuildingCost(building, tempCount);
        if (tempLoc < cost) break;
        tempLoc -= cost;
        tempCount++;
        qty++;
        if (qty >= 1000) break;
      }
      if (qty === 0) {
        showToast('cantafford', '💸 Мало ЛОК', 'Не хватает средств для покупки ' + building.name, 'bad', 2000);
        return;
      }
    }

    let totalCost = getBuildingCostN(building, currentCount, qty);
    if (buildingId === 'junior' && currentCount === 0 && hasPrestigeShopItem('automator') && qty === 1) {
      totalCost = 0;
    }

    if (state.loc < totalCost) {
      showToast('cantafford', '💸 Мало ЛОК', 'Нужно ещё ' + fmt(totalCost - state.loc) + ' ЛОК', 'bad', 2000);
      return;
    }

    state.loc -= totalCost;
    state.buildings[buildingId] = currentCount + qty;

    const message = qty > 1
      ? `Нанято ${qty}×${building.emoji} ${building.name}`
      : `Нанят ${building.emoji} ${building.name}`;
    showToast('buy_' + buildingId, message, building.desc, 'info', 2500);

    renderBuildings();
    renderUpgrades();
    updateTopBar();
  }

  function buyUpgrade(upgradeId) {
    const upgrade = UPGRADES.find((item) => item.id === upgradeId);
    if (!upgrade) return;
    if (state.upgrades[upgradeId]) return;
    if (state.loc < upgrade.cost) {
      showToast('cantafford_upg', '💸 Мало ЛОК', 'Нужно ' + fmt(upgrade.cost) + ' ЛОК', 'bad', 2000);
      return;
    }

    state.loc -= upgrade.cost;
    state.upgrades[upgradeId] = true;

    showToast('upg_' + upgradeId, '✅ ' + upgrade.name, 'Улучшение применено: ' + upgrade.emoji, 'good', 3000);
    renderUpgrades();
    renderBuildings();
    updateTopBar();
  }

  function handleClick(event) {
    if (tempState.paused) return;

    const locPerClick = getLocPerClick();
    state.loc += locPerClick;
    state.totalLoc += locPerClick;
    state.locThisRun = (state.locThisRun || 0) + locPerClick;
    state.totalClicks++;

    spawnFloatNum('+' + fmt(locPerClick) + ' ЛОК', event.clientX, event.clientY);

    const btn = $('#clickBtn');
    btn.addClass('clicking');
    setTimeout(() => btn.removeClass('clicking'), 80);
  }

  function spawnFloatNum(text, x, y) {
    const el = document.createElement('div');
    el.className = 'float-num';
    el.textContent = text;
    el.style.left = (x - 30) + 'px';
    el.style.top = (y - 20) + 'px';
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  function checkAchievements() {
    checkStoryProgress();
    let newAchieve = false;
    for (const achievement of ACHIEVEMENTS) {
      if (state.achievements[achievement.id]) continue;
      try {
        if (achievement.condition(state)) {
          state.achievements[achievement.id] = true;
          newAchieve = true;
          showToast('ach_' + achievement.id, '🏆 ' + achievement.name, achievement.desc, 'achievement', 5000);
          const countEl = $('#achieveCount');
          countEl.addClass('pulse-yellow');
          setTimeout(() => countEl.removeClass('pulse-yellow'), 500);
        }
      } catch (e) {}
    }
    if (newAchieve) renderAchievements();
  }

  function checkStoryProgress() {
    for (const chapter of STORY_CHAPTERS) {
      if (!state.story[chapter.id] && state.totalLoc >= chapter.requiredLoc) {
        state.story[chapter.id] = true;
        showToast('story_' + chapter.id, chapter.emoji + ' ' + chapter.title, chapter.text, 'story', 10000);
      }
    }
  }

  window.IdleActions = {
    triggerEvent,
    updateEventBadge,
    doPrestige,
    buyBuilding,
    buyUpgrade,
    handleClick,
    spawnFloatNum,
    checkAchievements,
    checkStoryProgress,
  };

  Object.assign(window, {
    doPrestige,
    buyBuilding,
    buyUpgrade,
    handleClick,
  });
})();
