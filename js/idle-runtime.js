'use strict';

(function () {
  function createInitialState() {
    return {
      loc: 0,
      totalLoc: 0,
      locThisRun: 0,
      totalClicks: 0,
      buildings: {},
      upgrades: {},
      achievements: {},
      prestige: 0,
      prestigeMulti: 1,
      prestigePoints: 0,
      totalPrestigePoints: 0,
      prestigeShop: {},
      eventCount: 0,
      maxOffline: 0,
      story: {},
      dungeonClears: 0,
      lastSave: Date.now(),
      lastTick: Date.now(),
      version: 3,
    };
  }

  function createInitialTempState() {
    return {
      globalMult: 1,
      clickMult: 1,
      buildingMult: {},
      paused: false,
      pauseUntil: 0,
      activeEvent: null,
      activeEventUntil: 0,
    };
  }

  window.IdleRuntime = {
    TICK_MS: 50,
    SAVE_INTERVAL: 10000,
    SERVER_SAVE_INTERVAL: 30000,
    createInitialState: createInitialState,
    createInitialTempState: createInitialTempState,
  };
}());
