<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/db.php';

$isLoggedIn = isset($_SESSION['user_id']);
$username   = $_SESSION['username'] ?? null;
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Охота на Баги — Код и Кофе</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐛</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/auth.css">
  <link rel="stylesheet" href="css/minigame.css">
</head>
<body class="mg-body">

<div class="page-nav">
  <a href="idle.php" class="nav-link">← Игра</a>
  <?php if ($isLoggedIn): ?>
    <a href="profile.php" class="nav-link">👤 <?= htmlspecialchars($username) ?></a>
    <a href="leaderboard.php" class="nav-link">🏆 Рейтинг</a>
  <?php else: ?>
    <a href="auth.php" class="nav-link">Войти</a>
    <a href="leaderboard.php" class="nav-link">🏆 Рейтинг</a>
  <?php endif; ?>
</div>

<div class="mg-wrap">

  <!-- START SCREEN -->
  <div id="startScreen" class="mg-screen active">
    <div class="mg-logo">🐛</div>
    <h1 class="mg-title">Охота на Баги</h1>
    <p class="mg-subtitle">
      Лови баги пока они не ушли в прод!<br>
      45 секунд. Каждый пойманный баг = +10 ЛОК.<br>
      Поймай 15+ — получи бонусный <strong>+1 OO</strong>!
    </p>
    <div class="mg-rules">
      <div class="mg-rule"><span>🐛</span> Кликни на жука чтобы поймать</div>
      <div class="mg-rule"><span>⚡</span> Жуки появляются всё быстрее</div>
      <div class="mg-rule"><span>🏆</span> 15+ багов = бонус Очко Опыта</div>
    </div>
    <button class="mg-start-btn" id="startBtn">▶ Начать охоту</button>
    <?php if (!$isLoggedIn): ?>
    <p class="mg-guest-note">// Войди чтобы сохранить награду в игру</p>
    <?php endif; ?>
  </div>

  <!-- GAME SCREEN -->
  <div id="gameScreen" class="mg-screen">
    <div class="mg-hud">
      <div class="mg-hud-item">
        <div class="mg-hud-label">Поймано</div>
        <div class="mg-hud-value" id="scoreDisplay">0</div>
      </div>
      <div class="mg-timer-wrap">
        <div class="mg-timer-bar-bg">
          <div class="mg-timer-bar" id="timerBar"></div>
        </div>
        <div class="mg-timer-text" id="timerText">45</div>
      </div>
      <div class="mg-hud-item">
        <div class="mg-hud-label">ЛОК</div>
        <div class="mg-hud-value" id="locDisplay">0</div>
      </div>
    </div>

    <div class="mg-grid" id="bugGrid"></div>
  </div>

  <!-- RESULT SCREEN -->
  <div id="resultScreen" class="mg-screen">
    <div class="result-icon" id="resultIcon">🐛</div>
    <h2 class="result-title" id="resultTitle">Охота завершена!</h2>
    <div class="result-stats">
      <div class="result-stat">
        <div class="result-stat-val" id="resBugs">0</div>
        <div class="result-stat-label">Багов поймано</div>
      </div>
      <div class="result-stat">
        <div class="result-stat-val" id="resLoc">0</div>
        <div class="result-stat-label">ЛОК заработано</div>
      </div>
      <div class="result-stat" id="resOOWrap" style="display:none;">
        <div class="result-stat-val result-oo">+1 ОО</div>
        <div class="result-stat-label">Очко Опыта</div>
      </div>
    </div>
    <div class="result-msg" id="resultMsg"></div>
    <div class="result-btns">
      <button class="mg-apply-btn" id="applyBtn">✓ Применить награду</button>
      <button class="mg-replay-btn" id="replayBtn">↻ Играть снова</button>
      <a href="idle.php" class="mg-back-link">← Вернуться в игру</a>
    </div>
    <div id="applyStatus" class="apply-status" style="display:none;"></div>
  </div>

</div><!-- /mg-wrap -->

<script>
const IS_LOGGED_IN = <?= $isLoggedIn ? 'true' : 'false' ?>;
const GAME_TIME    = 45; // seconds
const GRID_SIZE    = 25; // 5×5
const LOC_PER_BUG  = 10;
const OO_THRESHOLD = 15;

const CODE_SNIPPETS = [
  'const x = null;', 'if (true) {}', 'return undefined;', '// TODO: fix',
  'let i = 0;', 'arr.map(x=>x)', 'DELETE FROM *', 'git push -f',
  'rm -rf /', 'sudo !!', 'while(true){}', 'NaN === NaN',
  '[] == false', 'typeof null', 'void 0', '0.1+0.2',
  '++[[]][+[]]', 'new Array(3)', 'x?.y?.z', 'async/await',
  '404;', 'Infinity', 'eval()', 'document.write',
  'innerHTML=x', 'SQL injection',
];

let score     = 0;
let timeLeft  = GAME_TIME;
let timerInt  = null;
let bugInt    = null;
let cells     = [];
let activeBugs= {}; // cellIndex → timeout id
let gameRunning = false;
let bugInterval = 1600; // ms between bug spawns (decreases over time)

function buildGrid() {
  const grid = document.getElementById('bugGrid');
  grid.innerHTML = '';
  cells = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    const cell = document.createElement('div');
    cell.className = 'mg-cell';
    cell.dataset.idx = i;

    // Random code snippet as bg text
    const snippet = document.createElement('span');
    snippet.className = 'cell-code';
    snippet.textContent = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
    cell.appendChild(snippet);

    cell.addEventListener('click', () => catchBug(i));
    grid.appendChild(cell);
    cells.push(cell);
  }
}

function spawnBug() {
  if (!gameRunning) return;

  // Find empty cells
  const empty = cells.map((_, i) => i).filter(i => !activeBugs[i]);
  if (empty.length === 0) return;

  const idx  = empty[Math.floor(Math.random() * empty.length)];
  const cell = cells[idx];

  cell.classList.add('has-bug');
  cell.querySelector('.cell-code').style.display = 'none';

  const bug = document.createElement('div');
  bug.className = 'cell-bug';
  bug.textContent = '🐛';
  cell.appendChild(bug);

  // Bug disappears after a while (faster as time decreases)
  const stayTime = Math.max(800, 1800 - (GAME_TIME - timeLeft) * 20);
  activeBugs[idx] = setTimeout(() => removeBug(idx, false), stayTime);
}

function removeBug(idx, caught) {
  clearTimeout(activeBugs[idx]);
  delete activeBugs[idx];

  const cell = cells[idx];
  if (!cell) return;

  const bug = cell.querySelector('.cell-bug');
  if (bug) bug.remove();

  const snippet = cell.querySelector('.cell-code');
  if (snippet) snippet.style.display = '';

  if (caught) {
    cell.classList.remove('has-bug');
    cell.classList.add('caught-flash');
    setTimeout(() => cell.classList.remove('caught-flash'), 400);

    // Float text
    const rect = cell.getBoundingClientRect();
    const float = document.createElement('div');
    float.className = 'mg-float';
    float.textContent = '+' + LOC_PER_BUG + ' ЛОК';
    float.style.left = (rect.left + rect.width/2) + 'px';
    float.style.top  = rect.top + 'px';
    document.body.appendChild(float);
    float.addEventListener('animationend', () => float.remove());
  } else {
    cell.classList.remove('has-bug');
    cell.classList.add('missed-flash');
    setTimeout(() => cell.classList.remove('missed-flash'), 300);
  }
}

function catchBug(idx) {
  if (!gameRunning || !activeBugs[idx]) return;
  removeBug(idx, true);
  score++;
  document.getElementById('scoreDisplay').textContent = score;
  document.getElementById('locDisplay').textContent   = score * LOC_PER_BUG;
}

function startGame() {
  score      = 0;
  timeLeft   = GAME_TIME;
  gameRunning= true;
  activeBugs = {};
  bugInterval= 1600;

  document.getElementById('scoreDisplay').textContent = '0';
  document.getElementById('locDisplay').textContent   = '0';
  document.getElementById('timerText').textContent    = GAME_TIME;
  document.getElementById('timerBar').style.width     = '100%';
  document.getElementById('timerBar').style.background= 'var(--mg-green)';
  document.getElementById('applyStatus').style.display= 'none';

  showScreen('gameScreen');
  buildGrid();

  // Timer
  timerInt = setInterval(() => {
    timeLeft--;
    const pct = (timeLeft / GAME_TIME) * 100;
    const bar = document.getElementById('timerBar');
    bar.style.width = pct + '%';
    document.getElementById('timerText').textContent = timeLeft;

    // Color warning
    if (pct < 30)      bar.style.background = 'var(--mg-red)';
    else if (pct < 60) bar.style.background = 'var(--mg-yellow)';

    // Speed up bug spawning
    bugInterval = Math.max(600, 1600 - (GAME_TIME - timeLeft) * 25);

    if (timeLeft <= 0) endGame();
  }, 1000);

  // Bug spawner (adaptive interval)
  function scheduleBug() {
    if (!gameRunning) return;
    spawnBug();
    bugInt = setTimeout(scheduleBug, bugInterval);
  }
  scheduleBug();
  // Also spawn a couple instantly
  setTimeout(spawnBug, 200);
  setTimeout(spawnBug, 600);
}

function endGame() {
  gameRunning = false;
  clearInterval(timerInt);
  clearTimeout(bugInt);

  // Remove all active bugs
  Object.keys(activeBugs).forEach(idx => removeBug(parseInt(idx), false));

  const loc = score * LOC_PER_BUG;
  const oo  = score >= OO_THRESHOLD ? 1 : 0;

  // Show result
  document.getElementById('resBugs').textContent = score;
  document.getElementById('resLoc').textContent  = '+' + loc + ' ЛОК';
  document.getElementById('resOOWrap').style.display = oo > 0 ? 'flex' : 'none';

  let icon, title, msg;
  if (score === 0) {
    icon = '😅'; title = 'Ни одного...'; msg = '// Баги смеются тебе вслед';
  } else if (score < 5) {
    icon = '🐛'; title = 'Неплохо!'; msg = '// Начинающий охотник на баги';
  } else if (score < 10) {
    icon = '🎯'; title = 'Хороший результат!'; msg = '// Тестировщик бы одобрил';
  } else if (score < OO_THRESHOLD) {
    icon = '⚡'; title = 'Отличный результат!'; msg = '// Ещё немного и получишь ОО!';
  } else {
    icon = '🏆'; title = 'Эксперт!'; msg = '// +1 Очко Опыта! Ты настоящий дебаггер!';
  }

  document.getElementById('resultIcon').textContent = icon;
  document.getElementById('resultTitle').textContent = title;
  document.getElementById('resultMsg').textContent   = msg;

  // Store reward for idle.php
  const reward = { bugs: score, loc, oo, ts: Date.now() };
  localStorage.setItem('minigame_reward', JSON.stringify(reward));

  showScreen('resultScreen');
}

function applyReward() {
  const rewardStr = localStorage.getItem('minigame_reward');
  if (!rewardStr) {
    showApplyStatus('Нет наград для применения', false);
    return;
  }
  const reward = JSON.parse(rewardStr);
  const applyBtn = document.getElementById('applyBtn');
  applyBtn.disabled    = true;
  applyBtn.textContent = '...';

  if (IS_LOGGED_IN) {
    // Save to server
    fetch('ajax/save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'minigame_reward',
        bugs:   reward.bugs,
        loc:    reward.loc,
        oo:     reward.oo,
      }),
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        localStorage.removeItem('minigame_reward');
        showApplyStatus('✓ Награда сохранена на сервере! Зайди в игру чтобы увидеть.', true);
      } else {
        // Keep localStorage as fallback
        showApplyStatus('✓ Награда сохранена локально. Зайди в игру!', true);
      }
    })
    .catch(() => {
      showApplyStatus('✓ Награда сохранена локально. Зайди в игру!', true);
    });
  } else {
    // localStorage only — idle.js will pick it up
    showApplyStatus('✓ Награда ждёт тебя в игре! (Войди для сохранения на сервере)', true);
  }

  applyBtn.textContent = '✓ Применено';
}

function showApplyStatus(msg, good) {
  const el = document.getElementById('applyStatus');
  el.textContent     = msg;
  el.className       = 'apply-status ' + (good ? 'apply-good' : 'apply-bad');
  el.style.display   = 'block';
}

function showScreen(id) {
  document.querySelectorAll('.mg-screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Bind buttons
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('replayBtn').addEventListener('click', () => {
  localStorage.removeItem('minigame_reward');
  showScreen('startScreen');
});
document.getElementById('applyBtn').addEventListener('click', applyReward);
</script>

</body>
</html>
