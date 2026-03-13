class RoomScene {
    constructor(scene) {
        this.snapshot = null;
        this.scene = scene;
    }
    create() {
        this.graphics = this.scene.add.graphics();
        this.hero = this.scene.add.rectangle(214, 248, 36, 74, 0xef7e57).setStrokeStyle(3, 0xf8d28d);
        this.cat = this.scene.add.rectangle(360, 266, 28, 24, 0xe1a257).setStrokeStyle(2, 0x4b2e1c);
        this.label = this.scene.add.text(20, 18, '', { fontFamily: 'JetBrains Mono', fontSize: '14px', color: '#f5e7cc' });
        this.moodStrip = this.scene.add.rectangle(104, 30, 160, 10, 0x5b7857).setOrigin(0, 0.5);
        this.scene.tweens.add({
            targets: this.hero,
            y: 244,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        this.scene.tweens.add({
            targets: this.cat,
            x: 364,
            duration: 1400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }
    updateSnapshot(snapshot) {
        this.snapshot = snapshot;
        this.redraw();
    }
    redraw() {
        if (!this.snapshot) {
            return;
        }
        const { energy, stress, order, mode, project, showability, peopleGlow, cycleStable } = this.snapshot;
        const g = this.graphics;
        g.clear();
        const wallTint = order > 58 ? 0x31453d : order > 38 ? 0x37404f : 0x453339;
        const floorTint = cycleStable ? 0x2d241c : 0x231d18;
        const windowTint = showability > 46 ? 0xf6b35a : peopleGlow ? 0x78d0c7 : 0x5b7ea5;
        const monitorTint = project > 42 ? 0x44e6b5 : 0x6db4ff;
        const clutterTint = order < 35 ? 0x7c4e3f : 0x456b4d;
        g.fillStyle(wallTint, 1);
        g.fillRect(0, 0, 480, 202);
        g.fillStyle(floorTint, 1);
        g.fillRect(0, 202, 480, 118);
        g.fillStyle(windowTint, 1);
        g.fillRoundedRect(326, 34, 98, 88, 14);
        g.fillStyle(0x1c222c, 1);
        g.fillRoundedRect(42, 180, 168, 12, 6);
        g.fillStyle(monitorTint, 1);
        g.fillRoundedRect(56, 124, 86, 52, 8);
        g.fillStyle(0x4e566d, 1);
        g.fillRoundedRect(300, 214, 116, 42, 12);
        g.fillStyle(clutterTint, 1);
        g.fillRoundedRect(270, 240, 38, 18, 8);
        g.fillRoundedRect(180, 210, 28, 16, 6);
        g.fillStyle(0x111722, 0.45);
        g.fillCircle(260, 114, stress > 62 ? 34 : 22);
        this.hero.setFillStyle(mode === 'project_focus' ? 0x6f86ff : mode === 'people_focus' ? 0x4eb88c : 0xef7e57);
        this.hero.setScale(1, energy < 30 ? 0.88 : 1);
        this.cat.setAlpha(energy < 36 ? 1 : 0.9);
        this.label.setText(`ROOM STAGE  energy ${energy}  mode: ${mode}`);
        this.moodStrip.setFillStyle(cycleStable ? 0x71c38c : 0xc38055);
        this.moodStrip.width = 72 + Math.round(order * 1.4);
    }
}
export class PhaserRoomStage {
    constructor(containerId) {
        this.game = null;
        this.containerId = containerId;
    }
    mount(initialState) {
        if (!window.Phaser || this.game) {
            return;
        }
        window.__season1StageSnapshot = this.makeSnapshot(initialState);
        this.game = new window.Phaser.Game({
            type: window.Phaser.AUTO,
            parent: this.containerId,
            width: 480,
            height: 320,
            transparent: true,
            backgroundColor: '#15130f',
            scale: {
                mode: window.Phaser.Scale.FIT,
                autoCenter: window.Phaser.Scale.CENTER_BOTH,
            },
            scene: [
                {
                    create() {
                        const roomScene = new RoomScene(this);
                        roomScene.create();
                        roomScene.updateSnapshot(window.__season1StageSnapshot);
                        window.__season1RoomScene = roomScene;
                    },
                },
            ],
        });
    }
    render(state) {
        window.__season1StageSnapshot = this.makeSnapshot(state);
        const roomScene = window.__season1RoomScene;
        roomScene?.updateSnapshot(this.makeSnapshot(state));
    }
    makeSnapshot(state) {
        return {
            energy: state.resources.energy,
            stress: state.resources.stress,
            order: state.room.order,
            mode: state.routine.lifeMode,
            project: state.project.prototype,
            showability: state.project.showability,
            peopleGlow: state.routine.lifeMode === 'people_focus' || state.routine.eveningSlots.includes('group_slot'),
            cycleStable: state.positiveStates.includes('stable_routine'),
        };
    }
}
