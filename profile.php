<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: auth.php');
    exit;
}

$userId   = (int)$_SESSION['user_id'];
$username = $_SESSION['username'] ?? '';
$db       = DB::get();

// Load user info
$userStmt = $db->prepare('SELECT created_at, last_seen FROM users WHERE id = ?');
$userStmt->execute([$userId]);
$userRow = $userStmt->fetch();

// Load save data
$saveStmt = $db->prepare('SELECT save_data FROM game_saves WHERE user_id = ?');
$saveStmt->execute([$userId]);
$saveRow  = $saveStmt->fetch();
$save     = $saveRow ? json_decode($saveRow['save_data'], true) : [];
if (!is_array($save)) $save = [];

$totalLoc         = (float)($save['totalLoc'] ?? 0);
$prestige         = (int)($save['prestige'] ?? 0);
$prestigePoints   = (int)($save['prestigePoints'] ?? 0);
$totalOO          = (int)($save['totalPrestigePoints'] ?? 0);
$prestigeShop     = $save['prestigeShop'] ?? [];
$achievements     = $save['achievements'] ?? [];
$achieveCount     = count(array_filter($achievements));

function fmtLoc(float $n): string {
    if ($n < 1000)  return number_format($n, 0);
    if ($n < 1e6)   return number_format($n/1e3, 1) . 'K';
    if ($n < 1e9)   return number_format($n/1e6, 2) . 'M';
    if ($n < 1e12)  return number_format($n/1e9, 2) . 'B';
    return number_format($n/1e12, 2) . 'T';
}

function prestigeTitle(int $p): string {
    if ($p === 0) return 'Новичок';
    if ($p < 3)   return 'Джуниор';
    if ($p < 5)   return 'Мидл';
    if ($p < 10)  return 'Сеньор';
    if ($p < 20)  return 'Тимлид';
    return 'Легенда';
}

$SHOP_ITEMS = [
    [
        'id' => 'coffee_iv', 'name' => 'Кофейная зависимость', 'emoji' => '☕',
        'cost' => 1, 'maxLevel' => 5,
        'desc' => 'ЛОК/клик +10% за уровень. (макс. +50%)',
        'effect' => 'clickMulti: +10% за уровень',
        'requiresPrestige' => 0,
    ],
    [
        'id' => 'veteran', 'name' => 'Ветеран', 'emoji' => '🎖️',
        'cost' => 2, 'maxLevel' => 1,
        'desc' => 'Начинаешь каждый ран с 500 ЛОК × уровень престижа.',
        'effect' => 'startLoc: +500 × престиж',
        'requiresPrestige' => 0,
    ],
    [
        'id' => 'discount', 'name' => 'Связи в индустрии', 'emoji' => '🤝',
        'cost' => 3, 'maxLevel' => 3,
        'desc' => 'Все здания на 10% дешевле за уровень.',
        'effect' => 'buildingCostMult: -10% за уровень',
        'requiresPrestige' => 0,
    ],
    [
        'id' => 'automator', 'name' => 'Автоматизация', 'emoji' => '🤖',
        'cost' => 4, 'maxLevel' => 1,
        'desc' => 'Первый джун каждого рана нанимается бесплатно.',
        'effect' => 'freeFirstJunior: true',
        'requiresPrestige' => 0,
    ],
    [
        'id' => 'legacy', 'name' => 'Легаси-код в крови', 'emoji' => '🧬',
        'cost' => 5, 'maxLevel' => 1,
        'desc' => 'Разблокировать постройку «Легаси-система» (5000 ЛОК/с).',
        'effect' => 'unlockLegacy: true',
        'requiresPrestige' => 3,
    ],
    [
        'id' => 'ai_assist', 'name' => 'ИИ-помощник', 'emoji' => '🤖',
        'cost' => 8, 'maxLevel' => 1,
        'desc' => 'Разблокировать постройку «ИИ Копилот» (25000 ЛОК/с).',
        'effect' => 'unlockAI: true',
        'requiresPrestige' => 5,
    ],
    [
        'id' => 'offline_boost', 'name' => 'Удалённая работа', 'emoji' => '🏠',
        'cost' => 2, 'maxLevel' => 3,
        'desc' => 'Оффлайн-прогресс +4 часа за уровень (макс. +12ч = 20ч итого).',
        'effect' => 'offlineHours: +4 за уровень',
        'requiresPrestige' => 0,
    ],
    [
        'id' => 'event_luck', 'name' => 'Счастливчик', 'emoji' => '🍀',
        'cost' => 3, 'maxLevel' => 2,
        'desc' => 'Шанс плохих событий -25% за уровень.',
        'effect' => 'badEventChance: -25% за уровень',
        'requiresPrestige' => 0,
    ],
];

$ACHIEVEMENTS_DATA = [
    // LOC
    ['id'=>'first_loc',   'name'=>'Hello World',              'emoji'=>'👋', 'desc'=>'Написать первую строку кода'],
    ['id'=>'loc_100',     'name'=>'Stack Overflow Lurker',    'emoji'=>'🔍', 'desc'=>'Накопить 100 ЛОК'],
    ['id'=>'loc_1k',      'name'=>'TODO Маньяк',              'emoji'=>'📝', 'desc'=>'Накопить 1 000 ЛОК'],
    ['id'=>'loc_10k',     'name'=>'Настоящий Программист',    'emoji'=>'💻', 'desc'=>'Накопить 10 000 ЛОК'],
    ['id'=>'loc_100k',    'name'=>'10x Developer',            'emoji'=>'🚀', 'desc'=>'Накопить 100 000 ЛОК'],
    ['id'=>'loc_1m',      'name'=>'Principal Engineer',       'emoji'=>'🏆', 'desc'=>'Накопить 1 000 000 ЛОК'],
    ['id'=>'loc_10m',     'name'=>'Фабрика кода',             'emoji'=>'🏭', 'desc'=>'10 миллионов ЛОК'],
    ['id'=>'loc_1b',      'name'=>'Мифический Программист',   'emoji'=>'🐉', 'desc'=>'Накопить 1 миллиард ЛОК'],
    ['id'=>'loc_1t',      'name'=>'Бог кода',                 'emoji'=>'⚡', 'desc'=>'1 триллион ЛОК'],
    // LOC per run
    ['id'=>'run_1m',      'name'=>'Миллион за ран',           'emoji'=>'💰', 'desc'=>'1М ЛОК за один перезапуск'],
    ['id'=>'run_10m',     'name'=>'Десять миллионов',         'emoji'=>'💎', 'desc'=>'10М ЛОК за один перезапуск'],
    ['id'=>'run_100m',    'name'=>'Сотня миллионов',          'emoji'=>'👑', 'desc'=>'100М ЛОК за один перезапуск'],
    ['id'=>'run_1b',      'name'=>'Миллиард за ран',          'emoji'=>'🌟', 'desc'=>'1B ЛОК за один перезапуск'],
    // Clicks
    ['id'=>'clicks_100',  'name'=>'Кнопкодав',                'emoji'=>'🖱️', 'desc'=>'Кликнуть 100 раз'],
    ['id'=>'clicks_1000', 'name'=>'Карпальный Туннель',       'emoji'=>'🤕', 'desc'=>'Кликнуть 1 000 раз'],
    ['id'=>'clicks_10k',  'name'=>'Туннельный синдром',       'emoji'=>'🤕', 'desc'=>'10 000 кликов'],
    ['id'=>'clicks_100k', 'name'=>'Киборг',                   'emoji'=>'🦾', 'desc'=>'100 000 кликов'],
    ['id'=>'clicks_1m',   'name'=>'Тренированный палец',      'emoji'=>'🦾', 'desc'=>'1 000 000 кликов'],
    // Buildings
    ['id'=>'first_junior','name'=>'Первый найм',              'emoji'=>'🐣', 'desc'=>'Нанять первого джуна'],
    ['id'=>'ten_juniors', 'name'=>'Джун-ферма',               'emoji'=>'🏭', 'desc'=>'10 джунов'],
    ['id'=>'25_juniors',  'name'=>'Джун-армия',               'emoji'=>'🐣', 'desc'=>'25 джунов в команде'],
    ['id'=>'first_senior','name'=>'Серьёзный человек',        'emoji'=>'🧙', 'desc'=>'Нанять первого сеньора'],
    ['id'=>'10_seniors',  'name'=>'Совет старейшин',          'emoji'=>'🧙', 'desc'=>'10 сеньоров'],
    ['id'=>'first_cto',   'name'=>'Мы серьёзная компания',    'emoji'=>'👔', 'desc'=>'Нанять CTO'],
    ['id'=>'5_cto',       'name'=>'Слишком много боссов',     'emoji'=>'👔', 'desc'=>'5 CTO одновременно'],
    ['id'=>'50_mid',      'name'=>'Армия мидлов',             'emoji'=>'👨‍💻','desc'=>'50 мидлов'],
    ['id'=>'10_techlead', 'name'=>'Паноптикум тимлидов',      'emoji'=>'📋', 'desc'=>'10 тимлидов'],
    ['id'=>'5_devops',    'name'=>'k8s-армия',                'emoji'=>'🐳', 'desc'=>'5 DevOps инженеров'],
    ['id'=>'3_architect', 'name'=>'Архитектурный совет',      'emoji'=>'📐', 'desc'=>'3 архитектора'],
    ['id'=>'total_50',    'name'=>'Стартап',                  'emoji'=>'🏢', 'desc'=>'50 сотрудников'],
    ['id'=>'100_total',   'name'=>'Корпорация',               'emoji'=>'🏙️', 'desc'=>'100 сотрудников'],
    ['id'=>'200_total',   'name'=>'Единорог',                 'emoji'=>'🦄', 'desc'=>'200 сотрудников'],
    ['id'=>'500_total',   'name'=>'Корпорация мечты',         'emoji'=>'🌆', 'desc'=>'500 сотрудников'],
    ['id'=>'all_types',   'name'=>'Полная команда',           'emoji'=>'🏢', 'desc'=>'Купить хотя бы 1 каждого типа'],
    // Upgrades
    ['id'=>'upgrade_10',  'name'=>'Шопоголик',                'emoji'=>'🛍️', 'desc'=>'Купить 10 улучшений'],
    // LPS
    ['id'=>'cps_1000',    'name'=>'Фабрика Кода',             'emoji'=>'⚙️', 'desc'=>'1 000 ЛОК/с'],
    ['id'=>'lps_100',     'name'=>'Конвейер',                 'emoji'=>'🚂', 'desc'=>'100 ЛОК/с'],
    ['id'=>'lps_10k',     'name'=>'Реактор',                  'emoji'=>'⚛️', 'desc'=>'10 000 ЛОК/с'],
    ['id'=>'lps_100k',    'name'=>'Гиперпроизводство',        'emoji'=>'🚀', 'desc'=>'100 000 ЛОК/с'],
    ['id'=>'lps_1m',      'name'=>'Сингулярность',            'emoji'=>'🌀', 'desc'=>'1 000 000 ЛОК/с'],
    // Prestige
    ['id'=>'prestige_1',  'name'=>'Переписать с нуля',        'emoji'=>'🔄', 'desc'=>'Первый престиж'],
    ['id'=>'prestige_2',  'name'=>'Дважды с нуля',            'emoji'=>'🔁', 'desc'=>'2 перезапуска'],
    ['id'=>'prestige_3',  'name'=>'Перфекционист',            'emoji'=>'🔁', 'desc'=>'3 перезапуска'],
    ['id'=>'prestige_5',  'name'=>'Синдром перфекциониста',   'emoji'=>'♾️', 'desc'=>'5 перезапусков'],
    ['id'=>'prestige_7',  'name'=>'Семикратный',              'emoji'=>'✨', 'desc'=>'7 перезапусков'],
    ['id'=>'prestige_10', 'name'=>'Сизиф IT',                 'emoji'=>'⛰️', 'desc'=>'10 перезапусков'],
    ['id'=>'prestige_15', 'name'=>'Бесконечный цикл',         'emoji'=>'♾️', 'desc'=>'15 перезапусков'],
    ['id'=>'prestige_20', 'name'=>'git reset --hard HEAD~∞',  'emoji'=>'💀', 'desc'=>'20 перезапусков'],
    // Prestige shop
    ['id'=>'shop_5items', 'name'=>'Шопоголик престижа',       'emoji'=>'🛍️', 'desc'=>'5 предметов в магазине'],
    ['id'=>'shop_all',    'name'=>'Всё по чуть-чуть',         'emoji'=>'🛒', 'desc'=>'По 1 уровню всех предметов'],
    // Events
    ['id'=>'event_10',    'name'=>'Закалённый Боевым',        'emoji'=>'🔥', 'desc'=>'Пережить 10 событий'],
    ['id'=>'events_25',   'name'=>'Всё видел',                'emoji'=>'😮', 'desc'=>'25 событий'],
    ['id'=>'events_50',   'name'=>'Бывалый',                  'emoji'=>'💪', 'desc'=>'50 событий'],
    ['id'=>'events_100',  'name'=>'Ничто не удивляет',        'emoji'=>'😐', 'desc'=>'100 событий'],
    ['id'=>'events_200',  'name'=>'Выгорание',                'emoji'=>'😑', 'desc'=>'200 событий'],
    // Offline
    ['id'=>'offline_1h',  'name'=>'Работал Пока Спал',        'emoji'=>'😴', 'desc'=>'Оффлайн-прогресс за 1+ час'],
    // Account level
    ['id'=>'lvl_5',       'name'=>'Начинающий',               'emoji'=>'⬆️', 'desc'=>'Уровень аккаунта 5'],
    ['id'=>'lvl_10',      'name'=>'Уверенный старт',          'emoji'=>'🔥', 'desc'=>'Уровень аккаунта 10'],
    ['id'=>'lvl_25',      'name'=>'Профессионал',             'emoji'=>'⭐', 'desc'=>'Уровень аккаунта 25'],
    ['id'=>'lvl_50',      'name'=>'Ветеран IT',               'emoji'=>'🎖️', 'desc'=>'Уровень аккаунта 50'],
    // Story
    ['id'=>'story_ch1',   'name'=>'Традиции священны',        'emoji'=>'📜', 'desc'=>'Узнать о первом баге'],
    ['id'=>'story_ch3',   'name'=>'Менеджер по документации', 'emoji'=>'📚', 'desc'=>'Дорасти до главы о команде'],
    ['id'=>'story_ch4',   'name'=>'Паразиты рынка',           'emoji'=>'⚔️', 'desc'=>'Столкнуться с конкурентами'],
    ['id'=>'story_ch6',   'name'=>'Не трогай это, человек',   'emoji'=>'🤖', 'desc'=>'Разбудить ИИ Копилота'],
    ['id'=>'story_ch7',   'name'=>'Корпоративный апогей',     'emoji'=>'🏙️', 'desc'=>'Достичь апогея компании'],
    ['id'=>'story_ch8',   'name'=>'Статья в Forbes',          'emoji'=>'📰', 'desc'=>'Стать легендой индустрии'],
    ['id'=>'story_end',   'name'=>'Легенда индустрии',        'emoji'=>'🌟', 'desc'=>'Прочитать все главы'],
    // Dungeon
    ['id'=>'dungeon_win', 'name'=>'Баг-охотник',              'emoji'=>'🏰', 'desc'=>'Пройти подземелье'],
    ['id'=>'dungeon_5',   'name'=>'Исследователь кода',       'emoji'=>'🗺️', 'desc'=>'Пройти подземелье 5 раз'],
    ['id'=>'dungeon_10',  'name'=>'Охотник на глубины',       'emoji'=>'⚔️', 'desc'=>'Пройти подземелье 10 раз'],
    ['id'=>'dungeon_25',  'name'=>'Легенда подземелья',       'emoji'=>'🏆', 'desc'=>'Пройти подземелье 25 раз'],
    ['id'=>'dungeon_50',  'name'=>'Повелитель багов',         'emoji'=>'🐉', 'desc'=>'Пройти подземелье 50 раз'],
];
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Профиль — <?= htmlspecialchars($username) ?></title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👤</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/auth.css">
</head>
<body class="page-body">

<div class="page-nav">
  <a href="idle.php" class="nav-link">← Игра</a>
  <a href="leaderboard.php" class="nav-link">🏆 Рейтинг</a>
  <a href="minigame.php" class="nav-link">🐛 Охота на баги</a>
  <a href="ajax/auth.php?action=logout" class="nav-link nav-link-dim">Выйти</a>
</div>

<div class="page-wrap">

  <!-- PROFILE HEADER -->
  <div class="profile-header">
    <div class="profile-avatar">
      <?= htmlspecialchars(mb_strtoupper(mb_substr($username, 0, 1))) ?>
    </div>
    <div class="profile-info">
      <h1 class="profile-name"><?= htmlspecialchars($username) ?></h1>
      <div class="profile-meta">
        <span class="profile-title-badge"><?= htmlspecialchars(prestigeTitle($prestige)) ?></span>
        <?php if ($prestige > 0): ?>
          <span class="profile-prestige">✨ Престиж <?= $prestige ?></span>
        <?php endif; ?>
        <span class="profile-joined">С нами с <?= date('M Y', (int)($userRow['created_at'] ?? time())) ?></span>
      </div>
    </div>
    <div class="profile-oo-display">
      <div class="oo-value"><?= $prestigePoints ?></div>
      <div class="oo-label">Очков Опыта</div>
    </div>
  </div>

  <!-- STATS GRID -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">💻</div>
      <div class="stat-value"><?= htmlspecialchars(fmtLoc($totalLoc)) ?></div>
      <div class="stat-label">Всего ЛОК</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">✨</div>
      <div class="stat-value"><?= $prestige ?></div>
      <div class="stat-label">Престижей</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">⭐</div>
      <div class="stat-value"><?= $totalOO ?></div>
      <div class="stat-label">ОО всего</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">🏆</div>
      <div class="stat-value"><?= $achieveCount ?></div>
      <div class="stat-label">Достижений</div>
    </div>
  </div>

  <!-- PRESTIGE SHOP -->
  <div class="section">
    <div class="section-header">
      <h2 class="section-title">🏪 Магазин престижа</h2>
      <div class="section-oo">
        <span class="oo-badge" id="ooBalance">⭐ <?= $prestigePoints ?> ОО</span>
      </div>
    </div>
    <p class="section-desc">
      Трать Очки Опыта (ОО) на постоянные улучшения. ОО зарабатываются при престиже.
      <?php if ($prestige === 0): ?>
        <span class="section-hint">// Сначала нужно выполнить хотя бы один престиж</span>
      <?php endif; ?>
    </p>

    <div class="shop-grid" id="shopGrid">
      <?php foreach ($SHOP_ITEMS as $item):
        $currentLevel  = (int)($prestigeShop[$item['id']] ?? 0);
        $maxed         = $currentLevel >= $item['maxLevel'];
        $locked        = $item['requiresPrestige'] > $prestige;
        $canAfford     = $prestigePoints >= $item['cost'];
        $available     = !$locked && !$maxed;
        $cardClass     = 'shop-item';
        if ($maxed)  $cardClass .= ' shop-maxed';
        elseif ($locked) $cardClass .= ' shop-locked';
        elseif (!$canAfford) $cardClass .= ' shop-poor';
      ?>
      <div class="<?= $cardClass ?>" data-id="<?= htmlspecialchars($item['id']) ?>">
        <div class="shop-item-header">
          <div class="shop-item-emoji"><?= $item['emoji'] ?></div>
          <div class="shop-item-info">
            <div class="shop-item-name"><?= htmlspecialchars($item['name']) ?></div>
            <div class="shop-item-effect"><?= htmlspecialchars($item['effect']) ?></div>
          </div>
          <?php if ($item['maxLevel'] > 1): ?>
          <div class="shop-item-level">
            <?php for ($lv = 0; $lv < $item['maxLevel']; $lv++): ?>
              <span class="level-pip <?= $lv < $currentLevel ? 'filled' : '' ?>"></span>
            <?php endfor; ?>
          </div>
          <?php elseif ($maxed): ?>
          <div class="shop-item-done">✓</div>
          <?php endif; ?>
        </div>
        <div class="shop-item-desc"><?= htmlspecialchars($item['desc']) ?></div>
        <?php if ($locked): ?>
          <div class="shop-item-req">🔒 Требуется престиж <?= $item['requiresPrestige'] ?></div>
        <?php elseif ($maxed): ?>
          <div class="shop-item-maxed">Максимальный уровень</div>
        <?php else: ?>
          <button class="shop-buy-btn" data-id="<?= htmlspecialchars($item['id']) ?>"
                  data-cost="<?= $item['cost'] ?>"
                  <?= !$canAfford ? 'disabled' : '' ?>>
            ⭐ <?= $item['cost'] ?> ОО
            <?php if ($item['maxLevel'] > 1): ?>
              · Уровень <?= $currentLevel + 1 ?>
            <?php endif; ?>
          </button>
        <?php endif; ?>
      </div>
      <?php endforeach; ?>
    </div>
  </div>

  <!-- ACHIEVEMENTS SHOWCASE -->
  <div class="section">
    <div class="section-header">
      <h2 class="section-title">🏆 Достижения</h2>
      <span class="section-count"><?= $achieveCount ?>/<?= count($ACHIEVEMENTS_DATA) ?></span>
    </div>
    <div class="achieve-showcase">
      <?php foreach ($ACHIEVEMENTS_DATA as $ach):
        $earned = !empty($achievements[$ach['id']]);
        $desc   = htmlspecialchars($ach['desc'] ?? '');
      ?>
      <div class="ach-pill <?= $earned ? 'ach-earned' : 'ach-locked' ?>">
        <span class="ach-icon"><?= $earned ? $ach['emoji'] : '🔒' ?></span>
        <div class="ach-info">
          <span class="ach-name"><?= $earned ? htmlspecialchars($ach['name']) : '???' ?></span>
          <span class="ach-desc"><?= $earned ? $desc : htmlspecialchars($ach['desc'] ?? '') ?></span>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>

</div><!-- /page-wrap -->

<div id="shopToast" class="shop-toast" style="display:none;"></div>

<script>
const currentOO = <?= $prestigePoints ?>;
let ooBalance   = currentOO;

function updateOODisplay() {
  document.getElementById('ooBalance').textContent = '⭐ ' + ooBalance + ' ОО';
}

function showShopToast(msg, good) {
  const el = document.getElementById('shopToast');
  el.textContent = msg;
  el.className   = 'shop-toast ' + (good ? 'shop-toast-good' : 'shop-toast-bad');
  el.style.display = 'block';
  clearTimeout(el._t);
  el._t = setTimeout(() => el.style.display = 'none', 3000);
}

document.querySelectorAll('.shop-buy-btn:not([disabled])').forEach(btn => {
  btn.addEventListener('click', async function() {
    const id   = this.dataset.id;
    const cost = parseInt(this.dataset.cost);

    if (ooBalance < cost) {
      showShopToast('Недостаточно Очков Опыта', false);
      return;
    }

    this.disabled    = true;
    this.textContent = 'Покупаем...';

    try {
      const res = await fetch('ajax/save.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'buy_prestige', id }),
      });
      const data = await res.json();

      if (data.success) {
        ooBalance = data.remainingOO;
        updateOODisplay();
        showShopToast('✓ Куплено! Осталось ' + ooBalance + ' ОО', true);
        // Reload to reflect changes
        setTimeout(() => window.location.reload(), 1200);
      } else {
        showShopToast(data.error || 'Ошибка покупки', false);
        this.disabled    = false;
        this.textContent = '⭐ ' + cost + ' ОО';
      }
    } catch(e) {
      showShopToast('Ошибка соединения', false);
      this.disabled    = false;
      this.textContent = '⭐ ' + cost + ' ОО';
    }
  });
});
</script>

</body>
</html>
