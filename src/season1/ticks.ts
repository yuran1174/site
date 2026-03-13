import { ALERT_LABELS, POSITIVE_LABELS } from './content.js';
import { advanceCalendar, clamp, getUnlockedSlotCount, pushResult } from './state.js';
import type { AlertId, CharacterId, CycleDelta, CycleResult, GameState, PositiveStateId, ProjectFocus, SlotAssignment } from './types.js';

const PROJECT_FOCUS_WEIGHTS: Record<ProjectFocus, number[]> = {
    clarify: [1.45, 0.65, 0.45, 0.4],
    build: [0.55, 1.5, 0.55, 0.45],
    polish: [0.45, 0.75, 1.45, 0.45],
    show: [0.35, 0.55, 0.65, 1.55],
};

export function resolveCycles(state: GameState, cycleCount: number): void {
    for (let index = 0; index < cycleCount; index += 1) {
        resolveSingleCycle(state);
    }
}

export function resolveSingleCycle(state: GameState): void {
    const unlockedSlotCount = getUnlockedSlotCount(state);
    const slots = state.routine.eveningSlots.slice(0, unlockedSlotCount);
    const deltas: CycleDelta = { money: 0, energy: 0, focus: 0, mood: 0, stress: 0, project: 0, bond: 0, room: 0 };

    applyModeBase(state, deltas);
    applySlots(state, slots, deltas);
    applyRoomAndStress(state, deltas);
    applyCharacters(state, slots, deltas);
    applyProjectProgress(state, deltas);
    unlockCharacters(state);

    state.resources.money = clamp(state.resources.money + deltas.money, 0, 9999);
    state.resources.energy = clamp(state.resources.energy + deltas.energy, 0, 100);
    state.resources.focus = clamp(state.resources.focus + deltas.focus, 0, 100);
    state.resources.mood = clamp(state.resources.mood + deltas.mood, 0, 100);
    state.resources.stress = clamp(state.resources.stress + deltas.stress, 0, 100);
    state.room.order = clamp(state.room.order + deltas.room, 0, 100);
    state.project.clarity = clamp(state.project.clarity + getProjectGain(state.routine.projectFocus, deltas.project, 0), 0, 100);
    state.project.prototype = clamp(state.project.prototype + getProjectGain(state.routine.projectFocus, deltas.project, 1), 0, 100);
    state.project.quality = clamp(state.project.quality + getProjectGain(state.routine.projectFocus, deltas.project, 2), 0, 100);
    state.project.showability = clamp(state.project.showability + getProjectGain(state.routine.projectFocus, deltas.project, 3), 0, 100);
    state.progression.lifeStability = clamp(state.progression.lifeStability + getLifeStabilityDelta(state), 0, 100);
    state.circle.trust = clamp(state.circle.trust + Math.max(0, Math.round(deltas.bond / 2)), 0, 100);
    state.circle.momentum = clamp(state.circle.momentum + Math.round(deltas.project / 2), 0, 100);

    increaseReadiness(state);
    state.alerts = resolveAlerts(state);
    state.positiveStates = resolvePositiveStates(state, deltas);
    state.project.stageLabel = describeStage(state);
    state.meta.totalCycles += 1;
    state.meta.lastResolvedAt = Date.now();

    const result: CycleResult = {
        cycleNumber: state.meta.totalCycles,
        day: state.calendar.day,
        title: buildCycleTitle(state),
        summary: buildCycleSummary(state, deltas),
        deltas,
        alerts: [...state.alerts],
        positives: [...state.positiveStates],
    };

    pushResult(state, result);
    advanceCalendar(state);
}

function applyModeBase(state: GameState, deltas: CycleDelta): void {
    const mode = state.routine.lifeMode;

    deltas.money -= 90;
    deltas.energy -= 6;
    deltas.focus -= 2;
    deltas.mood -= 1;
    deltas.stress += 2;
    deltas.room -= 1;

    if (mode === 'survival') {
        deltas.money += 122;
        deltas.energy -= 2;
        deltas.focus += 1;
    } else if (mode === 'side_hustle') {
        deltas.money += 182;
        deltas.energy -= 10;
        deltas.focus -= 4;
        deltas.stress += 10;
        deltas.project -= 4;
    } else if (mode === 'recovery') {
        deltas.money += 54;
        deltas.energy += 16;
        deltas.focus += 8;
        deltas.mood += 8;
        deltas.stress -= 12;
        deltas.project -= 3;
    } else if (mode === 'project_focus') {
        deltas.money += 92;
        deltas.energy -= 9;
        deltas.focus -= 3;
        deltas.stress += 8;
        deltas.project += 9;
    } else if (mode === 'people_focus') {
        deltas.money += 72;
        deltas.energy -= 3;
        deltas.mood += 5;
        deltas.stress -= 1;
        deltas.bond += 6;
        deltas.project -= 2;
    }
}

function applySlots(state: GameState, slots: SlotAssignment[], deltas: CycleDelta): void {
    slots.forEach((slot) => {
        if (slot === 'rest_slot') {
            deltas.energy += 12;
            deltas.stress -= 7;
            deltas.mood += 5;
        } else if (slot === 'project_slot') {
            deltas.energy -= 6;
            deltas.focus -= 2;
            deltas.project += 8;
        } else if (slot === 'relationship_slot') {
            deltas.energy -= 2;
            deltas.mood += 6;
            deltas.bond += 7;
        } else if (slot === 'room_slot') {
            deltas.room += 9;
            deltas.energy += 4;
            deltas.stress -= 4;
        } else if (slot === 'group_slot') {
            deltas.energy -= 1;
            deltas.mood += 8;
            deltas.bond += 5;
            state.circle.momentum = clamp(state.circle.momentum + 4, 0, 100);
        }
    });
}

function applyRoomAndStress(state: GameState, deltas: CycleDelta): void {
    const roomSupport = Math.round((state.room.order + state.room.comfort) / 25);
    deltas.energy += roomSupport - 3;
    deltas.focus += roomSupport - 2;

    if (state.room.order < 36) {
        deltas.energy -= 4;
        deltas.focus -= 3;
        deltas.stress += 4;
    }

    if (state.resources.stress > 64) {
        deltas.energy -= 5;
        deltas.focus -= 6;
        deltas.mood -= 3;
    }

    if (state.resources.money < 180) {
        deltas.focus -= 4;
        deltas.mood -= 4;
        deltas.stress += 5;
    }
}

function applyCharacters(state: GameState, slots: SlotAssignment[], deltas: CycleDelta): void {
    if (state.relationships.cash.unlocked) {
        deltas.mood += 2;
        if (state.resources.energy < 40) {
            deltas.energy += 3;
            deltas.stress -= 2;
        }
    }

    if (state.relationships.max.unlocked && state.routine.socialPriority.includes('max')) {
        deltas.bond += 2;
        if (slots.includes('relationship_slot') || slots.includes('group_slot')) {
            state.project.showability = clamp(state.project.showability + 2, 0, 100);
            state.relationships.max.bond = clamp(state.relationships.max.bond + 1, 0, 10);
        }
    }

    if (state.relationships.kostya.unlocked && slots.includes('group_slot')) {
        deltas.bond += 2;
        deltas.mood += 2;
        state.circle.trust = clamp(state.circle.trust + 3, 0, 100);
        state.relationships.kostya.bond = clamp(state.relationships.kostya.bond + 1, 0, 10);
    }

    if (state.relationships.zheka.unlocked) {
        const projectHeavy = state.routine.projectFocus === 'build' || state.routine.projectFocus === 'polish';
        if (projectHeavy) {
            deltas.project += 4;
            deltas.focus += 2;
        }
        if (slots.includes('project_slot')) {
            state.relationships.zheka.bond = clamp(state.relationships.zheka.bond + 1, 0, 10);
        }
    }
}

function applyProjectProgress(state: GameState, deltas: CycleDelta): void {
    if (state.resources.energy < 24) {
        deltas.project -= 4;
    }

    if (state.resources.focus < 25) {
        deltas.project -= 3;
    }

    if (state.alerts.includes('money_crunch')) {
        deltas.project -= 2;
    }

    deltas.project = Math.max(-6, deltas.project);
}

function unlockCharacters(state: GameState): void {
    if (!state.relationships.kostya.unlocked && state.relationships.max.bond >= 4 && state.progression.lifeStability >= 36) {
        state.relationships.kostya.unlocked = true;
        state.relationships.kostya.readiness = 38;
    }

    if (!state.relationships.zheka.unlocked && state.project.prototype >= 24) {
        state.relationships.zheka.unlocked = true;
        state.relationships.zheka.readiness = 40;
    }
}

function increaseReadiness(state: GameState): void {
    const selected = new Set(state.routine.socialPriority);

    (Object.keys(state.relationships) as CharacterId[]).forEach((characterId) => {
        const relationship = state.relationships[characterId];
        if (!relationship.unlocked) {
            return;
        }

        relationship.readiness = clamp(
            relationship.readiness + (selected.has(characterId) ? 10 : 4) - (state.routine.lifeMode === 'side_hustle' ? 2 : 0),
            0,
            100,
        );
    });
}

function resolveAlerts(state: GameState): AlertId[] {
    const alerts: AlertId[] = [];
    if (state.resources.money < 180) {
        alerts.push('money_crunch');
    }
    if (state.resources.energy < 28 || state.resources.stress > 72) {
        alerts.push('burnout_risk');
    }
    if (state.room.order < 36) {
        alerts.push('room_decline');
    }
    return alerts;
}

function resolvePositiveStates(state: GameState, deltas: CycleDelta): PositiveStateId[] {
    const positives: PositiveStateId[] = [];
    if (state.resources.energy > 58 && state.resources.stress < 44 && state.room.order > 54) {
        positives.push('stable_routine');
    }
    if (state.resources.focus > 56 && deltas.project >= 9) {
        positives.push('project_flow');
    }
    return positives;
}

function getProjectGain(focus: ProjectFocus, value: number, targetIndex: number): number {
    const gain = Math.round(value * PROJECT_FOCUS_WEIGHTS[focus][targetIndex]);
    return targetIndex === 3 ? Math.max(0, gain) : gain;
}

function getLifeStabilityDelta(state: GameState): number {
    let delta = 0;
    if (state.resources.energy > 55) {
        delta += 2;
    }
    if (state.room.order > 55) {
        delta += 2;
    }
    if (state.resources.stress > 70) {
        delta -= 3;
    }
    return delta;
}

function describeStage(state: GameState): string {
    if (state.project.showability >= 56) {
        return 'У проекта появилось окно для показа наружу.';
    }
    if (state.project.quality >= 44) {
        return 'Срез уже ощущается как живая игра, а не только обещание.';
    }
    if (state.project.prototype >= 26) {
        return 'Playable-слой держится и просит polish.';
    }
    if (state.project.clarity >= 28) {
        return 'Идея собрана, теперь пора дожимать build.';
    }
    return 'Герой ещё собирает форму и ритм вокруг проекта.';
}

function buildCycleTitle(state: GameState): string {
    if (state.positiveStates.includes('project_flow')) {
        return 'Проект поймал ход';
    }
    if (state.alerts.includes('burnout_risk')) {
        return 'Цикл просит тормознуть';
    }
    if (state.alerts.includes('money_crunch')) {
        return 'Быт снова давит на рутину';
    }
    return 'День прожился в idle-режиме';
}

function buildCycleSummary(state: GameState, deltas: CycleDelta): string {
    const parts: string[] = [];

    parts.push(`${deltas.money >= 0 ? '+' : ''}${deltas.money} денег`);
    parts.push(`${deltas.energy >= 0 ? '+' : ''}${deltas.energy} энергии`);
    parts.push(`${deltas.project >= 0 ? '+' : ''}${deltas.project} project impulse`);

    if (state.alerts.length > 0) {
        parts.push(`alerts: ${state.alerts.map((alert) => ALERT_LABELS[alert]).join(', ')}`);
    } else if (state.positiveStates.length > 0) {
        parts.push(`states: ${state.positiveStates.map((positive) => POSITIVE_LABELS[positive]).join(', ')}`);
    }

    return parts.join(' · ');
}
