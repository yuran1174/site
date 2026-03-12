'use strict';

(function () {
  const activeToasts = {};

  function renderProgressTab() {
    const container = $('#progressTabContent');
    const currentChapter = STORY_CHAPTERS.filter((chapter) => state.story[chapter.id]).length;
    const nextChapter = STORY_CHAPTERS[currentChapter] || null;

    let html = '<div class="progress-section">';
    html += '<div class="progress-section-title">📖 Сюжет</div>';
    html += '<div class="progress-chapter-status">';
    html += `<span>Глава ${currentChapter} из ${STORY_CHAPTERS.length}</span>`;
    if (nextChapter) {
      html += `<span class="progress-next-ch">Следующая: <em>${nextChapter.title}</em> при ${fmt(nextChapter.requiredLoc)} ЛОК</span>`;
    } else {
      html += '<span class="progress-next-ch progress-complete">✅ Все главы прочитаны!</span>';
    }
    html += '</div>';

    const storyPct = Math.round((currentChapter / STORY_CHAPTERS.length) * 100);
    html += `<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${storyPct}%"></div></div>`;
    html += '</div>';

    const level = getAccountLevel();
    const levelTitle = getAccountLevelTitle(level);
    const req = getPrestigeRequirements();
    const locThisRun = state.locThisRun || 0;
    const locPct = Math.min(100, Math.round((locThisRun / req.locThisRun) * 100));

    html += '<div class="progress-section">';
    html += '<div class="progress-section-title">👤 Уровень аккаунта</div>';
    html += '<div class="progress-chapter-status">';
    html += `<span class="progress-lvl-badge">Ур. ${level} — ${levelTitle}</span>`;
    html += '<span class="progress-next-ch">Растёт от прогресса, престижей и достижений</span>';
    html += '</div>';
    html += '</div>';

    const buildingTypesBought = Object.keys(state.buildings).filter((id) => (state.buildings[id] || 0) > 0).length;
    const upgradesBought = getUpgradeCount(state);
    html += '<div class="progress-section">';
    html += `<div class="progress-section-title">🔄 Прогресс до Престижа ${state.prestige + 1}</div>`;
    html += '<div class="progress-chapter-status">';
    html += `<span>ЛОК за ран: ${fmt(locThisRun)} / ${fmt(req.locThisRun)} (${locPct}%)</span>`;
    html += `<span class="progress-next-ch">Зданий: ${buildingTypesBought}/${req.buildingTypes} · Улучшений: ${upgradesBought}/${req.upgrades}</span>`;
    html += '</div>';
    html += `<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${locPct}%"></div></div>`;
    html += '</div>';

    const activities = [
      { emoji: '🐛', name: 'Охота на баги', desc: 'Мини-игра: лови баги за время', unlockLabel: 'Доступно сразу', link: 'minigame.php', linkText: 'Играть', unlocked: true },
      { emoji: '📖', name: 'Сюжет', desc: 'История развития разработчика', unlockLabel: 'Доступно сразу', link: null, linkText: null, note: 'Главы появляются автоматически по мере роста', unlocked: true },
      { emoji: '🏰', name: 'Подземелье', desc: 'Рогалик в кодовой базе — 10 этажей багов', unlockLabel: 'Уровень аккаунта 5', link: 'dungeon.php', linkText: 'Войти', unlocked: level >= 5 },
      { emoji: '⚔️', name: 'PVP Арена', desc: 'Сражайся с другими разработчиками в режиме реального времени', unlockLabel: 'Престиж 3', link: state.prestige >= 3 ? 'pvp.php' : null, linkText: 'В арену', unlocked: state.prestige >= 3 },
      { emoji: '🗺️', name: 'Особые события', desc: 'Специальные события с уникальными наградами', unlockLabel: 'Престиж 5', link: null, linkText: null, note: 'Открывается на 5-м перезапуске', unlocked: state.prestige >= 5 },
    ];

    html += '<div class="progress-section">';
    html += '<div class="progress-section-title">🔓 Активности</div>';
    for (const activity of activities) {
      html += `<div class="progress-activity-card ${activity.unlocked ? 'unlocked' : 'locked'}">`;
      html += `<div class="pa-emoji">${activity.emoji}</div>`;
      html += '<div class="pa-info">';
      html += `<div class="pa-name">${activity.name}</div>`;
      html += `<div class="pa-desc">${activity.desc}</div>`;
      if (activity.note) {
        html += `<div class="pa-note">${activity.note}</div>`;
      }
      html += '</div>';
      html += '<div class="pa-status">';
      if (activity.unlocked) {
        html += '<span class="pa-open">✅ Открыто</span>';
        if (activity.link) {
          html += `<a href="${activity.link}" class="pa-btn">${activity.linkText} →</a>`;
        }
      } else {
        html += `<span class="pa-locked">🔒 ${activity.unlockLabel}</span>`;
      }
      html += '</div></div>';
    }
    html += '</div>';

    if ((state.dungeonClears || 0) > 0) {
      html += '<div class="progress-section">';
      html += '<div class="progress-section-title">🏆 Рекорды подземелья</div>';
      html += `<div class="progress-stat">Пройдено подземелий: <strong>${state.dungeonClears}</strong></div>`;
      html += '</div>';
    }

    container.html(html);
  }

  function renderActivitiesBar() {
    const bar = document.getElementById('activitiesBar');
    if (!bar) {
      return;
    }

    const level = getAccountLevel();
    const activities = [
      { emoji: '🐛', name: 'Охота на баги', desc: 'Мини-игра: лови баги за время', link: 'minigame.php', unlocked: true },
      { emoji: '🏰', name: 'Подземелье', desc: 'Рогалик: 10 этажей, боссы, лут', link: 'dungeon.php', unlocked: level >= 5, unlockHint: `Уровень аккаунта 5 (сейчас ${level})` },
      { emoji: '⚔️', name: 'PVP Арена', desc: 'Бои с другими разработчиками', link: null, unlocked: state.prestige >= 3, unlockHint: `Престиж 3 (сейчас ${state.prestige})` },
      { emoji: '🗺️', name: 'Особые события', desc: 'Случайные события с бонусами', link: null, unlocked: state.prestige >= 5, unlockHint: `Престиж 5 (сейчас ${state.prestige})` },
    ];

    let html = '<div class="act-label">// активности</div><div class="act-cards">';
    for (const activity of activities) {
      if (activity.unlocked && activity.link) {
        html += `<a href="${activity.link}" class="act-card act-unlocked">`;
      } else if (activity.unlocked) {
        html += '<div class="act-card act-unlocked act-no-link">';
      } else {
        html += `<div class="act-card act-locked" data-tooltip="Откроется: ${activity.unlockHint}">`;
      }
      html += `<span class="act-emoji">${activity.emoji}</span>`;
      html += `<div class="act-info"><span class="act-name">${activity.name}</span><span class="act-desc">${activity.desc}</span></div>`;
      if (!activity.unlocked) {
        html += '<span class="act-lock-icon">🔒</span>';
      }
      html += activity.unlocked && activity.link ? '</a>' : '</div>';
    }
    html += '</div>';
    bar.innerHTML = html;
  }

  function showToast(id, title, text, type, duration) {
    const resolvedDuration = duration || 4000;
    if (activeToasts[id]) {
      activeToasts[id].remove();
      delete activeToasts[id];
    }

    const toast = $(`
      <div class="toast toast-${type}">
        <div class="toast-body">
          <div class="toast-title">${title}</div>
          <div class="toast-text">${text}</div>
        </div>
        <div class="toast-progress"><div class="toast-progress-bar" style="animation-duration:${resolvedDuration}ms"></div></div>
      </div>
    `);

    $('#toastContainer').append(toast);
    activeToasts[id] = toast;

    setTimeout(() => {
      toast.css('animation', 'toastOut 0.3s ease forwards');
      setTimeout(() => {
        toast.remove();
        delete activeToasts[id];
      }, 300);
    }, resolvedDuration);
  }

  function shuffleArray(arr) {
    const clone = [...arr];
    for (let i = clone.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [clone[i], clone[randomIndex]] = [clone[randomIndex], clone[i]];
    }
    return clone;
  }

  const shuffledNews = shuffleArray(NEWS_MESSAGES);

  function advanceTicker() {
    const el = $('#tickerText');
    el.css('opacity', 0);
    setTimeout(() => {
      newsIndex = (newsIndex + 1) % shuffledNews.length;
      el.text(shuffledNews[newsIndex]);
      el.css('opacity', 1);
    }, 500);
  }

  function renderBuildings() {
    const container = $('#buildingsList');
    const lps = getLocPerSecond();
    let html = `
      <div class="buy-qty-row">
        <span class="buy-qty-label">Купить:</span>
        <button class="buy-qty-btn ${buyQty === 1 ? 'active' : ''}" data-qty="1">×1</button>
        <button class="buy-qty-btn ${buyQty === 10 ? 'active' : ''}" data-qty="10">×10</button>
        <button class="buy-qty-btn ${buyQty === 100 ? 'active' : ''}" data-qty="100">×100</button>
        <button class="buy-qty-btn ${buyQty === -1 ? 'active' : ''}" data-qty="-1">Макс</button>
      </div>
    `;

    for (const building of BUILDINGS) {
      if (!isBuildingUnlocked(building)) {
        continue;
      }

      const count = state.buildings[building.id] || 0;
      let displayCost = buyQty === -1 ? getBuildingCost(building, count) : getBuildingCostN(building, count, buyQty);
      let displayCostText;
      if (building.id === 'junior' && count === 0 && hasPrestigeShopItem('automator') && buyQty === 1) {
        displayCostText = 'БЕСПЛАТНО';
        displayCost = 0;
      } else {
        displayCostText = buyQty === -1 ? fmt(displayCost) + '/шт' : fmt(displayCost);
      }

      const canAfford = state.loc >= displayCost;
      const buildingCps = getBuildingCps(building) * count;
      const cpsPercent = lps > 0 ? Math.min(100, (buildingCps / lps) * 100) : 0;
      const singleCps = getBuildingCps(building);

      html += `
        <div class="building-card ${canAfford ? 'affordable' : 'cant-afford'}" data-building="${building.id}">
          <div class="b-emoji">${building.emoji}</div>
          <div class="b-info">
            <div class="b-name">${building.name}</div>
            <div class="b-desc">${building.desc}</div>
            <div class="b-stats">
              ${count > 0 ? `<span class="b-cps">${fmt(buildingCps)} ЛОК/с (${cpsPercent.toFixed(0)}%)</span>` : `<span class="b-cps">${fmt(singleCps)} ЛОК/с каждый</span>`}
            </div>
            <div class="b-cps-bar"><div class="b-cps-bar-fill" style="width:${cpsPercent}%"></div></div>
          </div>
          <div class="b-right">
            <div class="b-count">${count}</div>
            <div class="b-cost"><span class="cost-icon">💻</span>${displayCostText}</div>
            <div class="b-buy-hint">${buyQty === -1 ? 'купить макс' : 'купить ×' + buyQty}</div>
          </div>
        </div>
      `;
    }

    container.html(html);
    container.find('.buy-qty-btn').on('click', function (e) {
      e.stopPropagation();
      buyQty = parseInt($(this).data('qty'));
      renderBuildings();
    });
    container.find('.building-card').on('click', function () {
      buyBuilding($(this).data('building'));
    });
    $('#buildingCount').text(getTotalBuildings(state));
  }

  function renderUpgrades() {
    const container = $('#upgradesList');
    let html = '';
    const categories = [
      { id: 'click', label: '⌨️ Клик-улучшения' },
      { id: 'junior', label: '🐣 Джун' },
      { id: 'mid', label: '👨‍💻 Мидл' },
      { id: 'senior', label: '🧙 Сеньор' },
      { id: 'techlead', label: '📋 Тимлид' },
      { id: 'architect', label: '📐 Архитектор' },
      { id: 'devops', label: '🐳 DevOps' },
      { id: 'cto', label: '👔 CTO' },
      { id: 'global', label: '🌐 Глобальные' },
    ];

    let boughtCount = 0;
    for (const category of categories) {
      const categoryUpgrades = UPGRADES.filter((upgrade) => upgrade.category === category.id);
      if (!categoryUpgrades.length) {
        continue;
      }

      const visibleUpgrades = categoryUpgrades.filter((upgrade) => upgrade.unlockCondition(state) || state.upgrades[upgrade.id]);
      if (!visibleUpgrades.length) {
        continue;
      }

      html += `<div class="upgrade-section-header"><span>${category.label}</span></div>`;
      for (const upgrade of categoryUpgrades) {
        const bought = !!state.upgrades[upgrade.id];
        const unlocked = upgrade.unlockCondition(state);
        const canAfford = state.loc >= upgrade.cost;
        if (bought) {
          boughtCount++;
        }

        if (bought) {
          html += `
            <div class="upgrade-card bought" data-upgrade="${upgrade.id}">
              <div class="u-header">
                <div class="u-emoji">${upgrade.emoji}</div>
                <div><div class="u-name">${upgrade.name}</div><div class="u-effect">×${upgrade.effect.mult} ${upgrade.effect.type === 'click' ? 'клик' : upgrade.effect.type === 'global' ? 'все' : upgrade.name}</div></div>
              </div>
              <div class="u-bought-mark">✓</div>
            </div>
          `;
        } else if (unlocked) {
          html += `
            <div class="upgrade-card ${canAfford ? '' : 'cant-afford'}" data-upgrade="${upgrade.id}">
              <div class="u-header">
                <div class="u-emoji">${upgrade.emoji}</div>
                <div><div class="u-name">${upgrade.name}</div><div class="u-effect">×${upgrade.effect.mult} ${upgrade.effect.type === 'click' ? 'к клику' : upgrade.effect.type === 'global' ? 'ко всем' : ''}</div></div>
              </div>
              <div class="u-desc">${upgrade.desc}</div>
              <div class="u-cost">💻 ${fmt(upgrade.cost)} ЛОК</div>
            </div>
          `;
        } else {
          html += `
            <div class="upgrade-card locked">
              <div class="u-header">
                <div class="u-emoji">🔒</div>
                <div><div class="u-name">???</div><div class="u-effect">Заблокировано</div></div>
              </div>
            </div>
          `;
        }
      }
    }

    if (!html) {
      html = '<div class="empty-state"><div class="empty-state-icon">🔒</div><div class="empty-state-text">Улучшения разблокируются по мере роста команды.</div></div>';
    }

    container.html(html);
    container.find('.upgrade-card:not(.bought):not(.locked):not(.cant-afford)').on('click', function () {
      buyUpgrade($(this).data('upgrade'));
    });
    container.find('.upgrade-card.cant-afford').on('click', function () {
      const upgrade = UPGRADES.find((item) => item.id === $(this).data('upgrade'));
      if (upgrade) {
        showToast('cantafford_upg2', '💸 Мало ЛОК', 'Нужно ' + fmt(upgrade.cost) + ' ЛОК', 'bad', 2000);
      }
    });
    $('#upgradeCount').text(boughtCount);
  }

  function renderAchievements() {
    const container = $('#achievementsList');
    let html = '';
    let earned = 0;
    for (const achievement of ACHIEVEMENTS) {
      const done = !!state.achievements[achievement.id];
      if (done) {
        earned++;
      }

      if (done) {
        html += `
          <div class="achieve-card earned">
            <span class="a-emoji">${achievement.emoji}</span>
            <div class="a-name">${achievement.name}</div>
            <div class="a-desc">${achievement.desc}</div>
            <span class="a-earned-mark">⭐</span>
          </div>
        `;
      } else {
        html += `
          <div class="achieve-card locked">
            <span class="a-emoji">🔒</span>
            <div class="a-name">???</div>
            <div class="a-desc">Ещё не разблокировано</div>
          </div>
        `;
      }
    }
    container.html(html);
    $('#achieveCount').text(earned + '/' + ACHIEVEMENTS.length);
  }

  function updateOODisplay() {
    const oo = state.prestigePoints || 0;
    if (state.prestige > 0 || oo > 0) {
      $('#ooDisplay').show();
      $('#ooValue').text(oo);
    }
  }

  function updateTopBar() {
    const lps = getLocPerSecond();
    const lpc = getLocPerClick();
    $('#tbLoc').text(fmt(state.loc));
    $('#tbLps').text(fmt(lps));
    $('#tbTotal').text(fmt(state.totalLoc));
    $('#lpcDisplay').text(fmt(lpc));

    if (state.prestige > 0) {
      $('#prestigeInfo').show();
      $('#tbPrestige').text(state.prestige);
      $('#tbPrestigeMulti').text(state.prestigeMulti.toFixed(2));
      updateOODisplay();
    }

    const req = getPrestigeRequirements();
    const locThisRun = state.locThisRun || 0;
    const buildingTypesBought = Object.keys(state.buildings).filter((id) => (state.buildings[id] || 0) > 0).length;
    const upgradesBought = getUpgradeCount(state);
    const canPrestige = locThisRun >= req.locThisRun
      && buildingTypesBought >= req.buildingTypes
      && upgradesBought >= req.upgrades;
    const showHint = locThisRun >= req.locThisRun * 0.1 || canPrestige;

    if (canPrestige) {
      $('#prestigeBtn').show();
      $('#prestigeHint').hide();
    } else if (showHint) {
      $('#prestigeBtn').hide();
      const locLeft = Math.max(0, req.locThisRun - locThisRun);
      const btLeft = Math.max(0, req.buildingTypes - buildingTypesBought);
      const upgLeft = Math.max(0, req.upgrades - upgradesBought);
      const parts = [];
      if (locLeft > 0) {
        parts.push(`${fmt(locLeft)} ЛОК`);
      }
      if (btLeft > 0) {
        parts.push(`${btLeft} тип${btLeft === 1 ? '' : 'а'} зданий`);
      }
      if (upgLeft > 0) {
        parts.push(`${upgLeft} улучшен${upgLeft === 1 ? 'ие' : 'ий'}`);
      }
      $('#prestigeHint').show().text(`До перезапуска ${state.prestige + 1}: ` + (parts.join(', ') || 'готово!'));
    } else {
      $('#prestigeBtn').hide();
      $('#prestigeHint').hide();
    }

    const level = getAccountLevel();
    const title = getAccountLevelTitle(level);
    $('#accountLevelBadge').text(`Ур. ${level} · ${title}`);
    $('#statClicks').text(fmt(state.totalClicks));
    $('#statEvents').text(state.eventCount);
    $('#statPrestige').text(state.prestige);
  }

  function renderAll() {
    renderBuildings();
    renderUpgrades();
    renderAchievements();
    renderProgressTab();
    renderActivitiesBar();
    updateTopBar();
  }

  function initTabs() {
    $('#shopTabs').on('click', '.tab-btn', function () {
      const tabId = $(this).data('tab');
      $('.tab-btn').removeClass('active');
      $(this).addClass('active');
      $('.tab-content').hide();
      $('#tab-' + tabId).show();
      if (tabId === 'progress') {
        renderProgressTab();
      }
    });
  }

  window.IdleRender = {
    renderProgressTab: renderProgressTab,
    renderActivitiesBar: renderActivitiesBar,
    showToast: showToast,
    shuffledNews: shuffledNews,
    advanceTicker: advanceTicker,
    renderBuildings: renderBuildings,
    renderUpgrades: renderUpgrades,
    renderAchievements: renderAchievements,
    updateOODisplay: updateOODisplay,
    updateTopBar: updateTopBar,
    renderAll: renderAll,
    initTabs: initTabs,
  };
}());
