import { MAX_OFFLINE_DAYS, TICK_MS } from './content.js';
import { createProject, loadState, resetState, saveState } from './state.js';
import { resolveDays } from './ticks.js';
import { Season1UI } from './ui.js';
const boot = window.SEASON1_BOOTSTRAP ?? { playerName: 'Герой', isLoggedIn: false };
let state = loadState(boot);
const ui = new Season1UI({
    onActivityChange(mode) {
        state.activity = mode;
        persistAndRender();
    },
    onSocialTargetChange(id) {
        state.socialTarget = id;
        if (state.activity !== 'socialize') {
            state.activity = 'socialize';
        }
        persistAndRender();
    },
    onStartProject(genre, platform, size) {
        state.activeProject = createProject(genre, platform, size);
        if (state.activity !== 'work')
            state.activity = 'work';
        persistAndRender();
    },
    onDismissRelease() {
        state.pendingRelease = null;
        persistAndRender();
    },
    onAbandonProject() {
        state.activeProject = null;
        persistAndRender();
    },
    onReset() {
        state = resetState(boot);
        persistAndRender();
    },
});
// Catch up offline
const elapsed = Date.now() - state.meta.lastTickAt;
const offlineDays = Math.min(Math.floor(elapsed / TICK_MS), MAX_OFFLINE_DAYS);
if (offlineDays > 0) {
    resolveDays(state, offlineDays);
    saveState(state);
}
ui.render(state);
bindLogout();
// Auto-tick
window.setInterval(() => {
    if (state.pendingRelease)
        return; // pause while release screen open
    resolveDays(state, 1);
    persistAndRender();
}, TICK_MS);
function persistAndRender() {
    state.meta.lastTickAt = Date.now();
    saveState(state);
    ui.render(state);
}
function bindLogout() {
    const btn = document.getElementById('logoutBtn');
    if (!btn)
        return;
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await fetch('ajax/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: 'action=logout',
                credentials: 'same-origin',
            });
        }
        finally {
            window.location.href = 'auth.php';
        }
    });
}
