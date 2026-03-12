'use strict';

(function () {
  function mergePrestigeShop(serverShop, localShop) {
    const merged = Object.assign({}, serverShop || {});

    for (const [itemId, level] of Object.entries(localShop || {})) {
      const safeLevel = Math.max(0, parseInt(level, 10) || 0);
      if (safeLevel <= 0) {
        continue;
      }
      merged[itemId] = Math.max(parseInt(merged[itemId] || 0, 10), safeLevel);
    }

    return merged;
  }

  function buildSaveData() {
    return {
      loc: state.loc,
      totalLoc: state.totalLoc,
      locThisRun: state.locThisRun || 0,
      totalClicks: state.totalClicks,
      buildings: state.buildings,
      upgrades: state.upgrades,
      achievements: state.achievements,
      prestige: state.prestige,
      prestigeMulti: state.prestigeMulti,
      prestigePoints: state.prestigePoints || 0,
      totalPrestigePoints: state.totalPrestigePoints || 0,
      prestigeShop: state.prestigeShop || {},
      eventCount: state.eventCount,
      maxOffline: state.maxOffline,
      story: state.story || {},
      dungeonClears: state.dungeonClears || 0,
      lastSave: Date.now(),
      version: state.version,
    };
  }

  function saveGame() {
    if (window.__DEV_RESETTING_PROGRESS) {
      return;
    }

    const saveData = buildSaveData();
    try {
      localStorage.setItem('kodikofee_save', JSON.stringify(saveData));
    } catch (e) {
      console.warn('Local save failed:', e);
    }
  }

  async function saveGameServer() {
    if (typeof IS_LOGGED_IN === 'undefined' || !IS_LOGGED_IN) {
      return;
    }
    if (window.__DEV_RESETTING_PROGRESS) {
      return;
    }

    const saveData = buildSaveData();
    try {
      const res = await fetch('ajax/save.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', data: JSON.stringify(saveData), csrf: CSRF_TOKEN }),
      });
      await res.json();
    } catch (e) {
      // Silent fail: local save remains the fallback source.
    }
  }

  function applyLoadedData(data) {
    state.loc = data.loc || 0;
    state.totalLoc = data.totalLoc || 0;
    state.locThisRun = data.locThisRun || 0;
    state.totalClicks = data.totalClicks || 0;
    state.buildings = data.buildings || {};
    state.upgrades = data.upgrades || {};
    state.achievements = data.achievements || {};
    state.prestige = data.prestige || 0;
    state.prestigeMulti = data.prestigeMulti || 1;
    state.prestigePoints = data.prestigePoints || 0;
    state.totalPrestigePoints = data.totalPrestigePoints || 0;
    state.prestigeShop = data.prestigeShop || {};
    state.eventCount = data.eventCount || 0;
    state.maxOffline = data.maxOffline || 0;
    state.story = data.story || {};
    state.dungeonClears = data.dungeonClears || 0;
    state.lastSave = data.lastSave || Date.now();
  }

  function applyOfflineProgress(lastSave) {
    const extraHours = getPrestigeShopEffect('offlineHours');
    const maxOfflineHours = 8 + extraHours;
    const offlineSeconds = (Date.now() - lastSave) / 1000;
    const cappedSeconds = Math.min(offlineSeconds, maxOfflineHours * 3600);

    if (cappedSeconds >= 60) {
      const offlineLoc = getLocPerSecond() * cappedSeconds;
      if (offlineLoc > 0) {
        state.loc += offlineLoc;
        state.totalLoc += offlineLoc;
        if (cappedSeconds > state.maxOffline) {
          state.maxOffline = cappedSeconds;
        }
        setTimeout(() => {
          showToast(
            'offline',
            '😴 Оффлайн-прогресс',
            `Пока тебя не было (${fmtTime(cappedSeconds)}), команда написала +${fmt(offlineLoc)} ЛОК!`,
            'info',
            6000
          );
        }, 1000);
      }
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem('kodikofee_save');
      if (!raw) {
        return false;
      }
      const data = JSON.parse(raw);
      if (!data || !data.version) {
        return false;
      }

      const lastSave = data.lastSave || Date.now();
      applyLoadedData(data);
      applyOfflineProgress(lastSave);
      return true;
    } catch (e) {
      console.warn('Load failed:', e);
      return false;
    }
  }

  async function loadGameServer() {
    if (typeof IS_LOGGED_IN === 'undefined' || !IS_LOGGED_IN) {
      return false;
    }

    try {
      const res = await fetch('ajax/save.php?action=load');
      const json = await res.json();
      if (!json.success || !json.data) {
        return false;
      }

      const serverData = JSON.parse(json.data);
      if (!serverData || !serverData.version) {
        return false;
      }

      const localRaw = localStorage.getItem('kodikofee_save');
      let localData = null;
      if (localRaw) {
        try {
          localData = JSON.parse(localRaw);
        } catch (e) {
          localData = null;
        }
      }

      const merged = Object.assign({}, serverData);
      if (localData && (localData.lastSave || 0) > (serverData.lastSave || 0)) {
        merged.loc = localData.loc;
        merged.totalLoc = localData.totalLoc;
        merged.locThisRun = localData.locThisRun;
        merged.totalClicks = localData.totalClicks;
        merged.buildings = localData.buildings;
        merged.upgrades = localData.upgrades;
        merged.achievements = localData.achievements;
        merged.prestige = Math.max(serverData.prestige || 0, localData.prestige || 0);
        merged.prestigeMulti = Math.max(serverData.prestigeMulti || 1, localData.prestigeMulti || 1);
        merged.prestigePoints = Math.max(serverData.prestigePoints || 0, localData.prestigePoints || 0);
        merged.totalPrestigePoints = Math.max(serverData.totalPrestigePoints || 0, localData.totalPrestigePoints || 0);
        merged.prestigeShop = mergePrestigeShop(serverData.prestigeShop, localData.prestigeShop);
        merged.eventCount = localData.eventCount;
        merged.story = localData.story;
        merged.dungeonClears = localData.dungeonClears;
        merged.maxOffline = Math.max(serverData.maxOffline || 0, localData.maxOffline || 0);
      }

      if (json.dungeonClears !== undefined) {
        merged.dungeonClears = json.dungeonClears;
      }

      const lastSave = merged.lastSave || Date.now();
      applyLoadedData(merged);
      applyOfflineProgress(lastSave);
      saveGame();
      return true;
    } catch (e) {
      console.warn('Server load failed:', e);
      return false;
    }
  }

  window.IdleSave = {
    buildSaveData: buildSaveData,
    saveGame: saveGame,
    saveGameServer: saveGameServer,
    applyLoadedData: applyLoadedData,
    applyOfflineProgress: applyOfflineProgress,
    loadGame: loadGame,
    loadGameServer: loadGameServer,
  };
}());
