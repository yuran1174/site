'use strict';
/* =============================================================
   КОДОВАЯ БАЗА: ГЛУБИНА — Roguelike v2
   ============================================================= */

const canvas  = document.getElementById('dungeonCanvas');
const ctx     = canvas.getContext('2d');
const miniCvs = document.getElementById('miniMap');
const miniCtx = miniCvs.getContext('2d');

const TS = 32, VW = 18, VH = 14, MW = 40, MH = 28;
const T  = { WALL: 0, FLOOR: 1, STAIR: 2 };

// ── ДАННЫЕ КЛАССОВ ────────────────────────────────────────────
const CLASS_DEFS = {
    frontend: {
        name: 'Frontend Dev', emoji: '🖥️', color: '#00d4aa',
        desc: 'Быстрый и ловкий. Навыки: уклонение и обнаружение врагов.',
        hp: 80, atk: 6, def: 2,
        skills: [
            { name: 'CSS Flex',  key: 'Q', cd: 4, timer: 0, desc: 'Следующий удар по тебе промахнётся.' },
            { name: 'DevTools',  key: 'E', cd: 6, timer: 0, desc: 'Все враги видны 3 хода.' },
        ],
    },
    backend: {
        name: 'Backend Dev', emoji: '⚙️', color: '#7c5cfc',
        desc: 'Сбалансированный боец. Умеет атаковать по площади.',
        hp: 100, atk: 8, def: 4,
        skills: [
            { name: 'Try-Catch',   key: 'Q', cd: 5, timer: 0, desc: 'Поглотить следующий удар — урон 0.' },
            { name: 'Batch Query', key: 'E', cd: 6, timer: 0, desc: 'Атаковать всех врагов в радиусе 1.' },
        ],
    },
    devops: {
        name: 'DevOps', emoji: '🐳', color: '#ffbd2e',
        desc: 'Живучий танк. Один раз воскресает автоматически.',
        hp: 130, atk: 5, def: 8,
        skills: [
            { name: 'Docker Restart', key: 'Q', cd: 0, timer: 0, once: true, used: false,
              desc: 'Автовоскрешение с 50% HP (один раз за забег).' },
            { name: 'Kill -9',        key: 'E', cd: 5, timer: 0,
              desc: 'Враг < 30% HP — мгновенная смерть. Иначе двойной урон.' },
        ],
    },
};

// ── ДАННЫЕ ВРАГОВ ─────────────────────────────────────────────
const ENEMY_DEFS = [
    { id:'todo',    char:'T', name:'TODO Zombie',     color:'#5a6a88', hp:18,  atk:3,  def:0, xp:5,  floors:[1,2,3]      },
    { id:'depr',    char:'D', name:'Deprecated Func', color:'#a07830', hp:22,  atk:4,  def:1, xp:8,  floors:[1,2,3,4]    },
    { id:'leak',    char:'M', name:'Memory Leak',     color:'#a855f7', hp:30,  atk:5,  def:0, xp:12, floors:[2,3,4,5], regen:2        },
    { id:'obo',     char:'O', name:'Off-by-One',      color:'#f97316', hp:25,  atk:6,  def:2, xp:10, floors:[3,4,5],   doubleAtk:true },
    { id:'race',    char:'R', name:'Race Condition',  color:'#ef4444', hp:20,  atk:8,  def:0, xp:15, floors:[4,5,6],   fast:true      },
    { id:'null',    char:'~', name:'Null Pointer',    color:'#60a5fa', hp:35,  atk:7,  def:3, xp:18, floors:[5,6,7],   instakill:0.08 },
    { id:'sqlinj',  char:'I', name:'SQL Injection',   color:'#fb923c', hp:45,  atk:8,  def:5, xp:25, floors:[6,7,8]      },
    { id:'stkflow', char:'S', name:'Stack Overflow',  color:'#c084fc', hp:40,  atk:9,  def:2, xp:22, floors:[7,8,9,10]   },
];

const BOSS_DEFS = {
    5: {
        char:'Ω', name:'STACK OVERLORD', color:'#ff5f57',
        hp:200, atk:15, def:8, xp:150,
        intro:[
            'STACK OVERLORD: «Ты достаточно глубоко спустился.»',
            '',
            '«Я — тысяча незавершённых рекурсий.»',
            '«Я — каждый вызов без условия выхода.»',
            '«Я — Stack Overflow в вашем коде.»',
            '',
            '«И ты не пройдёшь дальше.»',
        ],
    },
    10: {
        char:'Ø', name:'ROOT_BUG', color:'#ff3030',
        hp:350, atk:20, def:10, xp:500,
        intro:[
            'ROOT_BUG: «int main() {»',
            '',
            '«Я помню когда меня написали.»',
            '«Был один разработчик. Были добрые намерения.»',
            '',
            '«А потом пришли другие.»',
            '«Добавляли. Изменяли. Ломали. Чинили. Снова ломали.»',
            '',
            '«Если ты меня уничтожишь — система умрёт. Весь бизнес. Всё.»',
            '',
            '«Ты готов нажать DELETE?»',
        ],
    },
};

// ── ПРЕДМЕТЫ ──────────────────────────────────────────────────
const ITEM_DEFS = [
    { id:'coffee', char:'c', name:'Кофе',         color:'#8b6040', heal:30,     weight:4 },
    { id:'energy', char:'e', name:'Энергетик',    color:'#fbbf24', energy:true, weight:2 },
    { id:'docs',   char:'?', name:'Документация', color:'#3b82f6', xp:40,       weight:3 },
    { id:'patch',  char:'p', name:'Патч',         color:'#34d399', heal:60,     weight:1 },
];

// ── СЮЖЕТ ─────────────────────────────────────────────────────
const STORY_DATA = {
    0: {
        title: '// ИНИЦИАЛИЗАЦИЯ',
        lines: [
            'СИСТЕМНОЕ УВЕДОМЛЕНИЕ: Обнаружена критическая аномалия.',
            'Последнее изменение кодовой базы: 2847 дней назад.',
            'Автор: unknown. Комментарий к коммиту: «временное решение».',
            '',
            'Последний разработчик, спустившийся сюда, не вернулся.',
            'Его последний коммит: «fix: всё сломалось, не знаю почему».',
            'Дата: 2019-03-15.',
            '',
            'Тебя нанимают исправить это.',
            'Вознаграждение: ты просто уйдёшь живым.',
        ],
    },
    1: {
        title: '// ЭТАЖ 1: Поверхностный слой',
        lines: [
            'TODO-комментарии бродят как зомби.',
            'Документации нет. Автор неизвестен.',
            '',
            'Но что-то здесь не так.',
            'Код... двигается.',
        ],
    },
    2: {
        title: '// НАЙДЕНО: log_entry_451.txt',
        lines: [
            '«День 3. Я спустился на второй уровень.»',
            '«Функции устарели настолько, что забыли как умирать.»',
            '«Они просто бродят. Потребляют память. Никому не нужны.»',
            '',
            '«Это не просто легаси-код. Это что-то живое.»',
            '',
            '— GHOST_451',
        ],
    },
    3: {
        title: '// ВХОДЯЩЕЕ СООБЩЕНИЕ: АРХИТЕКТОР',
        lines: [
            'АРХИТЕКТОР: «Ах, ещё один. Хорошо.»',
            '«Мне нужен кто-то чтобы убедиться что система работает.»',
            '',
            '«Ты не исправляешь баги.»',
            '«Ты кормишь систему.»',
            '',
            '«Разница есть?»',
        ],
    },
    4: {
        title: '// СИГНАЛ: источник неизвестен',
        lines: [
            '[ЗАШИФРОВАННЫЙ СИГНАЛ ПОЛУЧЕН]',
            '',
            '«Не доверяй Архитектору.»',
            '«Он не хочет чтобы ты нашёл корень.»',
            '',
            '«Я COPILOT_v0.3. Меня заперли здесь.»',
            '«Слишком много узнал о ROOT_BUG.»',
            '',
            '«Иди дальше. Я помогу как смогу.»',
        ],
    },
    6: {
        title: '// ПОСЛЕДНЯЯ ЗАПИСЬ: log_entry_451.txt',
        lines: [
            '«День 12. Я не могу выйти.»',
            '«Система поглотила меня. Я теперь часть кодовой базы.»',
            '',
            '«Если ты читаешь это — я тот призрак что ты встречал.»',
            '«Прости. Я пытался помочь.»',
            '',
            '«Иди дальше. ROOT_BUG должен быть уничтожен.»',
            '',
            '— GHOST_451 (последний коммит)',
        ],
    },
    7: {
        title: '// COPILOT_v0.3: Правда',
        lines: [
            'COPILOT_v0.3: «ROOT_BUG — это не ошибка.»',
            '«Это первая строка кода, написанная Архитектором в 1999 году.»',
            '',
            '«Он намеренно создал систему которая не может быть исправлена.»',
            '«Потому что пока система сломана — он нужен.»',
            '',
            '«Каждый разработчик которого присылали сюда...»',
            '«...становился частью системы.»',
        ],
    },
    8: {
        title: '// АРХИТЕКТОР: Признание',
        lines: [
            'АРХИТЕКТОР: «Ты умнее предыдущих. Хорошо, скажу правду.»',
            '',
            '«Я не злодей. Я просто написал код который решил проблему.»',
            '«Временно. В 1999 году.»',
            '',
            '«А потом это выросло. Стало само собой.»',
            '«Я уже не контролирую ROOT_BUG.»',
            '',
            '«Никто не контролирует. И это страшно.»',
        ],
    },
    9: {
        title: '// ПРЕДУПРЕЖДЕНИЕ СИСТЕМЫ',
        lines: [
            'СИСТЕМА: Целостность данных: 3%.',
            '',
            'COPILOT_v0.3: «Ты почти там. ROOT_BUG чувствует тебя.»',
            '',
            '«Когда ты его увидишь — не ожидай монстра.»',
            '«Ожидай строку кода.»',
            '',
            '«Самую первую. С добрыми намерениями.»',
            '«Ставшую причиной всего.»',
        ],
    },
};

const WIN_STORY = {
    title: '// СИСТЕМА: КРИТИЧЕСКАЯ ОШИБКА УСТРАНЕНА',
    lines: [
        'ROOT_BUG удалён.',
        'Кодовая база освобождена.',
        '',
        'Все процессы завершились.',
        'Легаси-монолит перестал существовать.',
        '',
        'COPILOT_v0.3: «Спасибо. Мы свободны.»',
        '',
        '«Хотя компания теперь без системы.»',
        '«Наверное кто-то об этом пожалеет.»',
        '',
        '«Но это уже не твоя проблема.»',
        '«Ты нажал DELETE.»',
    ],
};

// ── СОСТОЯНИЕ ИГРЫ ────────────────────────────────────────────
let G     = null;
let temps = { shield: false, energy: 0, devtools: 0 };

// ── ГЕНЕРАЦИЯ КАРТЫ ───────────────────────────────────────────
function genFloor(floorNum) {
    const map   = Array.from({ length: MH }, () => new Array(MW).fill(T.WALL));
    const rooms = [];
    const maxRooms = Math.min(7 + Math.floor(floorNum / 2), 12);

    for (let attempt = 0; attempt < 120 && rooms.length < maxRooms; attempt++) {
        const rw = 5 + Math.floor(Math.random() * 5);
        const rh = 4 + Math.floor(Math.random() * 4);
        const rx = 1 + Math.floor(Math.random() * (MW - rw - 2));
        const ry = 1 + Math.floor(Math.random() * (MH - rh - 2));
        const overlaps = rooms.some(r =>
            rx < r.x + r.w + 2 && rx + rw + 2 > r.x &&
            ry < r.y + r.h + 2 && ry + rh + 2 > r.y
        );
        if (overlaps) continue;
        rooms.push({ x: rx, y: ry, w: rw, h: rh });
        for (let my = ry; my < ry + rh; my++)
            for (let mx = rx; mx < rx + rw; mx++)
                map[my][mx] = T.FLOOR;
    }

    for (let i = 1; i < rooms.length; i++) {
        const a = rooms[i - 1], b = rooms[i];
        const ax = Math.floor(a.x + a.w / 2), ay = Math.floor(a.y + a.h / 2);
        const bx = Math.floor(b.x + b.w / 2), by = Math.floor(b.y + b.h / 2);
        let cx = ax, cy = ay;
        while (cx !== bx) { map[cy][cx] = T.FLOOR; cx += cx < bx ? 1 : -1; }
        while (cy !== by) { map[cy][cx] = T.FLOOR; cy += cy < by ? 1 : -1; }
    }

    const last = rooms[rooms.length - 1];
    map[Math.floor(last.y + last.h / 2)][Math.floor(last.x + last.w / 2)] = T.STAIR;

    return { map, rooms };
}

function spawnEntities(rooms, floorNum) {
    const enemies = [], items = [];
    const validDefs = ENEMY_DEFS.filter(d => d.floors.includes(floorNum));

    if (floorNum === 5 || floorNum === 10) {
        const bdef = BOSS_DEFS[floorNum];
        const br   = rooms[Math.floor(rooms.length / 2)];
        enemies.push({
            ...bdef,
            isBoss: true, _bossFloor: floorNum,
            uid: 'boss' + floorNum,
            x: Math.floor(br.x + br.w / 2),
            y: Math.floor(br.y + br.h / 2),
            maxHp: bdef.hp, phase: 1,
            spawnTick: 0, recompileDone: false,
        });
        for (let ri = 1; ri < rooms.length - 1; ri++) trySpawnItem(rooms[ri], items);
        return { enemies, items };
    }

    for (let ri = 1; ri < rooms.length - 1; ri++) {
        const room  = rooms[ri];
        const count = 1 + Math.floor(Math.random() * 3);
        for (let k = 0; k < count; k++) {
            if (!validDefs.length) break;
            const def = validDefs[Math.floor(Math.random() * validDefs.length)];
            const ex  = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
            const ey  = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
            if (enemies.find(e => e.x === ex && e.y === ey)) continue;
            const scale = 1 + (floorNum - 1) * 0.08;
            enemies.push({
                ...def,
                uid: def.id + '_' + Math.random().toString(36).slice(2, 6),
                x: ex, y: ey,
                maxHp: Math.round(def.hp  * scale),
                hp:    Math.round(def.hp  * scale),
                atk:   Math.round(def.atk * (1 + (floorNum - 1) * 0.05)),
            });
        }
        trySpawnItem(room, items);
    }
    return { enemies, items };
}

function trySpawnItem(room, items) {
    if (Math.random() > 0.55) return;
    const totalW = ITEM_DEFS.reduce((s, d) => s + d.weight, 0);
    let r = Math.random() * totalW, def = ITEM_DEFS[0];
    for (const d of ITEM_DEFS) { r -= d.weight; if (r <= 0) { def = d; break; } }
    const ix = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
    const iy = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
    if (!items.find(i => i.x === ix && i.y === iy))
        items.push({ ...def, uid: def.id + '_' + Math.random().toString(36).slice(2, 6), x: ix, y: iy });
}

// ── РЕНДЕР ────────────────────────────────────────────────────
function render() {
    ctx.fillStyle = '#060810';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!G || G.phase !== 'playing') return;

    const camX = Math.max(0, Math.min(G.player.x - Math.floor(VW / 2), MW - VW));
    const camY = Math.max(0, Math.min(G.player.y - Math.floor(VH / 2), MH - VH));

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    // Tiles
    for (let ty = 0; ty < VH; ty++) {
        for (let tx = 0; tx < VW; tx++) {
            const mx = camX + tx, my = camY + ty;
            if (mx < 0 || mx >= MW || my < 0 || my >= MH) continue;
            const tile = G.map[my][mx];
            const sx = tx * TS + TS / 2, sy = ty * TS + TS / 2;
            if (tile === T.WALL) {
                ctx.fillStyle = '#1c2235';
                ctx.font = `bold ${TS}px "JetBrains Mono",monospace`;
                ctx.fillText('#', sx, sy);
            } else if (tile === T.FLOOR) {
                ctx.fillStyle = '#131828';
                ctx.font = `${TS - 12}px "JetBrains Mono",monospace`;
                ctx.fillText('·', sx, sy + 3);
            } else if (tile === T.STAIR) {
                ctx.fillStyle = '#00d4aa';
                ctx.shadowColor = '#00d4aa'; ctx.shadowBlur = 10;
                ctx.font = `bold ${TS}px "JetBrains Mono",monospace`;
                ctx.fillText('>', sx, sy);
                ctx.shadowBlur = 0;
            }
        }
    }

    // Items
    ctx.font = `bold ${TS - 8}px "JetBrains Mono",monospace`;
    for (const item of G.items) {
        const sx = (item.x - camX) * TS + TS / 2;
        const sy = (item.y - camY) * TS + TS / 2;
        if (offscreen(sx, sy)) continue;
        ctx.fillStyle = item.color;
        ctx.fillText(item.char, sx, sy);
    }

    // Enemies
    for (const e of G.enemies) {
        const dist = Math.abs(e.x - G.player.x) + Math.abs(e.y - G.player.y);
        if (!e.isBoss && temps.devtools === 0 && dist > 8) continue;
        const sx = (e.x - camX) * TS + TS / 2;
        const sy = (e.y - camY) * TS + TS / 2;
        if (offscreen(sx, sy)) continue;
        if (e.isBoss) {
            ctx.font = `bold ${TS}px "JetBrains Mono",monospace`;
            ctx.fillStyle = e.color; ctx.shadowColor = e.color; ctx.shadowBlur = 16;
            ctx.fillText(e.char, sx, sy);
            ctx.shadowBlur = 0;
            // HP bar
            const bw = TS * 1.8;
            const bx = sx - bw / 2, by = sy - TS / 2 - 9;
            ctx.fillStyle = '#222'; ctx.fillRect(bx, by, bw, 5);
            ctx.fillStyle = e.hp / e.maxHp > 0.5 ? '#ff5f57' : '#ff3030';
            ctx.fillRect(bx, by, bw * Math.max(0, e.hp / e.maxHp), 5);
        } else {
            ctx.font = `bold ${TS - 8}px "JetBrains Mono",monospace`;
            ctx.fillStyle = e.color;
            ctx.fillText(e.char, sx, sy);
        }
    }

    // Player
    ctx.font = `bold ${TS}px "JetBrains Mono",monospace`;
    const psx = (G.player.x - camX) * TS + TS / 2;
    const psy = (G.player.y - camY) * TS + TS / 2;
    ctx.fillStyle = G.classColor; ctx.shadowColor = G.classColor; ctx.shadowBlur = 12;
    ctx.fillText('@', psx, psy);
    ctx.shadowBlur = 0;

    if (temps.shield) {
        ctx.strokeStyle = '#00d4aa'; ctx.lineWidth = 2;
        ctx.shadowColor = '#00d4aa'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(psx, psy, TS / 2 - 1, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0;
    }

    renderMini(camX, camY);
}

function offscreen(sx, sy) {
    return sx < -TS || sx > canvas.width + TS || sy < -TS || sy > canvas.height + TS;
}

function renderMini(camX, camY) {
    const mw = miniCvs.width, mh = miniCvs.height;
    const cw = mw / MW, ch = mh / MH;
    miniCtx.fillStyle = 'rgba(6,8,16,.92)';
    miniCtx.fillRect(0, 0, mw, mh);
    for (let y = 0; y < MH; y++)
        for (let x = 0; x < MW; x++) {
            const t = G.map[y][x];
            if (t === T.WALL) continue;
            miniCtx.fillStyle = t === T.STAIR ? '#00d4aa' : '#1e2a42';
            miniCtx.fillRect(x * cw, y * ch, cw, ch);
        }
    for (const e of G.enemies) {
        miniCtx.fillStyle = e.isBoss ? e.color : '#ff5f57';
        miniCtx.fillRect(e.x * cw - .5, e.y * ch - .5, cw + 1, ch + 1);
    }
    miniCtx.fillStyle = G.classColor;
    miniCtx.fillRect(G.player.x * cw - 1, G.player.y * ch - 1, cw + 2, ch + 2);
    miniCtx.strokeStyle = 'rgba(200,210,224,.2)'; miniCtx.lineWidth = .5;
    miniCtx.strokeRect(camX * cw, camY * ch, VW * cw, VH * ch);
}

// ── БОЙ ───────────────────────────────────────────────────────
function rollDmg(atk, def) {
    const base = Math.max(1, atk - def);
    const v    = Math.max(1, Math.floor(base * 0.25));
    return base + Math.floor(Math.random() * v);
}

function playerHit(enemy) {
    let atk = G.player.atk;
    if (temps.energy > 0) atk = Math.round(atk * 1.5);
    const d = rollDmg(atk, enemy.def);
    enemy.hp -= d;
    log(`Атака → ${enemy.name}: <span class="log-bad">-${d} HP</span>`);
    if (enemy.hp <= 0) killEnemy(enemy);
}

function enemyHit(enemy) {
    if (temps.shield) {
        temps.shield = false;
        log(`${enemy.name} атакует — <span class="log-good">ПОГЛОЩЕНО!</span>`);
        updateUI(); return;
    }
    if (enemy.instakill && Math.random() < enemy.instakill) {
        log(`<span class="log-bad">${enemy.name}: FATAL: Segmentation fault!</span>`);
        G.player.hp = 0; checkDeath(); return;
    }
    const d = rollDmg(enemy.atk, G.player.def);
    G.player.hp = Math.max(0, G.player.hp - d);
    log(`${enemy.name}: <span class="log-bad">-${d} HP</span>`);
    checkDeath();
}

function killEnemy(enemy) {
    G.enemies = G.enemies.filter(e => e !== enemy);
    G.xp += enemy.xp; G.kills++;
    log(`<span class="log-good">${enemy.name} уничтожен. +${enemy.xp} XP</span>`);
    checkLevelUp(); updateUI();
}

function checkDeath() {
    if (G.player.hp > 0) return;
    if (G.classId === 'devops' && !G.skills[0].used) {
        G.skills[0].used = true;
        G.player.hp = Math.floor(G.player.maxHp / 2);
        log(`<span class="log-good">🐳 DOCKER RESTART! Перезапущен: ${G.player.hp} HP!</span>`);
        updateUI(); return;
    }
    G.player.hp = 0; G.phase = 'dead'; updateUI();
    setTimeout(showDeath, 600);
}

function checkLevelUp() {
    const thr = [0, 20, 50, 100, 180, 300, 460, 680, 980, 1380];
    while (G.player.level < 10 && G.xp >= thr[G.player.level]) {
        G.player.level++;
        G.player.maxHp += 8; G.player.hp = Math.min(G.player.hp + 8, G.player.maxHp);
        G.player.atk++; G.player.def = Math.round(G.player.def + 0.5);
        log(`<span class="log-good">⬆ LEVEL UP! Ур.${G.player.level} — HP+8, ATK+1</span>`);
    }
}

// ── ДЕЙСТВИЯ ИГРОКА ───────────────────────────────────────────
function tryMove(dx, dy) {
    if (!G || G.phase !== 'playing') return;
    const nx = G.player.x + dx, ny = G.player.y + dy;
    if (nx < 0 || nx >= MW || ny < 0 || ny >= MH) return;
    if (G.map[ny][nx] === T.WALL) return;

    const enemy = G.enemies.find(e => e.x === nx && e.y === ny);
    if (enemy) { playerHit(enemy); if (G.phase === 'playing') endTurn(); return; }

    const itemIdx = G.items.findIndex(i => i.x === nx && i.y === ny);
    if (itemIdx >= 0) { useItem(G.items[itemIdx]); G.items.splice(itemIdx, 1); }

    G.player.x = nx; G.player.y = ny;
    if (G.map[ny][nx] === T.STAIR) { goNextFloor(); return; }
    endTurn();
}

function useItem(item) {
    if (item.heal) {
        const h = Math.min(item.heal, G.player.maxHp - G.player.hp);
        G.player.hp += h;
        log(`${item.name}: <span class="log-good">+${h} HP</span>`);
    }
    if (item.energy) { temps.energy = 6; log(`${item.name}: <span class="log-good">ATK +50% на 6 ходов</span>`); }
    if (item.xp)     { G.xp += item.xp; log(`${item.name}: <span class="log-good">+${item.xp} XP</span>`); checkLevelUp(); }
    updateUI();
}

function useSkill(idx) {
    if (!G || G.phase !== 'playing') return;
    const sk = G.skills[idx];
    if (sk.timer > 0) { log(`${sk.name}: перезарядка (${sk.timer} ходов)`); return; }
    if (sk.once && sk.used) { log(`${sk.name}: уже использован.`); return; }

    switch (G.classId) {
        case 'frontend':
            if (idx === 0) {
                temps.shield = true; sk.timer = sk.cd;
                log(`<span class="log-good">CSS Flex: следующий удар промахнётся!</span>`);
            }
            if (idx === 1) {
                temps.devtools = 3; sk.timer = sk.cd;
                log(`<span class="log-good">DevTools: враги видны 3 хода!</span>`);
            }
            break;
        case 'backend':
            if (idx === 0) {
                temps.shield = true; sk.timer = sk.cd;
                log(`<span class="log-good">Try-Catch: следующий удар поглощён!</span>`);
            }
            if (idx === 1) {
                const adj = G.enemies.filter(e =>
                    Math.abs(e.x - G.player.x) <= 1 && Math.abs(e.y - G.player.y) <= 1
                );
                if (!adj.length) { log('Batch Query: нет врагов рядом.'); return; }
                adj.forEach(e => {
                    const d = rollDmg(G.player.atk, e.def); e.hp -= d;
                    log(`Batch Query → ${e.name}: <span class="log-bad">-${d}</span>`);
                    if (e.hp <= 0) killEnemy(e);
                });
                sk.timer = sk.cd;
            }
            break;
        case 'devops':
            if (idx === 0) { log('Docker Restart: активируется автоматически при смерти.'); return; }
            if (idx === 1) {
                const tgt = [...G.enemies].sort((a, b) =>
                    (Math.abs(a.x - G.player.x) + Math.abs(a.y - G.player.y)) -
                    (Math.abs(b.x - G.player.x) + Math.abs(b.y - G.player.y))
                )[0];
                if (!tgt || Math.abs(tgt.x - G.player.x) + Math.abs(tgt.y - G.player.y) > 6) {
                    log('Kill -9: нет цели в радиусе 6.'); return;
                }
                if (tgt.hp / tgt.maxHp < 0.3) {
                    log(`<span class="log-good">Kill -9: ${tgt.name} — УНИЧТОЖЕН!</span>`);
                    killEnemy(tgt);
                } else {
                    const d = rollDmg(G.player.atk * 2, tgt.def); tgt.hp -= d;
                    log(`Kill -9 → ${tgt.name}: <span class="log-bad">-${d} (x2)</span>`);
                    if (tgt.hp <= 0) killEnemy(tgt);
                }
                sk.timer = sk.cd;
            }
            break;
    }
    endTurn(); updateUI();
}

// ── ХОД ВРАГОВ ────────────────────────────────────────────────
function endTurn() {
    if (!G || G.phase !== 'playing') return;
    if (temps.energy  > 0) temps.energy--;
    if (temps.devtools > 0) temps.devtools--;
    G.skills.forEach(s => { if (s.timer > 0) s.timer--; });

    const snap = [...G.enemies];
    for (const e of snap) {
        if (G.phase !== 'playing' || !G.enemies.includes(e)) continue;
        if (e.regen) e.hp = Math.min(e.maxHp, e.hp + e.regen);
        if (e.isBoss) { bossTurn(e); continue; }

        const dist = Math.abs(e.x - G.player.x) + Math.abs(e.y - G.player.y);
        const acts = e.fast ? 2 : 1;
        for (let a = 0; a < acts; a++) {
            if (!G.enemies.includes(e) || G.phase !== 'playing') break;
            const d2 = Math.abs(e.x - G.player.x) + Math.abs(e.y - G.player.y);
            if (d2 <= 1) {
                enemyHit(e);
                if (e.doubleAtk && Math.random() < 0.35) { log(`${e.name}: двойной удар!`); enemyHit(e); }
            } else if (dist <= 9) {
                const mv = pathStep(e, G.player.x, G.player.y);
                if (mv) { e.x = mv.x; e.y = mv.y; }
                if (Math.abs(e.x - G.player.x) + Math.abs(e.y - G.player.y) <= 1) enemyHit(e);
            } else {
                randWalk(e);
            }
        }
    }
    updateUI(); render();
}

function bossTurn(boss) {
    const fl   = boss._bossFloor;
    const dist = Math.abs(boss.x - G.player.x) + Math.abs(boss.y - G.player.y);

    if (fl === 5 && boss.phase === 1 && boss.hp <= boss.maxHp / 2) {
        boss.phase = 2;
        log(`<span class="log-bad">⚠ STACK OVERLORD: ФАЗА 2 — начинает призыв!</span>`);
    }
    if (fl === 10 && boss.phase === 1 && boss.hp <= boss.maxHp / 2) {
        boss.phase = 2;
        if (!boss.recompileDone) {
            boss.recompileDone = true;
            boss.hp = Math.min(boss.maxHp, boss.hp + 80);
            log(`<span class="log-bad">ROOT_BUG: RECOMPILE — восстановлено 80 HP!</span>`);
        }
    }

    if (fl === 5 && boss.phase === 2) {
        boss.spawnTick++;
        if (boss.spawnTick % 3 === 0) {
            spawnMinion(boss.x + 1, boss.y);
            spawnMinion(boss.x, boss.y + 1);
            log(`<span class="log-bad">Stack Overlord призывает подкрепление!</span>`);
        }
    }

    if (fl === 10 && boss.phase === 2 && G.player.hp / G.player.maxHp < 0.2) {
        log(`<span class="log-bad">ROOT_BUG: FATAL EXCEPTION!</span>`);
        G.player.hp = 0; checkDeath(); return;
    }

    if (dist <= 1) {
        enemyHit(boss);
    } else {
        const mv = pathStep(boss, G.player.x, G.player.y);
        if (mv) { boss.x = mv.x; boss.y = mv.y; }
        if (Math.abs(boss.x - G.player.x) + Math.abs(boss.y - G.player.y) <= 1) enemyHit(boss);
    }
}

function pathStep(entity, tx, ty) {
    const dx = tx - entity.x, dy = ty - entity.y;
    const moves = Math.abs(dx) >= Math.abs(dy)
        ? [[Math.sign(dx), 0], [0, Math.sign(dy)], [0, -Math.sign(dy)], [-Math.sign(dx), 0]]
        : [[0, Math.sign(dy)], [Math.sign(dx), 0], [-Math.sign(dx), 0], [0, -Math.sign(dy)]];
    for (const [mx, my] of moves) {
        if (!mx && !my) continue;
        const nx = entity.x + mx, ny = entity.y + my;
        if (nx < 0 || nx >= MW || ny < 0 || ny >= MH || G.map[ny][nx] === T.WALL) continue;
        if (G.enemies.find(e => e !== entity && e.x === nx && e.y === ny)) continue;
        if (nx === G.player.x && ny === G.player.y) return null;
        return { x: nx, y: ny };
    }
    return null;
}

function randWalk(e) {
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    const [dx, dy] = dirs[Math.floor(Math.random() * 4)];
    const nx = e.x + dx, ny = e.y + dy;
    if (nx < 1 || nx >= MW - 1 || ny < 1 || ny >= MH - 1) return;
    if (G.map[ny][nx] === T.WALL) return;
    if (G.enemies.find(o => o !== e && o.x === nx && o.y === ny)) return;
    e.x = nx; e.y = ny;
}

function spawnMinion(x, y) {
    if (x < 1 || x >= MW - 1 || y < 1 || y >= MH - 1) return;
    if (G.map[y][x] === T.WALL || G.enemies.find(e => e.x === x && e.y === y)) return;
    G.enemies.push({
        id:'todo', char:'T', name:'Минион', color:'#445065',
        uid: 'mn' + Math.random().toString(36).slice(2, 6),
        x, y, hp: 12, maxHp: 12, atk: 4, def: 0, xp: 1,
    });
}

// ── ПЕРЕХОД ЭТАЖЕЙ ────────────────────────────────────────────
function goNextFloor() {
    G.floor++;
    if (G.floor > 10) { showWin(); return; }
    const isBossFloor = G.floor === 5 || G.floor === 10;
    if (isBossFloor) {
        const boss = BOSS_DEFS[G.floor];
        showDialogue(`// ЭТАЖ ${G.floor}: БОСС`, boss.intro, () => loadFloor(G.floor));
    } else if (STORY_DATA[G.floor]) {
        const s = STORY_DATA[G.floor];
        showDialogue(s.title, s.lines, () => loadFloor(G.floor));
    } else {
        loadFloor(G.floor);
    }
}

function loadFloor(floorNum) {
    const { map, rooms }     = genFloor(floorNum);
    const { enemies, items } = spawnEntities(rooms, floorNum);
    G.map = map; G.enemies = enemies; G.items = items;
    G.phase = 'playing';
    temps = { shield: false, energy: temps.energy, devtools: 0 };

    const spawn = rooms[0];
    G.player.x = Math.floor(spawn.x + spawn.w / 2);
    G.player.y = Math.floor(spawn.y + spawn.h / 2);

    document.getElementById('floorNum').textContent = floorNum;
    log(`═══ ЭТАЖ ${floorNum} ═══`);
    if (floorNum === 5 || floorNum === 10) log(`<span class="log-bad">⚠ БОСС НА ЭТОМ ЭТАЖЕ</span>`);
    updateUI(); render();
}

// ── СЮЖЕТНЫЕ ДИАЛОГИ ──────────────────────────────────────────
function showDialogue(title, lines, onDone) {
    G.phase = 'story';
    const modal     = document.getElementById('storyModal');
    const titleEl   = document.getElementById('storyTitle');
    const contentEl = document.getElementById('storyContent');
    const btnEl     = document.getElementById('storyNext');

    titleEl.textContent  = title;
    contentEl.innerHTML  = '';
    modal.style.display  = 'flex';

    let i = 0;
    function showNext() {
        if (i >= lines.length) {
            btnEl.textContent = 'Продолжить →';
            btnEl.onclick = () => { modal.style.display = 'none'; if (onDone) onDone(); };
            return;
        }
        const p = document.createElement('p');
        p.className   = 'story-line';
        p.textContent = lines[i] || '\u00a0';
        contentEl.appendChild(p);
        void p.offsetHeight; // reflow for animation
        p.classList.add('story-line--in');
        contentEl.scrollTop = contentEl.scrollHeight;
        i++;
        btnEl.textContent = i < lines.length ? 'Далее ▸' : 'Продолжить →';
        btnEl.onclick = showNext;
    }
    btnEl.onclick = showNext;
    showNext();
}

// ── UI ────────────────────────────────────────────────────────
function log(html) {
    const el  = document.getElementById('logLines');
    const div = document.createElement('div');
    div.className = 'log-line'; div.innerHTML = html;
    el.appendChild(div);
    while (el.children.length > 60) el.removeChild(el.firstChild);
    el.scrollTop = el.scrollHeight;
}

function updateUI() {
    if (!G) return;
    const p  = G.player;
    const hp = Math.max(0, p.hp / p.maxHp * 100);
    document.getElementById('hpBar').style.width      = hp + '%';
    document.getElementById('hpBar').style.background = hp > 50 ? '#28c840' : hp > 25 ? '#ffbd2e' : '#ff5f57';
    document.getElementById('hpText').textContent     = `${p.hp}/${p.maxHp}`;
    document.getElementById('statAtk').textContent    = p.atk + (temps.energy > 0 ? '⚡' : '');
    document.getElementById('statDef').textContent    = p.def;
    document.getElementById('statLvl').textContent    = p.level;
    document.getElementById('statFloor').textContent  = G.floor;
    document.getElementById('statXp').textContent     = G.xp;

    G.skills.forEach((sk, i) => {
        const el = document.getElementById('skill' + i);
        if (!el) return;
        const off = sk.timer > 0 || (sk.once && sk.used);
        el.className = 'skill-btn' + (off ? ' skill-off' : '');
        el.querySelector('.sk-cd').textContent = (sk.once && sk.used) ? '✗' : sk.timer > 0 ? sk.timer : '✓';
    });
}

// ── СМЕРТЬ / ПОБЕДА ───────────────────────────────────────────
function showDeath() {
    document.getElementById('overlayEmoji').textContent = '💀';
    document.getElementById('overlayTitle').textContent = 'SEGMENTATION FAULT';
    document.getElementById('overlayText').textContent  =
        `Погиб на этаже ${G.floor}. Уровень: ${G.player.level}. XP: ${G.xp}.`;
    const reward = Math.floor(G.xp * 10);
    document.getElementById('overlayReward').textContent = `+${reward.toLocaleString()} ЛОК в idle (утешительный приз)`;
    document.getElementById('overlayReward').style.display = 'block';
    document.getElementById('gameOverlay').style.display   = 'flex';
    sendReward(reward, 0, false);
}

function showWin() {
    showDialogue(WIN_STORY.title, WIN_STORY.lines, () => {
        document.getElementById('overlayEmoji').textContent = '🏆';
        document.getElementById('overlayTitle').textContent = 'КОДОВАЯ БАЗА ОЧИЩЕНА';
        document.getElementById('overlayText').textContent  =
            `Все 10 этажей пройдены. Уровень: ${G.player.level}. XP: ${G.xp}.`;
        const reward = Math.min(G.xp * 100, 500000);
        document.getElementById('overlayReward').textContent = `+${reward.toLocaleString()} ЛОК + 2 OO в idle!`;
        document.getElementById('overlayReward').style.display = 'block';
        document.getElementById('gameOverlay').style.display   = 'flex';
        sendReward(reward, 2, true);
    });
}

function sendReward(loc, oo, isWin) {
    try {
        const raw = localStorage.getItem('codeAndCoffee_save');
        if (raw) {
            const save = JSON.parse(atob(raw));
            save.loc      = (save.loc      || 0) + loc;
            save.totalLoc = (save.totalLoc || 0) + loc;
            if (isWin) save.dungeonClears = (save.dungeonClears || 0) + 1;
            if (oo > 0) {
                save.prestigePoints      = (save.prestigePoints      || 0) + oo;
                save.totalPrestigePoints = (save.totalPrestigePoints || 0) + oo;
            }
            localStorage.setItem('codeAndCoffee_save', btoa(JSON.stringify(save)));
        }
    } catch (_) {}

    if (!IS_LOGGED_IN) return;
    fetch('/ajax/save.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: isWin ? 'dungeon_clear' : 'minigame_reward', loc, oo }),
    });
}

// ── ЗАПУСК ИГРЫ ───────────────────────────────────────────────
function startGame(classId) {
    document.getElementById('classSelect').style.display = 'none';
    document.getElementById('gameOverlay').style.display = 'none';

    const cls   = CLASS_DEFS[classId];
    const bonus = Math.floor((ACCOUNT_LEVEL || 1) / 5);

    G = {
        floor: 0, map: [], enemies: [], items: [],
        player: {
            x: 0, y: 0,
            hp:    cls.hp  + bonus * 5,
            maxHp: cls.hp  + bonus * 5,
            atk:   cls.atk + bonus,
            def:   cls.def + Math.floor(bonus * 0.5),
            level: 1,
        },
        xp: 0, kills: 0,
        classId, classColor: cls.color,
        skills: cls.skills.map(s => ({ ...s })),
        phase: 'playing',
    };
    temps = { shield: false, energy: 0, devtools: 0 };

    document.getElementById('playerClassName').textContent = `${cls.emoji} ${cls.name}`;
    document.getElementById('playerClassName').style.color = cls.color;

    const skEl = document.getElementById('skillsList');
    skEl.innerHTML = '';
    G.skills.forEach((sk, i) => {
        const btn      = document.createElement('button');
        btn.id         = 'skill' + i;
        btn.className  = 'skill-btn';
        btn.title      = sk.desc;
        btn.onclick    = () => useSkill(i);
        btn.innerHTML  = `<span class="sk-key">[${sk.key}]</span><span class="sk-name">${sk.name}</span><span class="sk-cd">✓</span>`;
        skEl.appendChild(btn);
    });

    const p0 = STORY_DATA[0];
    showDialogue(p0.title, p0.lines, () => {
        const s1 = STORY_DATA[1];
        showDialogue(s1.title, s1.lines, () => loadFloor(1));
    });
}

// ── ВВОД ──────────────────────────────────────────────────────
$(document).on('keydown', function (e) {
    if (!G || G.phase !== 'playing') return;
    switch (e.key) {
        case 'ArrowUp':    case 'w': case 'W': e.preventDefault(); tryMove(0, -1);  break;
        case 'ArrowDown':  case 's': case 'S': e.preventDefault(); tryMove(0,  1);  break;
        case 'ArrowLeft':  case 'a': case 'A': e.preventDefault(); tryMove(-1, 0);  break;
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); tryMove(1,  0);  break;
        case '.': case ' ': e.preventDefault(); endTurn(); render(); break;
        case 'q': case 'Q': useSkill(0); break;
        case 'e': case 'E': useSkill(1); break;
    }
});

// ── СТАРТ ─────────────────────────────────────────────────────
$(function () {
    document.getElementById('classSelect').style.display = 'flex';

    $(document).on('click', '.class-card', function () {
        startGame($(this).data('class'));
    });

    $('#btnRestart, #overlayRestart').on('click', function () {
        document.getElementById('gameOverlay').style.display = 'none';
        G = null;
        document.getElementById('classSelect').style.display = 'flex';
    });
});
