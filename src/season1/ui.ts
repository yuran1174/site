import {
    ALERT_LABELS,
    CHARACTERS,
    LIFE_MODES,
    POSITIVE_LABELS,
    PROJECT_FOCUSES,
    SLOT_OPTIONS,
    WEEKDAY_LABELS,
} from './content.js';
import { getUnlockedSlotCount } from './state.js';
import type { GameState } from './types.js';

type Handlers = {
    onLifeModeChange: (value: string) => void;
    onProjectFocusChange: (value: string) => void;
    onSlotChange: (index: number, value: string) => void;
    onSocialPriorityToggle: (value: string) => void;
    onRunCycle: () => void;
    onReset: () => void;
};

type Elements = Record<string, HTMLElement>;

export class SeasonOneUi {
    private readonly elements: Elements;
    private readonly handlers: Handlers;

    constructor(handlers: Handlers) {
        this.handlers = handlers;
        this.elements = {
            day: required('s1HudDay'),
            weekday: required('s1HudWeekday'),
            phase: required('s1HudPhase'),
            mode: required('s1HudMode'),
            money: required('s1HudMoney'),
            energy: required('s1HudEnergy'),
            focus: required('s1HudFocus'),
            mood: required('s1HudMood'),
            stress: required('s1HudStress'),
            cycleStatus: required('s1CycleStatus'),
            results: required('s1ResultsRail'),
            alerts: required('s1AlertsList'),
            lifeModes: required('s1LifeModeControls'),
            projectFocus: required('s1ProjectFocusControls'),
            slots: required('s1EveningSlots'),
            social: required('s1SocialPriority'),
            projectSummary: required('s1ProjectSummary'),
            projectBars: required('s1ProjectBars'),
            people: required('s1PeopleList'),
            feed: required('s1FeedList'),
            stageCaption: required('s1StageCaption'),
            runCycle: required('s1RunCycleBtn'),
            reset: required('s1ResetBtn'),
            cycleHint: required('s1CycleHint'),
            progressShelf: required('s1ProgressShelf'),
        };

        this.elements.runCycle.addEventListener('click', () => this.handlers.onRunCycle());
        this.elements.reset.addEventListener('click', () => this.handlers.onReset());
    }

    render(state: GameState): void {
        this.renderHud(state);
        this.renderResults(state);
        this.renderAlerts(state);
        this.renderLifeModes(state);
        this.renderProjectFocus(state);
        this.renderSlots(state);
        this.renderSocial(state);
        this.renderProject(state);
        this.renderPeople(state);
        this.renderFeed(state);
        this.renderMeta(state);
    }

    private renderHud(state: GameState): void {
        this.elements.day.textContent = `День ${state.calendar.day}`;
        this.elements.weekday.textContent = WEEKDAY_LABELS[state.calendar.weekday];
        this.elements.phase.textContent = state.project.stageLabel;
        this.elements.mode.textContent = LIFE_MODES.find((item) => item.id === state.routine.lifeMode)?.shortLabel ?? '';
        this.elements.money.textContent = `${state.resources.money} ₽`;
        this.elements.energy.textContent = `${state.resources.energy}`;
        this.elements.focus.textContent = `${state.resources.focus}`;
        this.elements.mood.textContent = `${state.resources.mood}`;
        this.elements.stress.textContent = `${state.resources.stress}`;

        const cycleStatus = state.alerts[0]
            ? ALERT_LABELS[state.alerts[0]]
            : state.positiveStates[0]
              ? POSITIVE_LABELS[state.positiveStates[0]]
              : 'Цикл стабилен';

        this.elements.cycleStatus.textContent = cycleStatus;
        this.elements.stageCaption.textContent = state.project.stageLabel;
        this.elements.cycleHint.textContent = `Авто-цикл тикает сам. Следующая ручная правка: режим, слоты или люди. Всего циклов: ${state.meta.totalCycles}.`;
    }

    private renderResults(state: GameState): void {
        const lastResults = state.results.slice(0, 4);
        this.elements.results.innerHTML = lastResults
            .map((result) => {
                const cards = [
                    metricCard('деньги', result.deltas.money),
                    metricCard('энергия', result.deltas.energy),
                    metricCard('проект', result.deltas.project),
                    metricCard('связь', result.deltas.bond),
                    metricCard('комната', result.deltas.room),
                ].join('');

                return `<article class="s1-result-card">
                    <div class="s1-result-head">
                        <strong>${escapeHtml(result.title)}</strong>
                        <span>День ${result.day}</span>
                    </div>
                    <p>${escapeHtml(result.summary)}</p>
                    <div class="s1-result-metrics">${cards}</div>
                </article>`;
            })
            .join('');
    }

    private renderAlerts(state: GameState): void {
        const items = state.alerts.length > 0
            ? state.alerts.map((alert) => `<li class="is-bad">${escapeHtml(ALERT_LABELS[alert])}</li>`)
            : state.positiveStates.length > 0
              ? state.positiveStates.map((positive) => `<li class="is-good">${escapeHtml(POSITIVE_LABELS[positive])}</li>`)
              : ['<li class="is-neutral">Система пока не трещит. Можно аккуратно ускоряться.</li>'];

        this.elements.alerts.innerHTML = items.join('');
    }

    private renderLifeModes(state: GameState): void {
        this.elements.lifeModes.innerHTML = LIFE_MODES.map((mode) => {
            const active = mode.id === state.routine.lifeMode ? ' is-active' : '';
            return `<button class="s1-option-card${active}" type="button" data-life-mode="${mode.id}">
                <strong>${escapeHtml(mode.label)}</strong>
                <p>${escapeHtml(mode.description)}</p>
                <small>${escapeHtml(mode.bonus)} / ${escapeHtml(mode.risk)}</small>
            </button>`;
        }).join('');

        this.elements.lifeModes.querySelectorAll<HTMLElement>('[data-life-mode]').forEach((button) => {
            button.onclick = () => this.handlers.onLifeModeChange(button.dataset.lifeMode ?? '');
        });
    }

    private renderProjectFocus(state: GameState): void {
        this.elements.projectFocus.innerHTML = PROJECT_FOCUSES.map((focus) => {
            const active = focus.id === state.routine.projectFocus ? ' is-active' : '';
            return `<button class="s1-pill-button${active}" type="button" data-project-focus="${focus.id}">
                <span>${escapeHtml(focus.label)}</span>
                <small>${escapeHtml(focus.description)}</small>
            </button>`;
        }).join('');

        this.elements.projectFocus.querySelectorAll<HTMLElement>('[data-project-focus]').forEach((button) => {
            button.onclick = () => this.handlers.onProjectFocusChange(button.dataset.projectFocus ?? '');
        });
    }

    private renderSlots(state: GameState): void {
        const unlockedSlotCount = getUnlockedSlotCount(state);
        this.elements.slots.innerHTML = [0, 1]
            .map((index) => {
                const selected = state.routine.eveningSlots[index];
                const locked = index >= unlockedSlotCount;
                const options = SLOT_OPTIONS.map((slot) => {
                    const active = slot.id === selected ? ' is-active' : '';
                    return `<button class="s1-mini-card${active}" type="button" data-slot-index="${index}" data-slot-value="${slot.id}" ${locked ? 'disabled' : ''}>
                        <strong>${escapeHtml(slot.label)}</strong>
                        <small>${escapeHtml(slot.description)}</small>
                    </button>`;
                }).join('');

                return `<section class="s1-slot-card${locked ? ' is-locked' : ''}">
                    <header>
                        <strong>Вечерний слот ${index + 1}</strong>
                        <span>${locked ? 'заблокирован состоянием героя' : 'активен'}</span>
                    </header>
                    <div class="s1-mini-grid">${options}</div>
                </section>`;
            })
            .join('');

        this.elements.slots.querySelectorAll<HTMLElement>('[data-slot-value]').forEach((button) => {
            button.onclick = () => {
                const slotIndex = Number(button.dataset.slotIndex ?? 0);
                this.handlers.onSlotChange(slotIndex, button.dataset.slotValue ?? '');
            };
        });
    }

    private renderSocial(state: GameState): void {
        this.elements.social.innerHTML = CHARACTERS.map((character) => {
            const relationship = state.relationships[character.id];
            const selected = state.routine.socialPriority.includes(character.id) ? ' is-active' : '';
            const locked = relationship.unlocked ? '' : ' is-locked';

            return `<button class="s1-person-card${selected}${locked}" type="button" data-social-priority="${character.id}" ${relationship.unlocked ? '' : 'disabled'}>
                <div class="s1-person-head">
                    <strong>${escapeHtml(character.name)}</strong>
                    <span>${relationship.unlocked ? `bond ${relationship.bond}` : 'locked'}</span>
                </div>
                <p>${escapeHtml(character.role)}</p>
                <small>${escapeHtml(relationship.unlocked ? character.modifierLabel : character.unlockHint)}</small>
            </button>`;
        }).join('');

        this.elements.social.querySelectorAll<HTMLElement>('[data-social-priority]').forEach((button) => {
            button.onclick = () => this.handlers.onSocialPriorityToggle(button.dataset.socialPriority ?? '');
        });
    }

    private renderProject(state: GameState): void {
        const bars = [
            progressBar('clarity', state.project.clarity),
            progressBar('prototype', state.project.prototype),
            progressBar('quality', state.project.quality),
            progressBar('showability', state.project.showability),
        ].join('');

        this.elements.projectSummary.innerHTML = `
            <strong>${escapeHtml(state.project.stageLabel)}</strong>
            <p>Игрок не проживает день руками: он подкручивает life mode, слоты и social priority, а результат приходит через auto-tick.</p>
        `;
        this.elements.projectBars.innerHTML = bars;
    }

    private renderPeople(state: GameState): void {
        this.elements.people.innerHTML = CHARACTERS.filter((character) => state.relationships[character.id].unlocked)
            .map((character) => {
                const relationship = state.relationships[character.id];
                const ready = relationship.readiness >= 70 ? 'готов к контакту' : relationship.readiness >= 40 ? 'есть повод выйти' : 'пока в фоне';

                return `<article class="s1-relationship-card">
                    <div class="s1-person-head">
                        <strong>${escapeHtml(character.name)}</strong>
                        <span>${ready}</span>
                    </div>
                    <p>${escapeHtml(character.modifierLabel)}</p>
                    <div class="s1-relationship-meta">
                        <span>bond ${relationship.bond}</span>
                        <span>readiness ${relationship.readiness}</span>
                    </div>
                </article>`;
            })
            .join('');
    }

    private renderFeed(state: GameState): void {
        this.elements.feed.innerHTML = state.feed.slice(0, 5)
            .map((item) => `<article class="s1-feed-item">
                <small>День ${item.day}</small>
                <strong>${escapeHtml(item.title)}</strong>
                <p>${escapeHtml(item.summary)}</p>
            </article>`)
            .join('');
    }

    private renderMeta(state: GameState): void {
        this.elements.progressShelf.innerHTML = [
            shelfMetric('Life stability', state.progression.lifeStability),
            shelfMetric('Circle trust', state.circle.trust),
            shelfMetric('Group momentum', state.circle.momentum),
            shelfMetric('Room tier', state.room.tier),
        ].join('');
    }
}

function required(id: string): HTMLElement {
    const node = document.getElementById(id);
    if (!node) {
        throw new Error(`Missing required element: ${id}`);
    }
    return node;
}

function metricCard(label: string, value: number): string {
    const sign = value > 0 ? '+' : '';
    const className = value > 0 ? 'is-good' : value < 0 ? 'is-bad' : 'is-neutral';
    return `<span class="s1-metric-chip ${className}">${escapeHtml(label)} ${sign}${value}</span>`;
}

function progressBar(label: string, value: number): string {
    return `<article class="s1-progress-card">
        <div class="s1-progress-head">
            <strong>${escapeHtml(label)}</strong>
            <span>${value}/100</span>
        </div>
        <div class="s1-progress-track"><span style="width:${value}%"></span></div>
    </article>`;
}

function shelfMetric(label: string, value: number): string {
    return `<div class="s1-shelf-item"><span>${escapeHtml(label)}</span><strong>${value}</strong></div>`;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
