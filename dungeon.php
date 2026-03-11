<?php
declare(strict_types=1);
session_start();
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Подземелье — Хакспейс</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏰</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/dungeon.css">
</head>
<body>

<div id="dungeonWrap">

  <!-- TOP NAV -->
  <nav id="dungeonNav">
    <a href="idle.php">← В игру</a>
    <span class="nav-sep">|</span>
    <span class="nav-title">🏰 Подземелье: Кодовая база</span>
    <span class="nav-sep">|</span>
    <span>Этаж: <span id="floorNum">1</span>/10</span>
  </nav>

  <!-- MAIN LAYOUT -->
  <div id="dungeonLayout">

    <!-- GAME CANVAS -->
    <div id="canvasWrap">
      <canvas id="dungeonCanvas" width="576" height="448"></canvas>
      <!-- Mini-map overlay -->
      <canvas id="miniMap" width="100" height="80"></canvas>
    </div>

    <!-- SIDE PANEL -->
    <div id="sidePanel">

      <!-- Player card -->
      <div id="playerCard">
        <div class="panel-title">👤 Разработчик</div>
        <div class="hp-bar-wrap">
          <div class="hp-bar" id="hpBar"></div>
          <span id="hpText">50/50</span>
        </div>
        <div class="stats-list">
          <span>⚔️ ATK: <strong id="statAtk">5</strong></span>
          <span>🛡️ DEF: <strong id="statDef">0</strong></span>
          <span>⭐ LVL: <strong id="statLvl">1</strong></span>
          <span>🎯 Floor: <strong id="statFloor">1</strong></span>
        </div>
      </div>

      <!-- Combat log -->
      <div id="combatLog">
        <div class="panel-title">📋 Лог</div>
        <div id="logLines"></div>
      </div>

      <!-- Legend -->
      <div id="legend">
        <div class="panel-title">🗺️ Легенда</div>
        <div class="legend-item"><span class="l-char player">@</span> Ты</div>
        <div class="legend-item"><span class="l-char bug">b</span> Баг</div>
        <div class="legend-item"><span class="l-char null">N</span> NullPtr</div>
        <div class="legend-item"><span class="l-char seg">X</span> SegFault</div>
        <div class="legend-item"><span class="l-char loop">∞</span> InfLoop</div>
        <div class="legend-item"><span class="l-char item-c">c</span> Кофе (лечит)</div>
        <div class="legend-item"><span class="l-char item-d">?</span> Доки (опыт)</div>
        <div class="legend-item"><span class="l-char stair">&gt;</span> Лестница</div>
        <div style="margin-top:6px;color:#6b7a99;font-size:11px;">WASD / ← → ↑ ↓ — движение</div>
        <div style="color:#6b7a99;font-size:11px;">. или Space — пропустить ход</div>
      </div>

      <!-- Controls -->
      <div id="controls">
        <button id="btnRestart">🔄 Начать заново</button>
        <a href="idle.php" class="btn-back">← В игру</a>
      </div>

    </div>
  </div>

  <!-- DEATH / WIN OVERLAY -->
  <div id="gameOverlay" style="display:none;">
    <div id="overlayCard">
      <div id="overlayEmoji"></div>
      <h2 id="overlayTitle"></h2>
      <p id="overlayText"></p>
      <div id="overlayReward"></div>
      <button id="overlayRestart">🔄 Ещё раз</button>
      <a href="idle.php" id="overlayReturn">← В игру (применить награду)</a>
    </div>
  </div>

</div><!-- /dungeonWrap -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="js/dungeon.js"></script>
</body>
</html>
