export type ProjectGenre = 'arcade' | 'rpg' | 'puzzle' | 'sim' | 'platformer' | 'visual_novel';
export type ProjectPlatform = 'mobile' | 'pc' | 'web';
export type ProjectSize = 'jam' | 'small' | 'medium';
export type ActivityMode = 'work' | 'study_code' | 'study_design' | 'rest' | 'socialize';
export type CharacterId = 'max' | 'zheka' | 'zhora';
export type StudioTier = 1 | 2 | 3;
export type EventKind = 'info' | 'good' | 'bad';

export interface ActiveProject {
    id: string;
    name: string;
    genre: ProjectGenre;
    platform: ProjectPlatform;
    size: ProjectSize;
    progress: number;
    daysSpent: number;
    daysRequired: number;
    codingAccum: number;
    designAccum: number;
}

export interface CompletedProject {
    name: string;
    genre: ProjectGenre;
    platform: ProjectPlatform;
    rating: number;
    earnings: number;
    fans: number;
    day: number;
}

export interface CharacterState {
    unlocked: boolean;
    bond: number;
}

export interface PendingRelease {
    name: string;
    genre: ProjectGenre;
    platform: ProjectPlatform;
    rating: number;
    earnings: number;
    fans: number;
    repGain: number;
    reviewQuote: string;
}

export interface GameEvent {
    day: number;
    title: string;
    body: string;
    kind: EventKind;
}

export interface GameState {
    day: number;
    money: number;
    fans: number;
    rep: number;
    stats: { coding: number; design: number; endurance: number };
    activity: ActivityMode;
    socialTarget: CharacterId;
    activeProject: ActiveProject | null;
    pendingRelease: PendingRelease | null;
    completedProjects: CompletedProject[];
    studioTier: StudioTier;
    characters: Record<CharacterId, CharacterState>;
    events: GameEvent[];
    meta: { version: number; totalDays: number; lastTickAt: number };
}

export interface UIHandlers {
    onActivityChange(mode: ActivityMode): void;
    onSocialTargetChange(id: CharacterId): void;
    onStartProject(genre: ProjectGenre, platform: ProjectPlatform, size: ProjectSize): void;
    onDismissRelease(): void;
    onAbandonProject(): void;
    onReset(): void;
}

export interface BootPayload {
    playerName: string;
    isLoggedIn: boolean;
}

declare global {
    interface Window {
        SEASON1_BOOTSTRAP?: BootPayload;
    }
}
