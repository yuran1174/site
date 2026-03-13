import { CYCLE_MS, MAX_OFFLINE_CYCLES, STATE_VERSION, STORAGE_KEY, WEEKDAY_ORDER } from './content.js';
const DEFAULT_SOCIAL_PRIORITY = ['max', 'cash'];
const DEFAULT_SLOTS = ['project_slot', 'rest_slot'];
export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
export function createInitialState(boot) {
    const playerName = boot.playerName || 'Герой';
    return {
        calendar: {
            day: 1,
            week: 1,
            weekday: 'monday',
        },
        resources: {
            money: 620,
            energy: 64,
            focus: 58,
            mood: 52,
            stress: 38,
        },
        routine: {
            lifeMode: 'survival',
            projectFocus: 'clarify',
            socialPriority: [...DEFAULT_SOCIAL_PRIORITY],
            eveningSlots: [...DEFAULT_SLOTS],
        },
        project: {
            clarity: 16,
            prototype: 8,
            quality: 6,
            showability: 4,
            stageLabel: `${playerName} собирает первый внятный idle-срез`,
        },
        room: {
            order: 48,
            comfort: 42,
            tier: 1,
        },
        circle: {
            trust: 12,
            momentum: 18,
        },
        progression: {
            lifeStability: 28,
        },
        relationships: {
            cash: { unlocked: true, bond: 3, readiness: 60 },
            max: { unlocked: true, bond: 2, readiness: 44 },
            kostya: { unlocked: false, bond: 0, readiness: 16 },
            zheka: { unlocked: false, bond: 0, readiness: 12 },
        },
        alerts: [],
        positiveStates: [],
        results: [],
        feed: [
            {
                cycleNumber: 0,
                day: 1,
                title: 'Старт нового idle-среза',
                summary: 'Жизнь героя ещё не собрана, но комната, проект и люди уже начинают работать как одна система.',
                deltas: { money: 0, energy: 0, focus: 0, mood: 0, stress: 0, project: 0, bond: 0, room: 0 },
                alerts: [],
                positives: [],
            },
        ],
        meta: {
            version: STATE_VERSION,
            lastResolvedAt: Date.now(),
            totalCycles: 0,
        },
    };
}
export function validateState(candidate) {
    if (!candidate || typeof candidate !== 'object') {
        return false;
    }
    const state = candidate;
    return !!(state.meta &&
        state.meta.version === STATE_VERSION &&
        state.calendar &&
        state.resources &&
        state.routine &&
        state.project &&
        state.room &&
        state.relationships);
}
export function loadState(boot) {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return createInitialState(boot);
        }
        const parsed = JSON.parse(raw);
        return validateState(parsed) ? parsed : createInitialState(boot);
    }
    catch {
        return createInitialState(boot);
    }
}
export function saveState(state) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
export function resetState(boot) {
    const state = createInitialState(boot);
    saveState(state);
    return state;
}
export function getUnlockedSlotCount(state) {
    return state.resources.energy >= 34 && state.resources.stress <= 68 ? 2 : 1;
}
export function toggleSocialPriority(state, characterId) {
    const relationship = state.relationships[characterId];
    if (!relationship?.unlocked) {
        return;
    }
    const alreadySelected = state.routine.socialPriority.includes(characterId);
    if (alreadySelected) {
        if (state.routine.socialPriority.length > 1) {
            state.routine.socialPriority = state.routine.socialPriority.filter((id) => id !== characterId);
        }
        return;
    }
    state.routine.socialPriority = [...state.routine.socialPriority, characterId].slice(-2);
}
export function advanceCalendar(state) {
    const currentIndex = WEEKDAY_ORDER.indexOf(state.calendar.weekday);
    const nextIndex = (currentIndex + 1) % WEEKDAY_ORDER.length;
    state.calendar.day += 1;
    state.calendar.weekday = WEEKDAY_ORDER[nextIndex];
    if (state.calendar.weekday === 'monday') {
        state.calendar.week += 1;
    }
}
export function getOfflineCycleCount(state, now = Date.now()) {
    const elapsed = now - state.meta.lastResolvedAt;
    if (elapsed <= 0) {
        return 0;
    }
    return Math.min(Math.floor(elapsed / CYCLE_MS), MAX_OFFLINE_CYCLES);
}
export function pushResult(state, result) {
    state.results.unshift(result);
    state.results = state.results.slice(0, 6);
    state.feed.unshift(result);
    state.feed = state.feed.slice(0, 8);
}
