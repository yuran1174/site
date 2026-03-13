import { CYCLE_MS, LIFE_MODES, PROJECT_FOCUSES } from './content.js';
import { PhaserRoomStage } from './phaser-room-stage.js';
import { getOfflineCycleCount, loadState, resetState, saveState, toggleSocialPriority } from './state.js';
import { resolveCycles, resolveSingleCycle } from './ticks.js';
import { SeasonOneUi } from './ui.js';
const boot = window.SEASON1_BOOTSTRAP ?? { playerName: 'Герой', isLoggedIn: false };
let state = loadState(boot);
const ui = new SeasonOneUi({
    onLifeModeChange(value) {
        if (LIFE_MODES.some((mode) => mode.id === value)) {
            state.routine.lifeMode = value;
            persistAndRender();
        }
    },
    onProjectFocusChange(value) {
        if (PROJECT_FOCUSES.some((focus) => focus.id === value)) {
            state.routine.projectFocus = value;
            persistAndRender();
        }
    },
    onSlotChange(index, value) {
        state.routine.eveningSlots[index] = value;
        persistAndRender();
    },
    onSocialPriorityToggle(value) {
        toggleSocialPriority(state, value);
        persistAndRender();
    },
    onRunCycle() {
        resolveSingleCycle(state);
        persistAndRender();
    },
    onReset() {
        state = resetState(boot);
        persistAndRender();
    },
});
const roomStage = new PhaserRoomStage('s1PhaserStage');
resolveCycles(state, getOfflineCycleCount(state));
saveState(state);
document.addEventListener('DOMContentLoaded', () => {
    roomStage.mount(state);
    bindLogout();
    persistAndRender();
    window.setInterval(() => {
        resolveSingleCycle(state);
        persistAndRender();
    }, CYCLE_MS);
});
function persistAndRender() {
    state.meta.lastResolvedAt = Date.now();
    saveState(state);
    ui.render(state);
    roomStage.render(state);
}
function bindLogout() {
    const logoutButton = document.getElementById('logoutBtn');
    if (!logoutButton) {
        return;
    }
    logoutButton.addEventListener('click', async (event) => {
        event.preventDefault();
        try {
            await fetch('ajax/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                body: 'action=logout',
                credentials: 'same-origin',
            });
        }
        finally {
            window.location.href = 'auth.php';
        }
    });
}
