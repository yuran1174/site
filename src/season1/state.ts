import { DAILY_COST, SIZE_DATA, STATE_VERSION, STORAGE_KEY, generateProjectName } from './content.js';
import type { ActiveProject, BootPayload, CharacterId, GameState, ProjectGenre, ProjectPlatform, ProjectSize } from './types.js';

export function clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
}

export function createInitialState(_boot: BootPayload): GameState {
    return {
        day: 1,
        money: 2500,
        fans: 0,
        rep: 0,
        stats: { coding: 35, design: 18, endurance: 75 },
        activity: 'rest',
        socialTarget: 'max',
        activeProject: null,
        pendingRelease: null,
        completedProjects: [],
        studioTier: 1,
        characters: {
            max:   { unlocked: false, bond: 0 },
            zheka: { unlocked: false, bond: 0 },
            zhora: { unlocked: false, bond: 0 },
        },
        events: [{
            day: 1,
            title: 'Начало',
            body: 'Комната. Ноут. Кот. Кофе. Мечта сделать игру. Всё остальное — детали.',
            kind: 'info',
        }],
        meta: { version: STATE_VERSION, totalDays: 0, lastTickAt: Date.now() },
    };
}

export function validateState(candidate: unknown): candidate is GameState {
    if (!candidate || typeof candidate !== 'object') return false;
    const s = candidate as Partial<GameState>;
    return !!(s.meta && s.meta.version === STATE_VERSION && s.stats && typeof s.day === 'number');
}

export function loadState(boot: BootPayload): GameState {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return createInitialState(boot);
        const parsed = JSON.parse(raw) as unknown;
        return validateState(parsed) ? parsed : createInitialState(boot);
    } catch {
        return createInitialState(boot);
    }
}

export function saveState(state: GameState): void {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(boot: BootPayload): GameState {
    const state = createInitialState(boot);
    saveState(state);
    return state;
}

export function createProject(genre: ProjectGenre, platform: ProjectPlatform, size: ProjectSize): ActiveProject {
    return {
        id: String(Date.now()),
        name: generateProjectName(genre),
        genre,
        platform,
        size,
        progress: 0,
        daysSpent: 0,
        daysRequired: SIZE_DATA[size].days,
        codingAccum: 0,
        designAccum: 0,
    };
}

export function getDailyCost(studioTier: number): number {
    return DAILY_COST + (studioTier - 1) * 120;
}
