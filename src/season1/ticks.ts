import { GENRE_DATA, PLATFORM_DATA, SIZE_DATA, getReviewQuote } from './content.js';
import { clamp, getDailyCost } from './state.js';
import type { GameEvent, GameState, PendingRelease } from './types.js';

export function resolveDays(state: GameState, count: number): void {
    for (let i = 0; i < count; i++) {
        resolveDay(state);
    }
}

function resolveDay(state: GameState): void {
    // Living costs
    const cost = getDailyCost(state.studioTier);
    state.money -= cost;
    if (state.money < 0) state.money = 0;

    // Activity effects
    applyActivity(state);

    // Global stat decay (coding and design always decay without study)
    state.stats.coding   = clamp(state.stats.coding   - 0.8, 0, 100);
    state.stats.design   = clamp(state.stats.design   - 0.8, 0, 100);

    // Endurance floor: warn at low
    if (state.stats.endurance <= 0) {
        state.stats.coding  = clamp(state.stats.coding  - 1, 0, 100);
        state.stats.design  = clamp(state.stats.design  - 1, 0, 100);
    }

    // Project progress if working
    if (state.activity === 'work' && state.activeProject) {
        advanceProject(state);
    }

    // Character unlocks
    tryUnlockCharacters(state);

    // Studio tier upgrade
    tryUpgradeStudio(state);

    state.meta.totalDays += 1;
    state.meta.lastTickAt = Date.now();
    state.day += 1;
}

function applyActivity(state: GameState): void {
    const s = state.stats;
    switch (state.activity) {
        case 'work':
            s.endurance = clamp(s.endurance - 10, 0, 100);
            s.coding    = clamp(s.coding    + 0.5, 0, 100); // learning by doing
            break;
        case 'study_code':
            s.coding    = clamp(s.coding    + 5, 0, 100);
            s.endurance = clamp(s.endurance - 5, 0, 100);
            break;
        case 'study_design':
            s.design    = clamp(s.design    + 5, 0, 100);
            s.endurance = clamp(s.endurance - 5, 0, 100);
            break;
        case 'rest':
            s.endurance = clamp(s.endurance + 20, 0, 100);
            break;
        case 'socialize': {
            s.endurance = clamp(s.endurance - 3, 0, 100);
            const target = state.characters[state.socialTarget];
            if (target.unlocked) {
                target.bond = clamp(target.bond + 1, 0, 10);
            } else {
                // Socializing unlocks Max first if bond attempted
                if (state.socialTarget === 'max') {
                    target.bond = clamp(target.bond + 1, 0, 10);
                    if (target.bond >= 3) {
                        target.unlocked = true;
                        pushEvent(state, 'Макс в деле', 'Макс согласился помочь с дизайном. Теперь он часть команды.', 'good');
                    }
                }
            }
            break;
        }
    }
}

function advanceProject(state: GameState): void {
    const p = state.activeProject!;
    const s = state.stats;

    // Productivity: combines coding and design weighted by genre
    const genre = GENRE_DATA[p.genre];
    const codingContrib = s.coding * genre.codingW;
    const designContrib = s.design * genre.designW;
    const rawQuality = codingContrib + designContrib;

    // Fatigue penalty
    const fatigueMult = s.endurance > 40 ? 1.0 : s.endurance / 40;

    // Progress gain per day (bigger projects progress slower — daysRequired built into formula)
    const gain = (rawQuality / 100) * fatigueMult * (100 / p.daysRequired) * 1.4;
    p.progress = clamp(p.progress + gain, 0, 100);

    // Accumulate quality for rating calculation
    p.codingAccum  += s.coding  * genre.codingW;
    p.designAccum  += s.design  * genre.designW;
    p.daysSpent    += 1;

    // Max collaboration: bonus design
    if (state.characters.max.unlocked && state.characters.max.bond >= 5) {
        p.designAccum += 8;
    }

    // Project complete
    if (p.progress >= 100) {
        completeProject(state);
    }
}

function completeProject(state: GameState): void {
    const p = state.activeProject!;
    const avgCoding  = p.daysSpent > 0 ? p.codingAccum  / p.daysSpent : 0;
    const avgDesign  = p.daysSpent > 0 ? p.designAccum  / p.daysSpent : 0;
    const quality    = clamp(avgCoding + avgDesign, 0, 100);

    let rating = 1 + (quality / 100) * 9;

    // Zheka QA bonus
    if (state.characters.zheka.unlocked) {
        rating = clamp(rating + 0.5, 1, 10);
    }

    // Low endurance during dev: small penalty
    if (state.stats.endurance < 20) {
        rating = clamp(rating - 0.5, 1, 10);
    }

    rating = Math.round(rating * 10) / 10;

    const sizeInfo     = SIZE_DATA[p.size];
    const platformInfo = PLATFORM_DATA[p.platform];

    let earnings = Math.round(sizeInfo.baseEarnings * platformInfo.earningsM * (rating / 6));
    let fans     = Math.round(sizeInfo.baseFans     * platformInfo.fansM     * (rating / 5));

    // Zhora hype bonus
    if (state.characters.zhora.unlocked) {
        fans = Math.round(fans * 1.3);
    }

    const repGain = Math.round(rating * 2 + (p.size === 'medium' ? 4 : p.size === 'small' ? 2 : 1));

    state.pendingRelease = {
        name: p.name,
        genre: p.genre,
        platform: p.platform,
        rating,
        earnings,
        fans,
        repGain,
        reviewQuote: getReviewQuote(rating),
    };

    state.completedProjects.push({
        name: p.name,
        genre: p.genre,
        platform: p.platform,
        rating,
        earnings,
        fans,
        day: state.day,
    });

    state.money += earnings;
    state.fans  += fans;
    state.rep   += repGain;

    state.activeProject = null;
}

function tryUnlockCharacters(state: GameState): void {
    if (!state.characters.max.unlocked && state.rep >= 15) {
        state.characters.max.unlocked = true;
        pushEvent(state, 'Макс написал', 'Макс слышал про твои проекты и готов помочь с дизайном.', 'good');
    }
    if (!state.characters.zheka.unlocked && state.completedProjects.length >= 3) {
        state.characters.zheka.unlocked = true;
        pushEvent(state, 'Жека подключился', 'После трёх релизов Жека сам предложил помогать с QA.', 'good');
    }
    if (!state.characters.zhora.unlocked && state.fans >= 100) {
        state.characters.zhora.unlocked = true;
        pushEvent(state, 'Жора заметил', 'Сто фанатов — это уже повод для Жоры начать хайповать твои релизы.', 'good');
    }
}

function tryUpgradeStudio(state: GameState): void {
    if (state.studioTier === 1 && state.completedProjects.length >= 2 && state.money >= 5000) {
        state.studioTier = 2;
        pushEvent(state, 'Апгрейд студии', 'Стол, второй монитор, нормальное кресло. Теперь это уже похоже на студию.', 'good');
    }
    if (state.studioTier === 2 && state.completedProjects.length >= 5 && state.fans >= 500) {
        state.studioTier = 3;
        pushEvent(state, 'Настоящая студия', 'Своё место. Своя атмосфера. Теперь это больше не просто комната.', 'good');
    }
}

function pushEvent(state: GameState, title: string, body: string, kind: GameEvent['kind']): void {
    state.events.unshift({ day: state.day, title, body, kind });
    if (state.events.length > 8) state.events.pop();
}
