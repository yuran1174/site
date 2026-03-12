<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/db.php';

$currentUserId = (int)($_SESSION['user_id'] ?? 0);
$isLoggedIn    = $currentUserId > 0;

function fmtLoc(float $n): string {
    if ($n < 1000)   return number_format($n, 0, '.', ' ');
    if ($n < 1e6)    return number_format($n/1e3, 1, '.', ' ') . 'K';
    if ($n < 1e9)    return number_format($n/1e6, 2, '.', ' ') . 'M';
    if ($n < 1e12)   return number_format($n/1e9, 2, '.', ' ') . 'B';
    return number_format($n/1e12, 2, '.', ' ') . 'T';
}

function timeAgo(int $ts): string {
    if ($ts <= 0) return 'давно';
    $diff = time() - $ts;
    if ($diff < 0)       return 'только что';
    if ($diff < 60)      return 'только что';
    if ($diff < 3600)    return floor($diff / 60) . ' мин назад';
    if ($diff < 86400)   return floor($diff / 3600) . ' ч назад';
    if ($diff < 604800)  return floor($diff / 86400) . ' дн назад';
    if ($diff < 2592000) return floor($diff / 604800) . ' нед назад';
    return date('d.m.Y', $ts);
}

function accountLevelTitle(int $lvl): string {
    if ($lvl >= 50) return 'Легенда';
    if ($lvl >= 35) return 'CTO';
    if ($lvl >= 25) return 'Архитектор';
    if ($lvl >= 18) return 'Тимлид';
    if ($lvl >= 12) return 'Сеньор';
    if ($lvl >= 7)  return 'Мидл';
    if ($lvl >= 3)  return 'Джун';
    return 'Стажёр';
}

$db = DB::get();
$stmt = $db->query('
    SELECT l.user_id, l.username, l.total_loc, l.prestige_count,
           COALESCE(l.account_level, 1) AS account_level, u.last_seen
    FROM leaderboard l
    JOIN users u ON u.id = l.user_id
    ORDER BY l.total_loc DESC
    LIMIT 10
');
$rows = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Таблица лидеров — Код и Кофе</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏆</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/auth.css">
</head>
<body class="page-body">

<div class="page-nav">
  <a href="idle.php" class="nav-link">← Игра</a>
  <?php if ($isLoggedIn): ?>
    <a href="profile.php" class="nav-link">👤 Профиль</a>
    <a href="ajax/auth.php?action=logout" class="nav-link nav-link-dim">Выйти</a>
  <?php else: ?>
    <a href="auth.php" class="nav-link">Войти</a>
  <?php endif; ?>
</div>

<div class="page-wrap">

  <div class="page-header">
    <div class="page-header-icon">🏆</div>
    <h1 class="page-title">Таблица лидеров</h1>
    <p class="page-desc">Топ-10 программистов по суммарному количеству строк кода</p>
  </div>

  <div class="lb-card">
    <div class="lb-toolbar">
      <span class="lb-info">Топ 10 всех времён</span>
      <button class="lb-refresh-btn" id="refreshBtn">↻ Обновить</button>
    </div>

    <div id="lbTableWrap">
      <?php if (empty($rows)): ?>
        <div class="lb-empty">
          <div class="lb-empty-icon">📭</div>
          <div>Пока никто не попал в рейтинг.<br>Сыграй и сохрани прогресс первым!</div>
        </div>
      <?php else: ?>
      <table class="lb-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Игрок</th>
            <th>Уровень</th>
            <th>Всего ЛОК</th>
            <th>Престижей</th>
            <th>Был(а)</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($rows as $i => $row):
            $rank     = $i + 1;
            $medal    = $rank === 1 ? '🥇' : ($rank === 2 ? '🥈' : ($rank === 3 ? '🥉' : ''));
            $isMe     = ($currentUserId > 0 && (int)$row['user_id'] === $currentUserId);
            $acLvl    = (int)$row['account_level'];
            $acTitle  = accountLevelTitle($acLvl);
          ?>
          <tr class="lb-row <?= $isMe ? 'lb-row-me' : '' ?>">
            <td class="lb-rank">
              <?php if ($medal): ?>
                <span class="lb-medal"><?= $medal ?></span>
              <?php else: ?>
                <span class="lb-rank-num"><?= $rank ?></span>
              <?php endif; ?>
            </td>
            <td class="lb-username">
              <?= htmlspecialchars($row['username']) ?>
              <?php if ($isMe): ?><span class="lb-you-badge">Ты</span><?php endif; ?>
            </td>
            <td class="lb-level">
              <span class="lb-level-badge">Ур. <?= $acLvl ?></span>
              <span class="lb-level-title"><?= htmlspecialchars($acTitle) ?></span>
            </td>
            <td class="lb-loc"><?= htmlspecialchars(fmtLoc((float)$row['total_loc'])) ?></td>
            <td class="lb-prestige">
              <?php if ((int)$row['prestige_count'] > 0): ?>
                <span class="lb-prestige-badge">✨ <?= (int)$row['prestige_count'] ?></span>
              <?php else: ?>
                <span class="lb-zero">—</span>
              <?php endif; ?>
            </td>
            <td class="lb-lastseen"><?= htmlspecialchars(timeAgo((int)$row['last_seen'])) ?></td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
      <?php endif; ?>
    </div>
  </div>

  <?php if (!$isLoggedIn): ?>
  <div class="lb-hint">
    <span>🔒</span>
    <span>Войди чтобы твои результаты попали в рейтинг</span>
    <a href="auth.php" class="lb-hint-link">Войти / Зарегистрироваться</a>
  </div>
  <?php endif; ?>

</div>

<script>
document.getElementById('refreshBtn').addEventListener('click', async function() {
  this.textContent = '↻ Загрузка...';
  this.disabled = true;
  try {
    const res = await fetch('leaderboard.php?ajax=1');
    const html = await res.text();
    const parser = new DOMParser();
    const doc    = parser.parseFromString(html, 'text/html');
    const newTable = doc.getElementById('lbTableWrap');
    if (newTable) {
      document.getElementById('lbTableWrap').innerHTML = newTable.innerHTML;
    }
  } catch(e) {}
  this.textContent = '↻ Обновить';
  this.disabled = false;
});
</script>

</body>
</html>
