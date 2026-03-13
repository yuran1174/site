export type Weekday =
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';

export type LifeMode =
    | 'survival'
    | 'side_hustle'
    | 'recovery'
    | 'project_focus'
    | 'people_focus';

export type ProjectFocus = 'clarify' | 'build' | 'polish' | 'show';

export type SlotAssignment = 'rest_slot' | 'project_slot' | 'relationship_slot' | 'room_slot' | 'group_slot';

export type AlertId = 'money_crunch' | 'burnout_risk' | 'room_decline';

export type PositiveStateId = 'stable_routine' | 'project_flow';

export type CharacterId = 'cash' | 'max' | 'kostya' | 'zheka';

export interface CharacterState {
    unlocked: boolean;
    bond: number;
    readiness: number;
}

export interface GameState {
    calendar: {
        day: number;
        week: number;
        weekday: Weekday;
    };
    resources: {
        money: number;
        energy: number;
        focus: number;
        mood: number;
        stress: number;
    };
    routine: {
        lifeMode: LifeMode;
        projectFocus: ProjectFocus;
        socialPriority: CharacterId[];
        eveningSlots: [SlotAssignment, SlotAssignment];
    };
    project: {
        clarity: number;
        prototype: number;
        quality: number;
        showability: number;
        stageLabel: string;
    };
    room: {
        order: number;
        comfort: number;
        tier: number;
    };
    circle: {
        trust: number;
        momentum: number;
    };
    progression: {
        lifeStability: number;
    };
    relationships: Record<CharacterId, CharacterState>;
    alerts: AlertId[];
    positiveStates: PositiveStateId[];
    results: CycleResult[];
    feed: CycleResult[];
    meta: {
        version: number;
        lastResolvedAt: number;
        totalCycles: number;
    };
}

export interface CycleDelta {
    money: number;
    energy: number;
    focus: number;
    mood: number;
    stress: number;
    project: number;
    bond: number;
    room: number;
}

export interface CycleResult {
    cycleNumber: number;
    day: number;
    title: string;
    summary: string;
    deltas: CycleDelta;
    alerts: AlertId[];
    positives: PositiveStateId[];
}

export interface ModeDefinition {
    id: LifeMode;
    label: string;
    shortLabel: string;
    description: string;
    bonus: string;
    risk: string;
}

export interface FocusDefinition {
    id: ProjectFocus;
    label: string;
    description: string;
}

export interface SlotDefinition {
    id: SlotAssignment;
    label: string;
    description: string;
}

export interface CharacterDefinition {
    id: CharacterId;
    name: string;
    role: string;
    unlockHint: string;
    modifierLabel: string;
}

export interface BootPayload {
    playerName: string;
    isLoggedIn: boolean;
}

declare global {
    interface Window {
        Phaser: any;
        SEASON1_BOOTSTRAP?: BootPayload;
    }
}
