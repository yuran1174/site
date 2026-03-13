<?php
declare(strict_types=1);

$season1CssVersion = (string) @filemtime(public_path('css/season1.css'));
$season1JsVersion = (string) @filemtime(public_path('js/season1/main.js'));
?>
<!DOCTYPE html>
<html lang="ru">
<?php
$pageTitle = 'Season 1: Скуф-пати';
$pageIcon = '🎮';
$pageStyles = ['css/season1.css?v=' . rawurlencode($season1CssVersion)];
$pageUseFontAwesome = true;
$renderer->renderPartial('app-head', compact('pageTitle', 'pageIcon', 'pageStyles', 'pageUseFontAwesome'));
?>
<body class="season1-body">
<div id="s1UserBar">
  <?php if ($isLoggedIn): ?>
    <span class="s1-ub-user">👤 <?= htmlspecialchars((string) $username) ?></span>
    <a href="profile.php" class="s1-ub-link">🏪 Мета-прогресс</a>
    <a href="leaderboard.php" class="s1-ub-link">🏆 Рейтинг</a>
    <a href="#" class="s1-ub-link s1-ub-logout" id="logoutBtn">Выйти</a>
  <?php else: ?>
    <span class="s1-ub-guest">👤 Гость — <a href="auth.php" class="s1-ub-guest-link">войди</a> чтобы сохранять студию</span>
    <a href="leaderboard.php" class="s1-ub-link">🏆 Таблица лидеров</a>
  <?php endif; ?>
</div>

<main id="s1AppShell">
  <header id="s1TopHud">
    <div class="s1-top-left">
      <a href="index.php" class="s1-back-link"><i class="fas fa-arrow-left"></i> На главную</a>
      <div class="s1-title-block">
        <p class="s1-kicker">Season 1: Скуф-пати</p>
        <h1>Phaser + TypeScript Idle Slice</h1>
      </div>
    </div>
    <div class="s1-top-center">
      <div class="s1-cycle-badge" id="s1CycleStatus">Цикл стабилен</div>
      <p id="s1HudPhase">Герой ещё собирает форму и ритм вокруг проекта.</p>
    </div>
    <div class="s1-hud-grid">
      <div class="s1-hud-card"><span>Day</span><strong id="s1HudDay">День 1</strong></div>
      <div class="s1-hud-card"><span>Weekday</span><strong id="s1HudWeekday">Понедельник</strong></div>
      <div class="s1-hud-card"><span>Mode</span><strong id="s1HudMode">Выживание</strong></div>
      <div class="s1-hud-card"><span>Money</span><strong id="s1HudMoney">0 ₽</strong></div>
      <div class="s1-hud-card"><span>Energy</span><strong id="s1HudEnergy">0</strong></div>
      <div class="s1-hud-card"><span>Focus</span><strong id="s1HudFocus">0</strong></div>
      <div class="s1-hud-card"><span>Mood</span><strong id="s1HudMood">0</strong></div>
      <div class="s1-hud-card"><span>Stress</span><strong id="s1HudStress">0</strong></div>
    </div>
  </header>

  <section id="s1MainGrid">
    <aside class="s1-side-column">
      <section class="s1-panel">
        <div class="s1-panel-head">
          <span class="s1-panel-kicker">Idle Results Rail</span>
          <h2>Последствия последнего idle-прогона</h2>
        </div>
        <div id="s1ResultsRail" class="s1-results-list"></div>
      </section>

      <section class="s1-panel">
        <div class="s1-panel-head">
          <span class="s1-panel-kicker">Cycle Alerts</span>
          <h2>Критические сигналы цикла</h2>
        </div>
        <ul id="s1AlertsList" class="s1-alerts-list"></ul>
      </section>

      <section class="s1-panel">
        <div class="s1-panel-head">
          <span class="s1-panel-kicker">Progress Shelf</span>
          <h2>Долгий мета-сдвиг</h2>
        </div>
        <div id="s1ProgressShelf" class="s1-shelf-grid"></div>
      </section>
    </aside>

    <section class="s1-stage-column">
      <section class="s1-panel s1-stage-panel">
        <div class="s1-panel-head">
          <span class="s1-panel-kicker">Room Stage</span>
          <h2>Комната героя как центр idle-цикла</h2>
        </div>
        <div id="s1PhaserStageWrap">
          <div id="s1PhaserStage"></div>
        </div>
        <p id="s1StageCaption" class="s1-stage-caption">Герой ещё собирает форму и ритм вокруг проекта.</p>
        <div class="s1-stage-actions">
          <button id="s1RunCycleBtn" type="button">Прогнать ещё один цикл</button>
          <button id="s1ResetBtn" type="button" class="is-secondary">Сбросить slice</button>
        </div>
        <p id="s1CycleHint" class="s1-cycle-hint">Авто-цикл тикает сам.</p>
      </section>

      <div class="s1-bottom-grid">
        <section class="s1-panel">
          <div class="s1-panel-head">
            <span class="s1-panel-kicker">Project Panel</span>
            <h2>Живой контур проекта</h2>
          </div>
          <div id="s1ProjectSummary" class="s1-project-summary"></div>
          <div id="s1ProjectBars" class="s1-project-bars"></div>
        </section>

        <section class="s1-panel">
          <div class="s1-panel-head">
            <span class="s1-panel-kicker">People / Circle Panel</span>
            <h2>Люди, которые реально меняют цикл</h2>
          </div>
          <div id="s1PeopleList" class="s1-people-list"></div>
        </section>
      </div>
    </section>

    <aside class="s1-control-column">
      <section class="s1-panel">
        <div class="s1-panel-head">
          <span class="s1-panel-kicker">Routine Controls Panel</span>
          <h2>Рычаги перенастройки</h2>
        </div>
        <div class="s1-control-group">
          <h3>Life Mode</h3>
          <div id="s1LifeModeControls" class="s1-option-grid"></div>
        </div>
        <div class="s1-control-group">
          <h3>Project Focus</h3>
          <div id="s1ProjectFocusControls" class="s1-pill-grid"></div>
        </div>
        <div class="s1-control-group">
          <h3>Evening Slots</h3>
          <div id="s1EveningSlots" class="s1-slot-stack"></div>
        </div>
        <div class="s1-control-group">
          <h3>Social Priority</h3>
          <div id="s1SocialPriority" class="s1-person-stack"></div>
        </div>
      </section>

      <section class="s1-panel">
        <div class="s1-panel-head">
          <span class="s1-panel-kicker">Narrative Feed</span>
          <h2>Короткие beats по итогам цикла</h2>
        </div>
        <div id="s1FeedList" class="s1-feed-list"></div>
      </section>
    </aside>
  </section>
</main>

<script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"></script>
<script>
window.SEASON1_BOOTSTRAP = {
  playerName: <?= json_encode($username ?: 'Герой', JSON_UNESCAPED_UNICODE) ?>,
  isLoggedIn: <?= $isLoggedIn ? 'true' : 'false' ?>,
};
</script>
<script type="module" src="js/season1/main.js?v=<?= htmlspecialchars(rawurlencode($season1JsVersion), ENT_QUOTES) ?>"></script>
</body>
</html>
