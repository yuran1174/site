<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/db.php';

$isLoggedIn   = isset($_SESSION['user_id']);
$accountLevel = 1;

if ($isLoggedIn) {
    try {
        $db   = DB::get();
        $stmt = $db->prepare('SELECT save_data FROM game_saves WHERE user_id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        $row = $stmt->fetch();
        if ($row) {
            $sd = json_decode($row['save_data'], true);
            $accountLevel = max(1, (int)($sd['accountLevel'] ?? 1));
        }
    } catch (Exception $e) {}
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Кодовая база: Глубина — Roguelike</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏰</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/dungeon.css">
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>
<body>

<!-- ═══ ВЫБОР КЛАССА ════════════════════════════════════════ -->
<div id="classSelect">
  <div class="cs-wrap">
    <div class="cs-header">
      <div class="cs-eyebrow">// КОДОВАЯ БАЗА: ГЛУБИНА</div>
      <h1 class="cs-title">Выбери класс</h1>
      <p class="cs-sub">Каждый класс — уникальные навыки и стиль игры</p>
    </div>

    <div class="cs-cards">

      <div class="class-card" data-class="frontend">
        <div class="cc-glow" style="--cc-color:#00d4aa"></div>
        <div class="cc-emoji">🖥️</div>
        <div class="cc-name" style="color:#00d4aa">Frontend Dev</div>
        <div class="cc-desc">Быстрый и ловкий. Уклоняется от атак и видит врагов раньше.</div>
        <div class="cc-stats">
          <span class="cc-stat"><span class="cc-stat-label">HP</span><span class="cc-stat-val">80</span></span>
          <span class="cc-stat"><span class="cc-stat-label">ATK</span><span class="cc-stat-val">6</span></span>
          <span class="cc-stat"><span class="cc-stat-label">DEF</span><span class="cc-stat-val">2</span></span>
        </div>
        <div class="cc-skills">
          <div class="cc-skill"><span class="cc-key">Q</span><span>CSS Flex — следующий удар промахнётся</span></div>
          <div class="cc-skill"><span class="cc-key">E</span><span>DevTools — все враги видны 3 хода</span></div>
        </div>
      </div>

      <div class="class-card" data-class="backend">
        <div class="cc-glow" style="--cc-color:#7c5cfc"></div>
        <div class="cc-emoji">⚙️</div>
        <div class="cc-name" style="color:#7c5cfc">Backend Dev</div>
        <div class="cc-desc">Сбалансированный боец. Поглощает удары и атакует по площади.</div>
        <div class="cc-stats">
          <span class="cc-stat"><span class="cc-stat-label">HP</span><span class="cc-stat-val">100</span></span>
          <span class="cc-stat"><span class="cc-stat-label">ATK</span><span class="cc-stat-val">8</span></span>
          <span class="cc-stat"><span class="cc-stat-label">DEF</span><span class="cc-stat-val">4</span></span>
        </div>
        <div class="cc-skills">
          <div class="cc-skill"><span class="cc-key">Q</span><span>Try-Catch — поглотить следующий удар</span></div>
          <div class="cc-skill"><span class="cc-key">E</span><span>Batch Query — удар по всем врагам рядом</span></div>
        </div>
      </div>

      <div class="class-card" data-class="devops">
        <div class="cc-glow" style="--cc-color:#ffbd2e"></div>
        <div class="cc-emoji">🐳</div>
        <div class="cc-name" style="color:#ffbd2e">DevOps</div>
        <div class="cc-desc">Живучий танк. Один раз автоматически воскресает при смерти.</div>
        <div class="cc-stats">
          <span class="cc-stat"><span class="cc-stat-label">HP</span><span class="cc-stat-val">130</span></span>
          <span class="cc-stat"><span class="cc-stat-label">ATK</span><span class="cc-stat-val">5</span></span>
          <span class="cc-stat"><span class="cc-stat-label">DEF</span><span class="cc-stat-val">8</span></span>
        </div>
        <div class="cc-skills">
          <div class="cc-skill"><span class="cc-key">Q</span><span>Docker Restart — авто-воскрешение 50% HP</span></div>
          <div class="cc-skill"><span class="cc-key">E</span><span>Kill -9 — мгновенная смерть / двойной урон</span></div>
        </div>
      </div>

    </div>

    <div class="cs-hint">
      <span class="cs-hint-key">WASD</span> или <span class="cs-hint-key">↑↓←→</span> — движение &nbsp;·&nbsp;
      <span class="cs-hint-key">Q</span><span class="cs-hint-key">E</span> — навыки &nbsp;·&nbsp;
      <span class="cs-hint-key">Пробел</span> — пропустить ход
    </div>
    <div class="cs-hint cs-hint-touch">📱 На мобильном — управляй D-Pad под полем</div>

    <?php if ($isLoggedIn): ?>
    <div class="cs-bonus">Уровень аккаунта <?= (int)$accountLevel ?> → бонус +<?= floor($accountLevel / 5) ?> к статам</div>
    <?php endif; ?>
  </div>
</div>

<!-- ═══ ДИАЛОГ СЮЖЕТА ════════════════════════════════════════ -->
<div id="storyModal">
  <div class="sm-wrap">
    <div class="sm-title" id="storyTitle"></div>
    <div class="sm-scanline"></div>
    <div class="sm-content" id="storyContent"></div>
    <button class="sm-btn" id="storyNext">Далее ▸</button>
  </div>
</div>

<!-- ═══ ОСНОВНАЯ ИГРА ════════════════════════════════════════ -->
<div id="dungeonWrap">

  <nav id="dungeonNav">
    <a href="idle.php">← В игру</a>
    <span class="nav-sep">|</span>
    <span class="nav-title">🏰 Кодовая база: Глубина</span>
    <span class="nav-sep">|</span>
    <span>Этаж: <span id="floorNum">—</span>/10</span>
    <?php if ($isLoggedIn): ?>
    <span class="nav-sep">|</span>
    <span class="nav-dim">Ур. аккаунта: <?= (int)$accountLevel ?></span>
    <?php endif; ?>
  </nav>

  <div id="dungeonLayout">

    <!-- CANVAS -->
    <div id="canvasWrap">
      <div id="gameCanvas"></div>
      <canvas id="miniMap" width="120" height="90"></canvas>
    </div>

    <!-- SIDE PANEL -->
    <div id="sidePanel">

      <!-- Player card -->
      <div id="playerCard">
        <div class="panel-title">👤 Персонаж</div>
        <div id="playerClassName" class="player-classname">—</div>
        <div class="hp-bar-wrap">
          <div class="hp-bar" id="hpBar"></div>
          <span id="hpText">—</span>
        </div>
        <div class="stats-list">
          <span>⚔️ ATK: <strong id="statAtk">—</strong></span>
          <span>🛡️ DEF: <strong id="statDef">—</strong></span>
          <span>⭐ Ур.: <strong id="statLvl">—</strong></span>
          <span>🎯 Эт.: <strong id="statFloor">—</strong></span>
          <span class="stat-xp-row">✨ XP: <strong id="statXp">0</strong></span>
        </div>
      </div>

      <!-- Skills -->
      <div id="skillsPanel">
        <div class="panel-title">⚡ Навыки</div>
        <div id="skillsList"></div>
        <div class="skills-hint">Q / E — активировать</div>
      </div>

      <!-- Combat log -->
      <div id="combatLog">
        <div class="panel-title">📋 Лог</div>
        <div id="logLines"></div>
      </div>

      <!-- Controls -->
      <div id="controls">
        <button id="btnRestart">🔄 Сменить класс</button>
        <a href="idle.php" class="btn-back">← В idle-игру</a>
      </div>

    </div>
  </div>

  <!-- MOBILE D-PAD -->
  <div id="dpad" style="display:none;">
    <div class="dpad-dirs">
      <button class="dpad-btn" id="dpadUp">↑</button>
      <div class="dpad-row">
        <button class="dpad-btn" id="dpadLeft">←</button>
        <button class="dpad-btn dpad-skip" id="dpadSkip">·</button>
        <button class="dpad-btn" id="dpadRight">→</button>
      </div>
      <button class="dpad-btn" id="dpadDown">↓</button>
    </div>
    <div class="dpad-skills">
      <button class="dpad-btn dpad-skill" id="dpadQ">Q</button>
      <button class="dpad-btn dpad-skill" id="dpadE">E</button>
    </div>
  </div>

</div>

<!-- ═══ ОВЕРЛЕЙ СМЕРТЬ / ПОБЕДА ══════════════════════════════ -->
<div id="gameOverlay" style="display:none;">
  <div id="overlayCard">
    <div id="overlayEmoji"></div>
    <h2 id="overlayTitle"></h2>
    <p id="overlayText"></p>
    <div id="overlayReward" style="display:none;"></div>
    <button id="overlayRestart">🔄 Играть снова</button>
    <a href="idle.php" id="overlayReturn">← В idle-игру</a>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.87.0/dist/phaser.min.js"></script>
<script>
  const IS_LOGGED_IN  = <?= $isLoggedIn ? 'true' : 'false' ?>;
  const ACCOUNT_LEVEL = <?= (int)$accountLevel ?>;
</script>
<script src="js/dungeon.js"></script>
</body>
</html>
