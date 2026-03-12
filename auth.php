<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap/app.php';

\App\Bootstrap\AppBootstrap::bootWeb();

// Already logged in
if (isset($_SESSION['user_id'])) {
    header('Location: idle.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Войти — Код и Кофе</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💻</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/auth.css">
</head>
<body>

<div class="auth-bg">
  <div class="auth-bg-code" aria-hidden="true" id="bgCode"></div>
</div>

<div class="auth-wrap">

  <div class="auth-header">
    <a href="index.php" class="auth-back">← На главную</a>
    <div class="auth-logo">
      <span class="auth-logo-icon">&lt;/&gt;</span>
      <span class="auth-logo-text">Код и Кофе</span>
    </div>
  </div>

  <div class="auth-card">
    <div class="auth-card-top">
      <div class="auth-card-icon">💻</div>
      <h1 class="auth-title">Добро пожаловать</h1>
      <p class="auth-subtitle">Войди чтобы сохранять прогресс на сервере</p>
    </div>

    <!-- TABS -->
    <div class="auth-tabs">
      <button class="auth-tab active" data-tab="login">Войти</button>
      <button class="auth-tab" data-tab="register">Регистрация</button>
    </div>

    <!-- LOGIN FORM -->
    <form id="loginForm" class="auth-form active" autocomplete="on">
      <div class="form-group">
        <label class="form-label" for="loginUsername">// логин</label>
        <input type="text" id="loginUsername" name="username" class="form-input"
               placeholder="your_username" autocomplete="username" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="loginPassword">// пароль</label>
        <input type="password" id="loginPassword" name="password" class="form-input"
               placeholder="••••••••" autocomplete="current-password" required>
      </div>
      <div class="form-error" id="loginError" style="display:none;"></div>
      <button type="submit" class="form-submit" id="loginSubmit">
        <span class="submit-text">Войти в систему</span>
        <span class="submit-arrow">→</span>
      </button>
    </form>

    <!-- REGISTER FORM -->
    <form id="registerForm" class="auth-form" style="display:none;" autocomplete="off">
      <div class="form-group">
        <label class="form-label" for="regUsername">// логин <span class="form-hint">3–20 символов, a-z 0-9 _</span></label>
        <input type="text" id="regUsername" name="username" class="form-input"
               placeholder="your_username" autocomplete="username" required
               pattern="[a-zA-Z0-9_]{3,20}">
      </div>
      <div class="form-group">
        <label class="form-label" for="regPassword">// пароль <span class="form-hint">минимум 6 символов</span></label>
        <input type="password" id="regPassword" name="password" class="form-input"
               placeholder="••••••••" autocomplete="new-password" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="regConfirm">// подтверди пароль</label>
        <input type="password" id="regConfirm" name="confirm" class="form-input"
               placeholder="••••••••" autocomplete="new-password" required>
      </div>
      <div class="form-error" id="registerError" style="display:none;"></div>
      <button type="submit" class="form-submit" id="registerSubmit">
        <span class="submit-text">Создать аккаунт</span>
        <span class="submit-arrow">→</span>
      </button>
    </form>

  </div><!-- /auth-card -->

  <!-- QUOTES -->
  <div class="auth-quotes">
    <div class="auth-quote active" id="quoteEl">
      <span class="quote-comment">// </span><span class="quote-text">Добро пожаловать в систему</span>
    </div>
  </div>

  <div class="auth-footer">
    <a href="leaderboard.php">🏆 Таблица лидеров</a>
    <span>·</span>
    <a href="idle.php">🎮 Играть как гость</a>
  </div>

</div><!-- /auth-wrap -->

<script>
const CSRF_TOKEN = <?= json_encode(app_csrf_token(), JSON_UNESCAPED_UNICODE) ?>;
const QUOTES = [
  'Добро пожаловать в систему',
  'git commit -m "finally fixed it"',
  'sudo make me a sandwich',
  'Hello, World! Снова.',
  'undefined is not a function',
  'It works on my machine',
  '99 bugs in the code...',
  'Have you tried turning it off?',
  'Deploy на пятницу — всегда хорошая идея',
  'rm -rf technical_debt',
];

let qi = 0;
const quoteEl = document.getElementById('quoteEl');
function cycleQuote() {
  quoteEl.style.opacity = 0;
  setTimeout(() => {
    qi = (qi + 1) % QUOTES.length;
    quoteEl.querySelector('.quote-text').textContent = QUOTES[qi];
    quoteEl.style.opacity = 1;
  }, 400);
}
setInterval(cycleQuote, 4000);

// Background code rain
const bgCode = document.getElementById('bgCode');
const snippets = [
  'const x = null;', 'if (true) {}', 'return undefined;', '// TODO: fix',
  'let i = 0;', 'arr.map(x=>x)', 'npm install', 'git push -f',
  'console.log(x)', 'async function()', 'try { } catch(e){}',
  'SELECT * FROM', '404 Not Found', 'git blame', 'sudo !!',
  'while(true){}', 'undefined', 'NaN', 'null', '{}',
];
for (let i = 0; i < 30; i++) {
  const span = document.createElement('span');
  span.className = 'bg-snippet';
  span.textContent = snippets[Math.floor(Math.random() * snippets.length)];
  span.style.cssText = `
    left: ${Math.random() * 100}%;
    top: ${Math.random() * 100}%;
    animation-delay: ${Math.random() * 8}s;
    animation-duration: ${6 + Math.random() * 6}s;
    opacity: ${0.03 + Math.random() * 0.05};
    font-size: ${10 + Math.random() * 8}px;
    transform: rotate(${-15 + Math.random() * 30}deg);
  `;
  bgCode.appendChild(span);
}

// Tab switching
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    const target = this.dataset.tab;
    document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
    document.getElementById(target + 'Form').style.display = 'flex';
    document.getElementById(target + 'Error').style.display = 'none';
  });
});

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.querySelector('.submit-text').textContent = loading ? 'Загрузка...' : btn.dataset.origText;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.display = 'block';
}

// Login
const loginForm = document.getElementById('loginForm');
const loginSubmit = document.getElementById('loginSubmit');
loginSubmit.dataset.origText = 'Войти в систему';

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  document.getElementById('loginError').style.display = 'none';
  setLoading(loginSubmit, true);

  try {
    const res = await fetch('ajax/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password, csrf: CSRF_TOKEN }),
    });
    const data = await res.json();
    if (data.success) {
      loginSubmit.querySelector('.submit-text').textContent = '✓ Входим...';
      setTimeout(() => window.location.href = 'idle.php', 500);
    } else {
      showError('loginError', data.error || 'Ошибка входа');
      setLoading(loginSubmit, false);
    }
  } catch(err) {
    showError('loginError', 'Ошибка соединения');
    setLoading(loginSubmit, false);
  }
});

// Register
const registerForm = document.getElementById('registerForm');
const registerSubmit = document.getElementById('registerSubmit');
registerSubmit.dataset.origText = 'Создать аккаунт';

registerForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirm').value;
  document.getElementById('registerError').style.display = 'none';

  if (password !== confirm) {
    showError('registerError', 'Пароли не совпадают');
    return;
  }

  setLoading(registerSubmit, true);

  try {
    const res = await fetch('ajax/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', username, password, confirm, csrf: CSRF_TOKEN }),
    });
    const data = await res.json();
    if (data.success) {
      registerSubmit.querySelector('.submit-text').textContent = '✓ Создан!';
      setTimeout(() => window.location.href = 'idle.php', 500);
    } else {
      showError('registerError', data.error || 'Ошибка регистрации');
      setLoading(registerSubmit, false);
    }
  } catch(err) {
    showError('registerError', 'Ошибка соединения');
    setLoading(registerSubmit, false);
  }
});
</script>

</body>
</html>
