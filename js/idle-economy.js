'use strict';

(function () {
  const LEVEL_TITLES = [
    [50, 'Легенда'],
    [35, 'CTO'],
    [25, 'Архитектор'],
    [18, 'Тимлид'],
    [12, 'Сеньор'],
    [7, 'Мидл'],
    [3, 'Джун'],
    [1, 'Стажёр'],
  ];

  function fmt(n) {
    if (n < 1000) {
      return Math.floor(n).toString();
    }
    if (n < 1e6) {
      return (n / 1e3).toFixed(1) + 'K';
    }
    if (n < 1e9) {
      return (n / 1e6).toFixed(2) + 'M';
    }
    if (n < 1e12) {
      return (n / 1e9).toFixed(2) + 'B';
    }
    if (n < 1e15) {
      return (n / 1e12).toFixed(2) + 'T';
    }
    if (n < 1e18) {
      return (n / 1e15).toFixed(2) + 'Qa';
    }

    return n.toExponential(2);
  }

  function fmtTime(seconds) {
    if (seconds < 60) {
      return Math.floor(seconds) + 'с';
    }
    if (seconds < 3600) {
      return Math.floor(seconds / 60) + 'м ' + (Math.floor(seconds) % 60) + 'с';
    }

    return Math.floor(seconds / 3600) + 'ч ' + Math.floor((seconds % 3600) / 60) + 'м';
  }

  function getTotalBuildings(s) {
    return Object.values(s.buildings).reduce((a, b) => a + b, 0);
  }

  function getUpgradeCount(s) {
    return Object.values(s.upgrades).filter((value) => value).length;
  }

  function getPrestigeShopEffect(effectId) {
    const shop = state.prestigeShop || {};
    switch (effectId) {
      case 'clickMulti':
        return 0.1 * (shop.coffee_iv || 0);
      case 'discount':
        return 0.1 * (shop.discount || 0);
      case 'offlineHours':
        return 4 * (shop.offline_boost || 0);
      case 'eventLuckMult':
        return 0.25 * (shop.event_luck || 0);
      default:
        return 0;
    }
  }

  function getBuildingCost(building, count) {
    const shopDiscount = getPrestigeShopEffect('discount');
    const multi = Math.max(0.1, 1 - shopDiscount);
    return Math.ceil(building.baseCost * Math.pow(1.15, count) * multi);
  }

  function getBuildingCostN(building, currentCount, n) {
    let total = 0;
    for (let i = 0; i < n; i++) {
      total += getBuildingCost(building, currentCount + i);
    }
    return total;
  }

  function getClickMultiplier() {
    let mult = 1;
    for (const upg of UPGRADES) {
      if (upg.effect.type === 'click' && state.upgrades[upg.id]) {
        mult *= upg.effect.mult;
      }
    }
    mult *= 1 + getPrestigeShopEffect('clickMulti');
    return mult * tempState.clickMult;
  }

  function getBuildingCps(building) {
    let mult = 1;
    for (const upg of UPGRADES) {
      if (upg.effect.type === 'building' && upg.effect.id === building.id && state.upgrades[upg.id]) {
        mult *= upg.effect.mult;
      }
    }
    for (const upg of UPGRADES) {
      if (upg.effect.type === 'global' && state.upgrades[upg.id]) {
        mult *= upg.effect.mult;
      }
    }
    mult *= state.prestigeMulti;
    mult *= tempState.globalMult;
    if (tempState.buildingMult[building.id] !== undefined) {
      mult *= tempState.buildingMult[building.id];
    }
    return building.baseCps * mult;
  }

  function getLocPerSecond() {
    let total = 0;
    for (const building of BUILDINGS) {
      const count = state.buildings[building.id] || 0;
      total += getBuildingCps(building) * count;
    }
    return total;
  }

  function getLocPerClick() {
    const baseLpc = Math.max(1, getLocPerSecond() * 0.01);
    return Math.max(1, baseLpc * getClickMultiplier());
  }

  function randomEventDelay() {
    return 45000 + Math.random() * 45000;
  }

  function getPrestigeRequirements() {
    const prestigeLevel = state.prestige;
    const maxBuildingTypes = BUILDINGS.filter((building) => !building.requiresShop).length;
    return {
      locThisRun: 1e6 * Math.pow(10, prestigeLevel),
      buildingTypes: Math.min(4 + prestigeLevel, maxBuildingTypes),
      upgrades: Math.min(8 + prestigeLevel * 2, 22),
    };
  }

  function getAccountLevel() {
    const locPts = Math.floor(Math.log10((state.totalLoc || 0) + 10)) * 2;
    const prestigePts = (state.prestige || 0) * 10;
    const achievePts = Object.values(state.achievements || {}).filter(Boolean).length * 2;
    const dungeonPts = (state.dungeonClears || 0) * 3;
    return Math.max(1, Math.floor((locPts + prestigePts + achievePts + dungeonPts) / 5));
  }

  function getAccountLevelTitle(level) {
    for (const [minLevel, title] of LEVEL_TITLES) {
      if (level >= minLevel) {
        return title;
      }
    }
    return 'Стажёр';
  }

  function hasPrestigeShopItem(id) {
    return (state.prestigeShop[id] || 0) >= 1;
  }

  function applyPrestigeShopEffects() {
    const shop = state.prestigeShop || {};
    if (shop.veteran >= 1 && state.prestige > 0) {
      state.loc += 500 * state.prestige;
      state.totalLoc += 500 * state.prestige;
    }
  }

  function isBuildingUnlocked(building) {
    if (!building.requiresShop) {
      return true;
    }
    return hasPrestigeShopItem(building.requiresShop);
  }

  window.IdleEconomy = {
    LEVEL_TITLES: LEVEL_TITLES,
    fmt: fmt,
    fmtTime: fmtTime,
    getTotalBuildings: getTotalBuildings,
    getUpgradeCount: getUpgradeCount,
    getBuildingCost: getBuildingCost,
    getBuildingCostN: getBuildingCostN,
    getClickMultiplier: getClickMultiplier,
    getBuildingCps: getBuildingCps,
    getLocPerSecond: getLocPerSecond,
    getLocPerClick: getLocPerClick,
    randomEventDelay: randomEventDelay,
    getPrestigeRequirements: getPrestigeRequirements,
    getAccountLevel: getAccountLevel,
    getAccountLevelTitle: getAccountLevelTitle,
    getPrestigeShopEffect: getPrestigeShopEffect,
    hasPrestigeShopItem: hasPrestigeShopItem,
    applyPrestigeShopEffects: applyPrestigeShopEffects,
    isBuildingUnlocked: isBuildingUnlocked,
  };

  // Temporary compatibility bridge while idle logic is being split across files.
  Object.assign(window, window.IdleEconomy);
}());
