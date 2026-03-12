'use strict';

(() => {
  const rawGameData = window.IdleGameData || {};

  function matchesRule(rule, state) {
    if (!rule) {
      return true;
    }

    switch (rule.type) {
      case 'totalLocAtLeast':
        return (state.totalLoc || 0) >= rule.value;
      case 'totalClicksAtLeast':
        return (state.totalClicks || 0) >= rule.value;
      case 'buildingCountAtLeast':
        return ((state.buildings || {})[rule.buildingId] || 0) >= rule.value;
      case 'totalBuildingsAtLeast':
        return getTotalBuildings(state) >= rule.value;
      case 'prestigeAtLeast':
        return (state.prestige || 0) >= rule.value;
      case 'upgradeCountAtLeast':
        return getUpgradeCount(state) >= rule.value;
      case 'locPerSecondAtLeast':
        return getLocPerSecond() >= rule.value;
      case 'eventCountAtLeast':
        return (state.eventCount || 0) >= rule.value;
      case 'maxOfflineAtLeast':
        return (state.maxOffline || 0) >= rule.value;
      case 'storyUnlocked':
        return !!(state.story && state.story[rule.chapterId]);
      case 'storyAllChapters':
        return STORY_CHAPTERS.every((chapter) => state.story && state.story[chapter.id]);
      case 'dungeonClearsAtLeast':
        return (state.dungeonClears || 0) >= rule.value;
      case 'locThisRunAtLeast':
        return (state.locThisRun || 0) >= rule.value;
      case 'accountLevelAtLeast':
        return getAccountLevel() >= rule.value;
      case 'prestigeShopTotalLevelsAtLeast':
        return Object.values(state.prestigeShop || {}).reduce((sum, value) => sum + value, 0) >= rule.value;
      case 'prestigeShopUniqueItemsAtLeast':
        return Object.keys(state.prestigeShop || {}).length >= rule.value;
      case 'allBaseBuildingsOwned':
        return BUILDINGS
          .filter((building) => !building.requiresShop)
          .every((building) => ((state.buildings || {})[building.id] || 0) >= 1);
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
        return (state) => {
          state.loc = Math.floor(state.loc * effectRule.value);
        };
      case 'subtractLocFlat':
        return (state) => {
          state.loc = Math.max(0, state.loc - effectRule.value);
        };
      default:
        return undefined;
    }
  }

  const BUILDINGS = rawGameData.buildings || [];
  const UPGRADES = (rawGameData.upgrades || []).map((upgrade) => ({
    ...upgrade,
    unlockCondition: (state) => matchesRule(upgrade.unlockRule, state),
  }));
  const STORY_CHAPTERS = rawGameData.storyChapters || [];
  const ACHIEVEMENTS = (rawGameData.achievements || []).map((achievement) => ({
    ...achievement,
    condition: (state) => matchesRule(achievement.rule, state),
  }));
  const EVENTS = (rawGameData.events || []).map((gameEvent) => ({
    ...gameEvent,
    condition: gameEvent.rule ? (state) => matchesRule(gameEvent.rule, state) : undefined,
    effect: buildEffect(gameEvent.effectRule),
  }));
  const NEWS_MESSAGES = rawGameData.newsMessages || [];

  window.IdleData = {
    BUILDINGS,
    UPGRADES,
    STORY_CHAPTERS,
    ACHIEVEMENTS,
    EVENTS,
    NEWS_MESSAGES,
  };

  // Temporary compatibility bridge for split idle modules that still read data as globals.
  Object.assign(window, window.IdleData);
})();
