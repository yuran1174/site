<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap/app.php';

\App\Bootstrap\AppBootstrap::bootPage();

$isLoggedIn = isset($_SESSION['user_id']);
$username = isset($_SESSION['username']) ? (string) $_SESSION['username'] : null;
?>
<!DOCTYPE html>
<html lang="ru">
<?php
$pageTitle = 'Season 1 — Скуф-пати';
$pageIcon = '🌆';
$pageStyles = ['css/season1.css'];
$pageUseFontAwesome = true;
require __DIR__ . '/templates/partials/app-head.php';
?>
<body class="season1-body">
<div class="s1-shell">
  <header class="s1-topbar">
    <div>
      <a href="index.php" class="s1-back"><i class="fas fa-arrow-left"></i> На главную</a>
      <p class="s1-kicker">Vertical slice новой игры</p>
      <h1>Season 1: Скуф-пати</h1>
      <p class="s1-subtitle">Отдельный playable-срез взрослой жизни, проекта и старых связей. Legacy idle не участвует.</p>
    </div>
    <div class="s1-topbar-meta">
      <div class="s1-pill"><?= $isLoggedIn ? 'Игрок: '.htmlspecialchars($username) : 'Гостевой прогон' ?></div>
      <div class="s1-pill">Entry: <strong>/season1.php</strong></div>
    </div>
  </header>

  <main class="s1-layout">
    <section class="s1-panel s1-day-panel">
      <div class="s1-panel-head">
        <div>
          <p class="s1-label">Состояние дня</p>
          <h2 id="dayTitle">День 1</h2>
        </div>
        <span class="s1-phase" id="phaseBadge">Вечер</span>
      </div>
      <p class="s1-day-text" id="dayMood">Загрузка состояния...</p>
      <div class="s1-stats-grid" id="statusStats"></div>
    </section>

    <section class="s1-panel s1-room-panel">
      <div class="s1-panel-head">
        <div>
          <p class="s1-label">Комната и жизнь</p>
          <h2 id="roomTitle">Съёмная комната</h2>
        </div>
      </div>
      <div class="s1-room-stage">
        <div class="s1-room-illustration" aria-hidden="true">
          <span class="s1-room-light"></span>
          <span class="s1-room-monitor"></span>
          <span class="s1-room-cat">Кэш</span>
        </div>
        <div class="s1-room-copy">
          <p id="roomSummary">Загрузка комнаты...</p>
          <div class="s1-inline-stats" id="roomStats"></div>
        </div>
      </div>
    </section>

    <section class="s1-panel s1-project-panel">
      <div class="s1-panel-head">
        <div>
          <p class="s1-label">Проект</p>
          <h2 id="projectTitle">Идея ещё сырая</h2>
        </div>
      </div>
      <p class="s1-panel-copy" id="projectSummary">Загрузка проекта...</p>
      <div class="s1-inline-stats" id="projectStats"></div>
    </section>

    <section class="s1-panel s1-people-panel">
      <div class="s1-panel-head">
        <div>
          <p class="s1-label">Люди</p>
          <h2>Кого держишь рядом</h2>
        </div>
      </div>
      <div class="s1-people-list" id="peopleList"></div>
    </section>

    <section class="s1-panel s1-actions-panel">
      <div class="s1-panel-head">
        <div>
          <p class="s1-label">Вечернее решение</p>
          <h2>Выбери один главный шаг</h2>
        </div>
        <button class="s1-reset" id="resetRun" type="button">Сбросить прогон</button>
      </div>
      <div class="s1-actions-list" id="actionsList"></div>
    </section>

    <section class="s1-panel s1-feed-panel">
      <div class="s1-panel-head">
        <div>
          <p class="s1-label">Последствия</p>
          <h2>Лента дней</h2>
        </div>
      </div>
      <div class="s1-feed" id="feedList"></div>
    </section>
  </main>
</div>

<script>
window.SEASON1_BOOTSTRAP = {
  playerName: <?= json_encode($username ?: 'Герой', JSON_UNESCAPED_UNICODE) ?>,
  isLoggedIn: <?= $isLoggedIn ? 'true' : 'false' ?>,
};
</script>
<script src="js/season1.js"></script>
</body>
</html>
