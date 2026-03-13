<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap/app.php';

\App\Bootstrap\AppBootstrap::bootWeb();

$isLoggedIn = isset($_SESSION['user_id']);
$username   = $_SESSION['username'] ?? null;

$hour = (int) date('H');

if ($hour >= 5 && $hour < 12) {
    $greeting = 'Доброе утро, инженер! Кофе ещё не готов, но код ждать не будет.';
} elseif ($hour >= 12 && $hour < 18) {
    $greeting = 'Добрый день, разработчик! Самое время писать код и притворяться что читаешь документацию.';
} elseif ($hour >= 18 && $hour < 23) {
    $greeting = 'Добрый вечер, кодер! Работаешь допоздна? Значит дедлайн уже вчера.';
} else {
    $greeting = 'Ещё не спишь, коллега? Настоящие программисты работают ночью. Или у них баг в проде.';
}
?>
<!DOCTYPE html>
<html lang="ru">
<?php
$pageTitle = 'Код и Кофе — Idle Game';
$pageIcon = '💻';
$pageStyles = ['css/idle.css'];
$pageUseFontAwesome = true;
$pageExtraHead = ['  <script src="https://telegram.org/js/telegram-web-app.js" async></script>'];
require __DIR__ . '/templates/partials/app-head.php';
?>
<body>

<!-- USER BAR -->
<div id="userBar">
  <?php if ($isLoggedIn): ?>
    <span class="ub-user">👤 <?= htmlspecialchars($username) ?></span>
    <a href="profile.php" class="ub-link">🏪 Магазин престижа</a>
    <a href="leaderboard.php" class="ub-link">🏆 Таблица</a>
    <a href="#" class="ub-link ub-logout" id="logoutBtn">Выйти</a>
  <?php else: ?>
    <span class="ub-guest">👤 Гость — <a href="auth.php" class="ub-guest-link">войди</a> чтобы сохранять прогресс</span>
    <a href="leaderboard.php" class="ub-link">🏆 Таблица лидеров</a>
  <?php endif; ?>
</div>

<!-- TOP BAR -->
<div id="topbar">
  <div id="topbar-left">
    <a href="index.php" class="back-link"><i class="fas fa-arrow-left"></i> На главную</a>
    <span class="game-title"><span class="tb-bracket">&lt;</span>Код и Кофе<span class="tb-bracket">/&gt;</span></span>
  </div>
  <div id="topbar-center">
    <div class="tb-stat-main">
      <span class="tb-loc-num" id="tbLoc">0</span>
      <span class="tb-loc-label">строк кода</span>
    </div>
    <div class="tb-stat-sub">
      <span><span id="tbLps">0</span> ЛОК/с</span>
      <span class="tb-sep">·</span>
      <span>Всего: <span id="tbTotal">0</span></span>
    </div>
  </div>
  <div id="topbar-right">
    <div class="tb-account-level">
      <span class="account-level-badge" id="accountLevelBadge">Ур. 1 · Стажёр</span>
    </div>
    <div id="prestigeInfo" style="display:none;">
      <span class="prestige-badge">✨ Престиж <span id="tbPrestige">0</span></span>
      <span class="prestige-multi">×<span id="tbPrestigeMulti">1.0</span></span>
    </div>
  </div>
</div>

<!-- MAIN LAYOUT -->
<div id="gameLayout">

  <!-- LEFT PANEL -->
  <div id="leftPanel">

    <!-- Greeting from PHP -->
    <div id="greeting">
      <span class="greeting-icon">☕</span>
      <span id="greetingText"><?= htmlspecialchars($greeting) ?></span>
    </div>

    <!-- BIG CLICK BUTTON -->
    <div id="clickArea">
      <div id="clickBtnWrap">
        <button id="clickBtn">
          <span class="click-icon">&lt;/&gt;</span>
          <span class="click-ripple"></span>
        </button>
        <div class="click-glow"></div>
      </div>
      <div id="clickStats">
        ЛОК/клик: <span id="lpcDisplay" class="stat-val">1</span>
        <span id="eventBadge" class="event-badge" style="display:none;"></span>
      </div>
    </div>

    <!-- NEWS TICKER -->
    <div id="newsTicker">
      <div class="ticker-label"><i class="fas fa-terminal"></i> stdout:</div>
      <div class="ticker-track" id="tickerTrack">
        <div class="ticker-item" id="tickerText">Загрузка...</div>
      </div>
    </div>

    <!-- PRESTIGE OO DISPLAY -->
    <div id="ooDisplay" style="display:none;">
      <span class="oo-icon">⭐</span>
      <span class="oo-text">Очки Опыта: <span id="ooValue" class="oo-val">0</span></span>
      <a href="profile.php" class="oo-shop-link">Магазин →</a>
    </div>

    <!-- PRESTIGE BUTTON -->
    <button id="prestigeBtn" style="display:none;">
      <i class="fas fa-sync-alt"></i> Переписать с нуля
      <span class="prestige-hint">×1.5 к производительности навсегда</span>
    </button>
    <div id="prestigeHint" class="prestige-hint-bar" style="display:none;"></div>

    <!-- STATS MINI -->
    <div id="miniStats">
      <div class="ms-row"><span class="ms-label">Кликов:</span><span class="ms-val" id="statClicks">0</span></div>
      <div class="ms-row"><span class="ms-label">Событий:</span><span class="ms-val" id="statEvents">0</span></div>
      <div class="ms-row"><span class="ms-label">Престижей:</span><span class="ms-val" id="statPrestige">0</span></div>
    </div>

  </div><!-- /leftPanel -->

  <!-- RIGHT PANEL -->
  <div id="rightPanel">

    <!-- TABS -->
    <div id="shopTabs">
      <button class="tab-btn active" data-tab="buildings">
        <i class="fas fa-users"></i> Сотрудники <span class="tab-count" id="buildingCount">0</span>
      </button>
      <button class="tab-btn" data-tab="upgrades">
        <i class="fas fa-arrow-up"></i> Улучшения <span class="tab-count" id="upgradeCount">0</span>
      </button>
      <button class="tab-btn" data-tab="achievements">
        <i class="fas fa-trophy"></i> Достижения <span class="tab-count" id="achieveCount">0</span>
      </button>
      <button class="tab-btn" data-tab="progress">
        <i class="fas fa-map"></i> Прогресс
      </button>
    </div>

    <!-- TAB CONTENT -->
    <div id="tab-buildings" class="tab-content active">
      <div id="buildingsList"></div>
    </div>

    <div id="tab-upgrades" class="tab-content" style="display:none;">
      <div id="upgradesList"></div>
    </div>

    <div id="tab-achievements" class="tab-content" style="display:none;">
      <div id="achievementsList"></div>
    </div>

    <div id="tab-progress" class="tab-content" style="display:none;">
      <div id="progressTabContent"></div>
    </div>

  </div><!-- /rightPanel -->

</div><!-- /gameLayout -->

<!-- ACTIVITIES BAR -->
<div id="activitiesBar"></div>

<!-- TOAST CONTAINER -->
<div id="toastContainer"></div>

<!-- PRESTIGE OVERLAY -->
<div id="prestigeOverlay" style="display:none;">
  <div id="prestigeModal">
    <div class="pm-icon">🔄</div>
    <h2>ПЕРЕПИСЫВАЕМ С НУЛЯ...</h2>
    <p class="pm-sub">Удаляем технический долг. Обнуляем всё. Начинаем правильно.</p>
    <div class="pm-progress">
      <div class="pm-bar" id="pmBar"></div>
    </div>
    <div class="pm-status" id="pmStatus">git reset --hard HEAD~∞</div>
  </div>
</div>


<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script>
  const PHP_GREETING  = <?= json_encode($greeting, JSON_UNESCAPED_UNICODE) ?>;
  const IS_LOGGED_IN  = <?= $isLoggedIn ? 'true' : 'false' ?>;
  let CSRF_TOKEN      = <?= json_encode(app_csrf_token(), JSON_UNESCAPED_UNICODE) ?>;
  const APP_ENV       = <?= json_encode((string) \App\Bootstrap\Config::get('app.env', 'development'), JSON_UNESCAPED_UNICODE) ?>;

  async function refreshCsrfToken() {
    if (!window.ApiSession) {
      return CSRF_TOKEN;
    }

    try {
      const token = await window.ApiSession.getCsrfToken(true);
      if (token) {
        CSRF_TOKEN = token;
      }
    } catch (error) {}

    return CSRF_TOKEN;
  }

  if (APP_ENV === 'development') {
    window.devResetAccountProgress = async function devResetAccountProgress() {
      if (!IS_LOGGED_IN) {
        throw new Error('Сброс аккаунта доступен только для залогиненного пользователя.');
      }

      const csrf = await refreshCsrfToken();
      const response = await fetch('ajax/save.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf,
        },
        body: JSON.stringify({
          action: 'reset_progress',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Не удалось сбросить прогресс.');
      }

      window.__DEV_RESETTING_PROGRESS = true;
      if (window.IdleRuntime && typeof window.IdleRuntime.createInitialState === 'function') {
        window.state = window.IdleRuntime.createInitialState();
      }
      localStorage.removeItem('kodikofee_save');
      localStorage.removeItem('minigame_reward');
      window.location.reload();
      return data;
    };
  }

  refreshCsrfToken();
</script>
<script src="data/game/idle-balance.js"></script>
<script src="js/idle-runtime.js"></script>
<script src="js/idle-data.js"></script>
<script src="js/idle-economy.js"></script>
<script src="js/idle-save.js"></script>
<script src="js/idle-render.js"></script>
<script src="js/idle-actions.js"></script>
<script src="js/idle.js"></script>
<?php require __DIR__ . '/templates/partials/logout-script.php'; ?>
</body>
</html>
