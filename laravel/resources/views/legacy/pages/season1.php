<?php
declare(strict_types=1);
?>
<!DOCTYPE html>
<html lang="ru">
<?php
$pageTitle = 'Season 1 Idle — Скуф-пати';
$pageIcon = '🌆';
$pageStyles = ['css/season1.css'];
$pageUseFontAwesome = true;
$renderer->renderPartial('app-head', compact('pageTitle', 'pageIcon', 'pageStyles', 'pageUseFontAwesome'));
?>
<body class="season1-body">
<div class="s1-shell">
  <header class="s1-topbar">
    <div>
      <a href="index.php" class="s1-back"><i class="fas fa-arrow-left"></i> На главную</a>
      <p class="s1-kicker">Idle-slice season 1</p>
      <h1>Season 1: Скуф-пати Idle</h1>
      <p class="s1-subtitle">Новый idle-entrypoint новой версии. Игрок настраивает рутину, слоты и приоритеты, а цикл сам проживает дни и возвращает последствия.</p>
    </div>
    <div class="s1-topbar-meta">
      <div class="s1-pill"><?= $isLoggedIn ? 'Игрок: '.htmlspecialchars((string) $username) : 'Гостевой прогон' ?></div>
      <div class="s1-pill">Entry: <strong>/season1.php</strong></div>
      <button class="s1-primary-button" id="runCycleNow" type="button">Прогнать idle-цикл</button>
    </div>
  </header>

  <section class="s1-hud">
    <div class="s1-hud-main">
      <div>
        <p class="s1-label">Top HUD</p>
        <h2 id="hudDay">Понедельник, день 1</h2>
      </div>
      <span class="s1-phase" id="cycleStatus">Цикл стабилизируется</span>
    </div>
    <div class="s1-hud-stats" id="hudStats"></div>
  </section>

  <main class="s1-layout">
    <section class="s1-panel s1-room-panel">
      <div class="s1-panel-head">
        <div>
          <p class="s1-label">Room Stage</p>
          <h2 id="roomTitle">Комната героя</h2>
        </div>
        <span class="s1-tag" id="roomMoodTag">Собирается</span>
      </div>
      <div class="s1-room-stage" id="roomStage">
        <div class="s1-room-illustration" aria-hidden="true">
          <span class="s1-room-light"></span>
          <span class="s1-room-monitor"></span>
          <span class="s1-room-hero">Герой</span>
          <span class="s1-room-cat">Кэш</span>
        </div>
        <div class="s1-room-copy">
          <p id="roomSummary">Загрузка комнаты...</p>
          <div class="s1-inline-stats" id="roomStats"></div>
        </div>
      </div>
    </section>

    <section class="s1-panel s1-results-panel">
      <div class="s1-panel-head">
        <div>
          <p class="s1-label">Idle Results Rail</p>
          <h2>Итог последнего прогона</h2>
        </div>
        <span class="s1-tag" id="lastTickInfo">Ждём первый тик</span>
      </div>
      <div class="s1-results-grid" id="resultsRail"></div>
    </section>

    <section class="s1-panel s1-controls-panel">
      <div class="s1-panel-head">
        <div>
          <p class="s1-label">Routine Controls Panel</p>
          <h2>Перенастрой цикл</h2>
        </div>
        <button class="s1-reset" id="resetRun" type="button">Сбросить прогон</button>
      </div>

      <div class="s1-control-group">
        <h3>life_mode</h3>
        <div class="s1-segmented" id="lifeModeControl"></div>
      </div>

      <div class="s1-control-group">
        <h3>Вечерние слоты</h3>
        <div class="s1-slots" id="slotControls"></div>
      </div>

      <div class="s1-control-group">
        <h3>project_focus</h3>
        <div class="s1-segmented" id="projectFocusControl"></div>
      </div>

      <div class="s1-control-group">
        <h3>social_priority</h3>
        <p class="s1-helper">Выбери до двух людей, которые будут главным social modifier следующего idle-цикла.</p>
        <div class="s1-priority-list" id="socialPriorityControl"></div>
      </div>
    </section>

    <section class="s1-panel s1-project-panel">
      <div class="s1-panel-head">
        <div>
          <p class="s1-label">Project Panel</p>
          <h2 id="projectTitle">Проект пока буксует</h2>
        </div>
        <span class="s1-tag" id="projectTag">clarify</span>
      </div>
      <p class="s1-panel-copy" id="projectSummary">Загрузка проекта...</p>
      <div class="s1-inline-stats" id="projectStats"></div>
    </section>

    <section class="s1-panel s1-people-panel">
      <div class="s1-panel-head">
        <div>
          <p class="s1-label">People / Circle Panel</p>
          <h2>Кто реально влияет на цикл</h2>
        </div>
      </div>
      <div class="s1-inline-stats" id="groupStats"></div>
      <div class="s1-people-list" id="peopleList"></div>
    </section>

    <section class="s1-panel s1-alerts-panel">
      <div class="s1-panel-head">
        <div>
          <p class="s1-label">Cycle Alerts</p>
          <h2>Что сейчас трещит или наконец работает</h2>
        </div>
      </div>
      <div class="s1-alerts-wrap">
        <div>
          <h3 class="s1-subheading">Alerts</h3>
          <div class="s1-alert-list" id="alertList"></div>
        </div>
        <div>
          <h3 class="s1-subheading">Positive States</h3>
          <div class="s1-alert-list" id="positiveList"></div>
        </div>
      </div>
    </section>

    <section class="s1-panel s1-feed-panel">
      <div class="s1-panel-head">
        <div>
          <p class="s1-label">Narrative Feed</p>
          <h2>Последние системные и человеческие сдвиги</h2>
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
