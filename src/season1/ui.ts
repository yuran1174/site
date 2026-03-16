import { ACTIVITY_DATA, CHARACTER_DATA, GENRE_DATA, PLATFORM_DATA, SIZE_DATA } from './content.js';
import type { ActivityMode, CharacterId, GameState, ProjectGenre, ProjectPlatform, ProjectSize, UIHandlers } from './types.js';

export class Season1UI {
    private readonly handlers: UIHandlers;
    private pendingGenre: ProjectGenre = 'arcade';
    private pendingPlatform: ProjectPlatform = 'pc';
    private pendingSize: ProjectSize = 'small';

    constructor(handlers: UIHandlers) {
        this.handlers = handlers;
    }

    render(state: GameState): void {
        this.renderBar(state);
        this.renderDev(state);
        this.renderStudio(state);
        this.renderControls(state);
        this.renderEvents(state);
    }

    private renderBar(state: GameState): void {
        setBarVal('s1Day',   `День ${state.day}`);
        setBarVal('s1Money', fmt(state.money) + ' ₽');
        setBarVal('s1Fans',  String(state.fans));
        setBarVal('s1Rep',   String(state.rep));

        const statusEl = document.getElementById('s1TickStatus');
        if (statusEl) {
            if (state.pendingRelease) {
                statusEl.textContent = '⏸ релиз';
                statusEl.className = 's1-tick-status is-paused';
            } else if (state.stats.endurance < 20) {
                statusEl.textContent = '⚠ усталость';
                statusEl.className = 's1-tick-status is-warn';
            } else if (state.money < 300) {
                statusEl.textContent = '⚠ деньги';
                statusEl.className = 's1-tick-status is-warn';
            } else {
                statusEl.textContent = '● авто';
                statusEl.className = 's1-tick-status is-ok';
            }
        }
    }

    private renderDev(state: GameState): void {
        const s = state.stats;
        const portraitEl = document.getElementById('s1DevPortrait');
        if (portraitEl) {
            const mood = s.endurance > 60 ? 'fresh' : s.endurance > 30 ? 'tired' : 'dead';
            portraitEl.dataset.mood = mood;
            portraitEl.querySelector('.s1-portrait-emoji')!.textContent =
                mood === 'fresh' ? '🧑‍💻' : mood === 'tired' ? '😪' : '💀';
            portraitEl.querySelector('.s1-portrait-state')!.textContent =
                mood === 'fresh' ? 'в потоке' : mood === 'tired' ? 'устал' : 'мертвец';
        }

        renderStat('s1StatCoding',   s.coding,    'coding');
        renderStat('s1StatDesign',   s.design,    'design');
        renderStat('s1StatEndurance',s.endurance, 'endurance');

        setText('s1PortfolioCount', `${state.completedProjects.length} проект${pluralRu(state.completedProjects.length)}`);

        const studioNames = ['Спальня', 'Home Studio', 'Студия'];
        setText('s1StudioTier', studioNames[state.studioTier - 1] ?? '');

        this.renderPortfolio(state);
    }

    private renderPortfolio(state: GameState): void {
        const el = document.getElementById('s1Portfolio');
        if (!el) return;
        if (state.completedProjects.length === 0) {
            el.innerHTML = `<p class="s1-empty-hint">Ни одного релиза. Пора начать.</p>`;
            return;
        }
        el.innerHTML = state.completedProjects.slice().reverse().map(p => {
            const genre = GENRE_DATA[p.genre];
            const stars = ratingStars(p.rating);
            return `<div class="s1-portfolio-item">
                <span class="s1-pi-icon">${genre.icon}</span>
                <div class="s1-pi-info">
                    <span class="s1-pi-name">${esc(p.name)}</span>
                    <span class="s1-pi-meta">${stars} ${p.rating.toFixed(1)}</span>
                </div>
                <span class="s1-pi-earn">${fmt(p.earnings)} ₽</span>
            </div>`;
        }).join('');
    }

    private renderStudio(state: GameState): void {
        const studioEl = document.getElementById('s1StudioPanel');
        if (!studioEl) return;

        if (state.pendingRelease) {
            const r = state.pendingRelease;
            const genre = GENRE_DATA[r.genre];
            const platform = PLATFORM_DATA[r.platform];
            studioEl.innerHTML = `
                <div class="s1-release-screen" id="s1ReleaseScreen">
                    <div class="s1-release-kicker">🚀 РЕЛИЗ!</div>
                    <div class="s1-release-name">${esc(r.name)}</div>
                    <div class="s1-release-meta">${genre.icon} ${genre.label} &nbsp;·&nbsp; ${platform.icon} ${platform.label}</div>
                    <div class="s1-release-rating">
                        <div class="s1-stars">${ratingStars(r.rating)}</div>
                        <div class="s1-rating-num">${r.rating.toFixed(1)}<span> / 10</span></div>
                    </div>
                    <div class="s1-release-rewards">
                        <div class="s1-reward-row is-money">💰 <strong>+${fmt(r.earnings)} ₽</strong></div>
                        <div class="s1-reward-row is-fans">👥 <strong>+${r.fans} фанатов</strong></div>
                        <div class="s1-reward-row is-rep">⭐ <strong>+${r.repGain} репутации</strong></div>
                    </div>
                    <blockquote class="s1-review-quote">"${esc(r.reviewQuote)}"</blockquote>
                    <button class="s1-release-btn" id="s1DismissRelease">Принять релиз</button>
                </div>`;
            document.getElementById('s1DismissRelease')?.addEventListener('click', () => this.handlers.onDismissRelease());
            return;
        }

        if (state.activeProject) {
            const p = state.activeProject;
            const genre = GENRE_DATA[p.genre];
            const platform = PLATFORM_DATA[p.platform];
            const size = SIZE_DATA[p.size];
            const pct = Math.round(p.progress);
            const estRating = estimateRating(state);

            studioEl.innerHTML = `
                <div class="s1-active-project">
                    <div class="s1-ap-header">
                        <div class="s1-ap-icon">${genre.icon}</div>
                        <div class="s1-ap-info">
                            <div class="s1-ap-name">${esc(p.name)}</div>
                            <div class="s1-ap-meta">${genre.label} &nbsp;·&nbsp; ${platform.icon} ${platform.label} &nbsp;·&nbsp; ${size.label}</div>
                        </div>
                    </div>
                    <div class="s1-progress-section">
                        <div class="s1-progress-label">
                            <span>Прогресс</span>
                            <span>${pct}%</span>
                        </div>
                        <div class="s1-progress-track" role="progressbar" aria-valuenow="${pct}">
                            <div class="s1-progress-fill" style="width:${pct}%"></div>
                        </div>
                    </div>
                    <div class="s1-ap-quality">
                        <div class="s1-quality-row">
                            <span class="s1-ql-label">Качество кода</span>
                            <div class="s1-ql-bar"><div class="s1-ql-fill is-code" style="width:${clampPct(p.daysSpent > 0 ? p.codingAccum / p.daysSpent : 0)}%"></div></div>
                            <span class="s1-ql-val">${Math.round(p.daysSpent > 0 ? p.codingAccum / p.daysSpent : 0)}</span>
                        </div>
                        <div class="s1-quality-row">
                            <span class="s1-ql-label">Дизайн</span>
                            <div class="s1-ql-bar"><div class="s1-ql-fill is-design" style="width:${clampPct(p.daysSpent > 0 ? p.designAccum / p.daysSpent : 0)}%"></div></div>
                            <span class="s1-ql-val">${Math.round(p.daysSpent > 0 ? p.designAccum / p.daysSpent : 0)}</span>
                        </div>
                    </div>
                    <div class="s1-ap-footer">
                        <span>День ${p.daysSpent} из ~${p.daysRequired}</span>
                        <span class="s1-est-rating">Примерный рейтинг: <strong>${estRating}</strong></span>
                    </div>
                    <button class="s1-abandon-btn" id="s1AbandonProject">Бросить проект</button>
                </div>`;
            document.getElementById('s1AbandonProject')?.addEventListener('click', () => {
                if (confirm('Бросить проект? Прогресс потеряется.')) this.handlers.onAbandonProject();
            });
            return;
        }

        // Project selector
        studioEl.innerHTML = this.buildProjectSelector();
        this.bindProjectSelector();
    }

    private buildProjectSelector(): string {
        const genres = (Object.keys(GENRE_DATA) as ProjectGenre[]);
        const platforms = (Object.keys(PLATFORM_DATA) as ProjectPlatform[]);
        const sizes = (Object.keys(SIZE_DATA) as ProjectSize[]);

        const genreButtons = genres.map(g => {
            const d = GENRE_DATA[g];
            const active = g === this.pendingGenre ? ' is-active' : '';
            return `<button class="s1-sel-chip${active}" data-genre="${g}">${d.icon} ${d.label}</button>`;
        }).join('');

        const platformButtons = platforms.map(p => {
            const d = PLATFORM_DATA[p];
            const active = p === this.pendingPlatform ? ' is-active' : '';
            return `<button class="s1-sel-chip${active}" data-platform="${p}">${d.icon} ${d.label}</button>`;
        }).join('');

        const sizeCards = sizes.map(s => {
            const d = SIZE_DATA[s];
            const active = s === this.pendingSize ? ' is-active' : '';
            return `<button class="s1-size-card${active}" data-size="${s}">
                <strong>${d.label}</strong>
                <span>${d.days} дней</span>
                <small>до ${fmt(d.baseEarnings)} ₽</small>
            </button>`;
        }).join('');

        const namePreview = generateProjectPreview(this.pendingGenre);

        return `
            <div class="s1-project-selector">
                <div class="s1-sel-header">Новый проект</div>
                <div class="s1-sel-section">
                    <div class="s1-sel-label">Жанр</div>
                    <div class="s1-sel-row" id="s1GenreRow">${genreButtons}</div>
                </div>
                <div class="s1-sel-section">
                    <div class="s1-sel-label">Платформа</div>
                    <div class="s1-sel-row" id="s1PlatformRow">${platformButtons}</div>
                </div>
                <div class="s1-sel-section">
                    <div class="s1-sel-label">Масштаб</div>
                    <div class="s1-size-row" id="s1SizeRow">${sizeCards}</div>
                </div>
                <div class="s1-sel-preview">
                    <span class="s1-sel-preview-name" id="s1NamePreview">${esc(namePreview)}</span>
                    <small>рабочее название</small>
                </div>
                <button class="s1-start-btn" id="s1StartProject">▶ Начать разработку</button>
            </div>`;
    }

    private bindProjectSelector(): void {
        document.getElementById('s1GenreRow')?.querySelectorAll<HTMLElement>('[data-genre]').forEach(btn => {
            btn.onclick = () => {
                this.pendingGenre = btn.dataset.genre as ProjectGenre;
                document.getElementById('s1GenreRow')?.querySelectorAll('.s1-sel-chip').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                const preview = document.getElementById('s1NamePreview');
                if (preview) preview.textContent = generateProjectPreview(this.pendingGenre);
            };
        });
        document.getElementById('s1PlatformRow')?.querySelectorAll<HTMLElement>('[data-platform]').forEach(btn => {
            btn.onclick = () => {
                this.pendingPlatform = btn.dataset.platform as ProjectPlatform;
                document.getElementById('s1PlatformRow')?.querySelectorAll('.s1-sel-chip').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
            };
        });
        document.getElementById('s1SizeRow')?.querySelectorAll<HTMLElement>('[data-size]').forEach(btn => {
            btn.onclick = () => {
                this.pendingSize = btn.dataset.size as ProjectSize;
                document.getElementById('s1SizeRow')?.querySelectorAll('.s1-size-card').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
            };
        });
        document.getElementById('s1StartProject')?.addEventListener('click', () => {
            this.handlers.onStartProject(this.pendingGenre, this.pendingPlatform, this.pendingSize);
        });
    }

    private renderControls(state: GameState): void {
        this.renderActivity(state);
        this.renderTeam(state);
    }

    private renderActivity(state: GameState): void {
        const el = document.getElementById('s1ActivityList');
        if (!el) return;
        el.innerHTML = (Object.keys(ACTIVITY_DATA) as ActivityMode[]).map(mode => {
            const d = ACTIVITY_DATA[mode];
            const active = mode === state.activity ? ' is-active' : '';
            const disabled = mode === 'work' && !state.activeProject ? ' is-disabled' : '';
            return `<button class="s1-activity-btn${active}${disabled}" data-mode="${mode}" ${disabled ? 'disabled' : ''}>
                <span class="s1-act-icon">${d.icon}</span>
                <span class="s1-act-label">${d.label}</span>
                <span class="s1-act-hint">${d.hint}</span>
            </button>`;
        }).join('');
        el.querySelectorAll<HTMLElement>('[data-mode]').forEach(btn => {
            btn.onclick = () => this.handlers.onActivityChange(btn.dataset.mode as ActivityMode);
        });
    }

    private renderTeam(state: GameState): void {
        const el = document.getElementById('s1TeamList');
        if (!el) return;
        const characters = (['max', 'zheka', 'zhora'] as CharacterId[]);
        el.innerHTML = characters.map(id => {
            const d = CHARACTER_DATA[id];
            const c = state.characters[id];
            if (!c.unlocked) {
                return `<div class="s1-char-card is-locked">
                    <div class="s1-char-avatar is-locked">?</div>
                    <div class="s1-char-info">
                        <span class="s1-char-unlock">${esc(d.unlockDesc)}</span>
                        <span class="s1-char-bonus">${esc(d.bonus)}</span>
                    </div>
                </div>`;
            }
            const isSocialTarget = state.socialTarget === id && state.activity === 'socialize';
            const active = isSocialTarget ? ' is-selected' : '';
            const bondBar = `<div class="s1-bond-bar"><div class="s1-bond-fill" style="width:${c.bond * 10}%"></div></div>`;
            return `<button class="s1-char-card${active}" data-char="${id}">
                <div class="s1-char-avatar">${charEmoji(id)}</div>
                <div class="s1-char-info">
                    <span class="s1-char-name">${esc(d.name)}</span>
                    <span class="s1-char-role">${esc(d.role)}</span>
                    <span class="s1-char-bonus">${esc(d.bonus)}</span>
                    ${bondBar}
                </div>
            </button>`;
        }).join('');
        el.querySelectorAll<HTMLElement>('[data-char]').forEach(btn => {
            btn.onclick = () => this.handlers.onSocialTargetChange(btn.dataset.char as CharacterId);
        });
    }

    private renderEvents(state: GameState): void {
        const el = document.getElementById('s1EventLog');
        if (!el) return;
        if (state.events.length === 0) {
            el.innerHTML = `<p class="s1-empty-hint">Пока всё тихо.</p>`;
            return;
        }
        el.innerHTML = state.events.map(e => `
            <div class="s1-event is-${e.kind}">
                <span class="s1-ev-day">День ${e.day}</span>
                <span class="s1-ev-title">${esc(e.title)}</span>
                <span class="s1-ev-body">${esc(e.body)}</span>
            </div>`).join('');
    }
}

// ── helpers ───────────────────────────────────────────────────────────────────

function setText(id: string, text: string): void {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setBarVal(cellId: string, text: string): void {
    const el = document.getElementById(cellId)?.querySelector<HTMLElement>('.s1-bar-val');
    if (el) el.textContent = text;
}

function renderStat(id: string, value: number, type: string): void {
    const row = document.getElementById(id);
    if (!row) return;
    const numEl = row.querySelector<HTMLElement>('.s1-stat-num');
    const fillEl = row.querySelector<HTMLElement>('.s1-stat-fill');
    if (numEl) numEl.textContent = Math.round(value).toString();
    if (fillEl) fillEl.style.width = `${Math.round(value)}%`;
    row.dataset.type = type;
}

function ratingStars(rating: number): string {
    const full = Math.round(rating);
    return Array.from({ length: 10 }, (_, i) => i < full ? '★' : '☆').join('');
}

function fmt(n: number): string {
    return n.toLocaleString('ru-RU');
}

function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function clampPct(v: number): number {
    return Math.min(100, Math.max(0, v));
}

function pluralRu(n: number): string {
    const abs = Math.abs(n);
    const mod10 = abs % 10;
    const mod100 = abs % 100;
    if (mod100 >= 11 && mod100 <= 19) return 'ов';
    if (mod10 === 1) return '';
    if (mod10 >= 2 && mod10 <= 4) return 'а';
    return 'ов';
}

function charEmoji(id: string): string {
    const map: Record<string, string> = { max: '🎨', zheka: '🔍', zhora: '📣' };
    return map[id] ?? '👤';
}

function estimateRating(state: GameState): string {
    const p = state.activeProject;
    if (!p || p.daysSpent === 0) return '?';
    const genre = GENRE_DATA[p.genre];
    const avgC = p.codingAccum / p.daysSpent;
    const avgD = p.designAccum / p.daysSpent;
    const q = avgC * genre.codingW + avgD * genre.designW;
    const raw = 1 + (q / 100) * 9;
    if (raw >= 8) return '😍 Отлично';
    if (raw >= 6) return '🙂 Неплохо';
    if (raw >= 4) return '😐 Средне';
    return '😬 Слабо';
}

function generateProjectPreview(genre: ProjectGenre): string {
    const { generateProjectName } = { generateProjectName: (g: ProjectGenre) => {
        const prefixes = ['Очередной', 'Амбициозный', 'Скромный', 'Дерзкий'];
        const nouns: Record<ProjectGenre, string[]> = {
            arcade: ['Флапи-клон', 'Раннер'],
            rpg: ['Рогалик', 'JRPG'],
            puzzle: ['Пазл', 'Матч-3'],
            sim: ['Тайкун', 'Симулятор'],
            platformer: ['Платформер', 'Метроидвания'],
            visual_novel: ['Визуальная новелла', 'Дейтинг-сим'],
        };
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${(nouns[g] ?? ['Проект'])[Math.floor(Math.random() * 2)]}`;
    }};
    return generateProjectName(genre);
}
