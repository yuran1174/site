<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap/app.php';

\App\Bootstrap\AppBootstrap::bootPage();

$isLoggedIn = isset($_SESSION['user_id']);
$username   = isset($_SESSION['username']) ? (string) $_SESSION['username'] : null;
$cssVer     = (string) @filemtime(__DIR__ . '/css/season1.css');
$jsVer      = (string) @filemtime(__DIR__ . '/js/season1/main.js');
?>
<!DOCTYPE html>
<html lang="ru">
<?php
$pageTitle       = 'Инди-дев Тайкун — Season 1';
$pageIcon        = '🎮';
$pageStyles      = ['css/season1.css?v=' . rawurlencode($cssVer)];
$pageUseFontAwesome = false;
require __DIR__ . '/templates/partials/app-head.php';
?>
<body class="season1-body">

<div id="s1UserBar">
  <?php if ($isLoggedIn): ?>
    <span>👤 <?= htmlspecialchars($username ?? '') ?></span>
    <a href="profile.php"     class="s1-ub-link">Мета-прогресс</a>
    <a href="leaderboard.php" class="s1-ub-link">Рейтинг</a>
    <a href="#" class="s1-ub-logout" id="logoutBtn">Выйти</a>
  <?php else: ?>
    <span>👤 Гость — <a href="auth.php">войди</a> чтобы сохранять прогресс</span>
    <a href="leaderboard.php" class="s1-ub-link">Рейтинг</a>
  <?php endif; ?>
</div>

<div id="s1App">

  <!-- ── Top bar ── -->
  <div id="s1Bar">
    <div class="s1-bar-cell" id="s1Day">
      <span class="s1-bar-label">День</span>
      <span class="s1-bar-val">1</span>
    </div>
    <div class="s1-bar-cell" id="s1Money">
      <span class="s1-bar-label">💰 Деньги</span>
      <span class="s1-bar-val">2 500 ₽</span>
    </div>
    <div class="s1-bar-cell" id="s1Fans">
      <span class="s1-bar-label">👥 Фанаты</span>
      <span class="s1-bar-val">0</span>
    </div>
    <div class="s1-bar-cell" id="s1Rep">
      <span class="s1-bar-label">⭐ Реп</span>
      <span class="s1-bar-val">0</span>
    </div>
    <div class="s1-bar-cell">
      <span id="s1TickStatus" class="s1-tick-status is-ok">● авто</span>
    </div>
  </div>

  <!-- ── Main grid ── -->
  <div id="s1Grid">

    <!-- LEFT: Developer panel -->
    <div class="s1-col" id="s1DevCol">

      <div id="s1DevPortrait" data-mood="fresh">
        <div class="s1-portrait-emoji">🧑‍💻</div>
        <div class="s1-portrait-meta">
          <div class="s1-portrait-name"><?= htmlspecialchars($username ?? 'Скуф') ?></div>
          <div class="s1-portrait-state">в потоке</div>
        </div>
      </div>

      <div>
        <div class="s1-section-label" style="margin-bottom:12px">Навыки</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div class="s1-stat-row" id="s1StatCoding" data-type="coding">
            <span class="s1-stat-name">Coding</span>
            <div class="s1-stat-track"><div class="s1-stat-fill" style="width:35%"></div></div>
            <span class="s1-stat-num">35</span>
          </div>
          <div class="s1-stat-row" id="s1StatDesign" data-type="design">
            <span class="s1-stat-name">Design</span>
            <div class="s1-stat-track"><div class="s1-stat-fill" style="width:18%"></div></div>
            <span class="s1-stat-num">18</span>
          </div>
          <div class="s1-stat-row" id="s1StatEndurance" data-type="endurance">
            <span class="s1-stat-name">Endurance</span>
            <div class="s1-stat-track"><div class="s1-stat-fill" style="width:75%"></div></div>
            <span class="s1-stat-num">75</span>
          </div>
        </div>
      </div>

      <div class="s1-studio-meta">
        <span id="s1StudioTier">Спальня</span>
        <span id="s1PortfolioCount">0 проектов</span>
      </div>

      <div>
        <div class="s1-section-label" style="margin-bottom:10px">Портфолио</div>
        <div id="s1Portfolio">
          <p class="s1-empty-hint">Ни одного релиза. Пора начать.</p>
        </div>
      </div>

    </div><!-- /left -->

    <!-- CENTER: Studio -->
    <div class="s1-col" id="s1StudioCol">
      <div id="s1StudioPanel"></div>
    </div>

    <!-- RIGHT: Controls -->
    <div class="s1-col" id="s1ControlCol">

      <div>
        <div class="s1-section-label" style="margin-bottom:10px">Чем занят</div>
        <div id="s1ActivityList"></div>
      </div>

      <div>
        <div class="s1-section-label" style="margin-bottom:10px">Команда</div>
        <div id="s1TeamList"></div>
      </div>

    </div><!-- /right -->

  </div><!-- /grid -->

  <!-- Event log -->
  <div id="s1EventRow">
    <div class="s1-events-label">Лог событий</div>
    <div id="s1EventLog"></div>
  </div>

</div><!-- /app -->

<script>
window.SEASON1_BOOTSTRAP = {
  playerName: <?= json_encode($username ?: 'Скуф', JSON_UNESCAPED_UNICODE) ?>,
  isLoggedIn: <?= $isLoggedIn ? 'true' : 'false' ?>,
};
</script>
<script type="module" src="js/season1/main.js?v=<?= htmlspecialchars(rawurlencode($jsVer), ENT_QUOTES) ?>"></script>

</body>
</html>
