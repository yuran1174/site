<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap/app.php';

\App\Bootstrap\AppBootstrap::bootPage();

$year = date('Y');
$hour = (int) date('H');

if ($hour >= 5 && $hour < 12) {
    $greeting = 'Доброе утро, инженер';
} elseif ($hour >= 12 && $hour < 18) {
    $greeting = 'Добрый день, разработчик';
} elseif ($hour >= 18 && $hour < 23) {
    $greeting = 'Добрый вечер, кодер';
} else {
    $greeting = 'Ещё не спишь, коллега?';
}

$excuses = [
    'У меня на машине работало!',
    'Это не баг — это недокументированная фича.',
    'Кто-то изменил требования после деплоя.',
    'Я только что задеплоил, наверное кэш.',
    'Это проблема браузера, не моего кода.',
    'В документации написано не то, что имелось в виду.',
    'На проде другая версия PHP.',
    'Я предупреждал, что это техдолг.',
    'QA должны были это поймать.',
    'Работало в пятницу вечером, клянусь.',
    'Мне нужен доступ к продакшн-логам.',
    'Это Петин код, я его не трогал.',
    'Сервер лагал, поэтому двойной клик.',
    'Это по ТЗ, просто ТЗ неправильное.',
    'Нужно просто перезагрузить сервер.',
];

$coffee_stages = [
    ['level' => 0,  'emoji' => '😵', 'status' => 'Критическое состояние', 'code' => 'undefined is not a function'],
    ['level' => 25, 'emoji' => '🥱', 'status' => 'Работоспособен условно', 'code' => 'git status # ничего не понятно'],
    ['level' => 50, 'emoji' => '😐', 'status' => 'Функционирует', 'code' => '// TODO: разобраться позже'],
    ['level' => 75, 'emoji' => '🙂', 'status' => 'Продуктивен', 'code' => 'console.log("кажется работает")'],
    ['level' => 100,'emoji' => '🚀', 'status' => 'РЕЖИМ БОГА', 'code' => '10x developer activated'],
];

$bugs = [
    ['title' => 'Кнопка работает только если на неё кликнуть дважды', 'verdict' => 'фича', 'reason' => 'Двойное подтверждение защищает от случайных нажатий. UX-улучшение!'],
    ['title' => 'Сайт грузится 8 секунд', 'verdict' => 'баг', 'reason' => 'Ладно, это всё-таки баг. Даже по нашим меркам.'],
    ['title' => 'Форма сбрасывается при обновлении страницы', 'verdict' => 'фича', 'reason' => 'Защита персональных данных пользователя. GDPR-совместимо!'],
    ['title' => 'Пароль отображается в адресной строке', 'verdict' => 'баг', 'reason' => 'Нет, это точно баг. Срочно фиксить.'],
    ['title' => 'Интерфейс работает только в IE6', 'verdict' => 'фича', 'reason' => 'Ретро-совместимость — наше конкурентное преимущество!'],
    ['title' => 'Цены на сайте указаны в $, а не в ₽', 'verdict' => 'фича', 'reason' => 'Интернационализация. Заказчик просто не оценил масштаб мышления.'],
    ['title' => 'При удалении записи удаляется вся база данных', 'verdict' => 'баг', 'reason' => 'Окей, окей. Это баг. Не спорим.'],
    ['title' => '404 страница красивее главной', 'verdict' => 'фича', 'reason' => 'Пользователь получает приятный сюрприз при ошибках навигации.'],
];

$horoscope = [
    'Овен'       => ['Сегодня звёзды говорят: не трогай код в пятницу. Звёзды как всегда правы.', '🐏'],
    'Телец'      => ['Меркурий в ретрограде. Лучший день для рефакторинга чужого кода.', '🐂'],
    'Близнецы'   => ['Вас ждёт таинственная встреча с legacy-кодом без комментариев.', '👥'],
    'Рак'        => ['Благоприятный день для того чтобы уйти на больничный после деплоя.', '🦀'],
    'Лев'        => ['Ваш код сегодня будет работать. Вы сами удивитесь почему.', '🦁'],
    'Дева'       => ['Идеальный день для code review. Нашли 47 комментариев — это рекорд.', '♍'],
    'Весы'       => ['Сложный выбор: tabs или spaces. Звёзды молчат. Команда разделилась.', '⚖️'],
    'Скорпион'   => ['Баг который вы ищете 3 дня — это опечатка в одной букве.', '🦂'],
    'Стрелец'    => ['Дедлайн перенесут. Но только после того как вы всё сдадите в 3 ночи.', '🏹'],
    'Козерог'    => ['Сегодня вам напишет рекрутер с "интересным предложением". Зарплата — ниже текущей.', '🐐'],
    'Водолей'    => ['Ваш код упадёт в прод ровно когда вы уйдёте в отпуск.', '🏺'],
    'Рыбы'       => ['Встреча на которую вас позвали "на 5 минут" займёт 2 часа.', '🐟'],
];
$zodiacKeys = array_keys($horoscope);
$todayZodiac = $zodiacKeys[(int) date('d') % 12];
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Жизнь программиста | Честный сайт</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💻</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

<!-- NAV -->
<nav class="navbar" id="navbar">
  <div class="container nav-inner">
    <a href="#top" class="logo"><span class="logo-bracket">&lt;</span>dev.life<span class="logo-bracket">/&gt;</span></a>
    <ul class="nav-links">
      <li><a href="#terminal">Терминал</a></li>
      <li><a href="#excuse">Отмазки</a></li>
      <li><a href="#coffee">Кофе</a></li>
      <li><a href="#bugfeature">Баг/Фича</a></li>
      <li><a href="#horoscope">Гороскоп</a></li>
      <li><a href="#quiz">Тест</a></li>
      <li><a href="#roadmap">Роадмап</a></li>
    </ul>
    <button class="hamburger" id="hamburger">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- HERO -->
<section id="top" class="hero">
  <div class="container">
    <div class="hero-terminal">
      <div class="terminal-bar">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
        <span class="terminal-title">bash — 80×24</span>
      </div>
      <div class="terminal-body">
        <div class="t-line"><span class="t-prompt">~$</span> <span class="t-cmd">whoami</span></div>
        <div class="t-line t-out">programmer</div>
        <div class="t-line"><span class="t-prompt">~$</span> <span class="t-cmd">date</span></div>
        <div class="t-line t-out"><?= htmlspecialchars(date('D M d H:i:s Y')) ?></div>
        <div class="t-line"><span class="t-prompt">~$</span> <span class="t-cmd">echo $MOOD</span></div>
        <div class="t-line t-out"><?= htmlspecialchars($greeting) ?> 👋</div>
        <div class="t-line"><span class="t-prompt">~$</span> <span class="t-cmd">cat /etc/programmer-life</span></div>
        <div class="t-line t-out t-comment"># Добро пожаловать на самый честный сайт о разработке</div>
        <div class="t-line t-out t-comment"># Без мотивации. Без лжи. Только правда.</div>
        <div class="t-line"><span class="t-prompt">~$</span> <span class="t-cursor">█</span></div>
      </div>
    </div>

    <h1 class="hero-title">
      Жизнь <span class="accent">программиста</span><br>
      <span class="hero-sub">честно и без прикрас</span>
    </h1>

    <div style="margin-bottom:2rem;display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;">
      <a href="game.php" class="btn-main" style="font-size:1.05rem;padding:.9rem 2.2rem;">
        🎮 Сыграть в «День программиста»
      </a>
      <a href="idle.php" class="btn-main" style="font-size:1.05rem;padding:.9rem 2.2rem;background:linear-gradient(135deg,#7c5cfc,#00d4aa);border-color:#7c5cfc;">
        ⚙️ Играть в «Код и Кофе»
      </a>
    </div>

    <div class="hero-facts">
      <div class="fact-card">
        <div class="fact-num" id="bugs-counter">0</div>
        <div class="fact-label">багов в проде прямо сейчас</div>
      </div>
      <div class="fact-card">
        <div class="fact-num" id="coffee-counter">0</div>
        <div class="fact-label">чашек кофе выпито сегодня</div>
      </div>
      <div class="fact-card">
        <div class="fact-num" id="todo-counter">0</div>
        <div class="fact-label">TODO комментариев «на потом»</div>
      </div>
      <div class="fact-card">
        <div class="fact-num" id="stack-counter">0</div>
        <div class="fact-label">вкладок Stack Overflow открыто</div>
      </div>
    </div>
  </div>
</section>

<!-- INTERACTIVE TERMINAL -->
<section id="terminal" class="section">
  <div class="container">
    <h2 class="section-title"><span class="accent">$_</span> Интерактивный терминал</h2>
    <p class="section-sub">Введи команду и получи честный ответ</p>
    <div class="fake-terminal" id="fakeTerminal">
      <div class="terminal-bar">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
        <span class="terminal-title">programmer@localhost:~</span>
      </div>
      <div class="terminal-output" id="termOutput">
        <div class="t-line t-comment"># Попробуй: help, status, git, coffee, fix, sudo</div>
      </div>
      <div class="terminal-input-row">
        <span class="t-prompt">~$</span>
        <input type="text" id="termInput" class="term-input" placeholder="введи команду..." autocomplete="off" spellcheck="false">
      </div>
    </div>
    <div class="terminal-hints">
      <?php foreach (['help','status','git','coffee','fix bug','sudo','deploy','ls'] as $hint): ?>
      <button class="hint-btn" data-cmd="<?= htmlspecialchars($hint) ?>"><?= htmlspecialchars($hint) ?></button>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- EXCUSE GENERATOR -->
<section id="excuse" class="section section-alt">
  <div class="container">
    <h2 class="section-title"><span class="accent">🛡️</span> Генератор отмазок</h2>
    <p class="section-sub">Когда продакт спрашивает «почему не работает?» — нажми кнопку</p>
    <div class="excuse-box">
      <div class="excuse-display" id="excuseDisplay">
        <div class="excuse-icon">🤔</div>
        <div class="excuse-text" id="excuseText">Нажми кнопку чтобы получить профессиональную отмазку</div>
      </div>
      <button class="btn-main" id="excuseBtn">
        <i class="fas fa-random"></i> Сгенерировать отмазку
      </button>
      <button class="btn-secondary" id="excuseCopy" style="display:none;">
        <i class="fas fa-copy"></i> Скопировать
      </button>
    </div>
    <div class="excuse-counter-wrap">
      Отмазок использовано сегодня: <strong id="excuseCount">0</strong>
      <span class="excuse-rating" id="excuseRating"></span>
    </div>

    <!-- AJAX custom excuse -->
    <div class="custom-excuse-form">
      <p class="section-sub" style="margin-top:2rem;">Или опиши свою ситуацию — получи индивидуальную отмазку:</p>
      <div class="input-row">
        <input type="text" id="customSituation" class="text-input" placeholder="Например: сайт упал в пятницу в 18:00...">
        <button class="btn-main" id="customExcuseBtn">Придумать</button>
      </div>
      <div id="customExcuseResult" class="custom-result" style="display:none;"></div>
    </div>
  </div>
</section>

<!-- COFFEE METER -->
<section id="coffee" class="section">
  <div class="container">
    <h2 class="section-title"><span class="accent">☕</span> Кофейный монитор</h2>
    <p class="section-sub">Управляй своим состоянием через кофе</p>
    <div class="coffee-widget">
      <div class="coffee-display">
        <div class="coffee-cup-wrap">
          <div class="coffee-cup" id="coffeeCup">
            <div class="cup-body">
              <div class="coffee-fill" id="coffeeFill"></div>
              <div class="cup-steam" id="cupSteam">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div class="cup-handle"></div>
            <div class="cup-saucer"></div>
          </div>
        </div>
        <div class="coffee-info">
          <div class="coffee-level-num" id="coffeeLevelNum">0%</div>
          <div class="coffee-emoji" id="coffeeEmoji">😵</div>
          <div class="coffee-status" id="coffeeStatus">Критическое состояние</div>
          <div class="coffee-code" id="coffeeCode"><code>undefined is not a function</code></div>
        </div>
      </div>
      <div class="coffee-controls">
        <button class="btn-main" id="addCoffee"><i class="fas fa-plus"></i> Выпить кофе</button>
        <button class="btn-danger" id="resetCoffee"><i class="fas fa-undo"></i> Понедельник</button>
      </div>
      <div class="coffee-scale">
        <?php foreach ($coffee_stages as $stage): ?>
        <div class="scale-mark" data-level="<?= $stage['level'] ?>">
          <span class="scale-emoji"><?= $stage['emoji'] ?></span>
          <span class="scale-label"><?= htmlspecialchars($stage['status']) ?></span>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>

<!-- BUG OR FEATURE -->
<section id="bugfeature" class="section section-alt">
  <div class="container">
    <h2 class="section-title"><span class="accent">🐛</span> Баг или фича?</h2>
    <p class="section-sub">Голосуй как настоящий разработчик</p>
    <div class="bf-game" id="bfGame">
      <div class="bf-card" id="bfCard">
        <div class="bf-card-inner">
          <div class="bf-label">Ситуация:</div>
          <div class="bf-title" id="bfTitle">Нажми «Следующий» чтобы начать</div>
          <div class="bf-score-row">
            <span class="bf-score-item">Баги: <strong id="bugScore">0</strong></span>
            <span class="bf-score-item">Фичи: <strong id="featureScore">0</strong></span>
          </div>
        </div>
      </div>
      <div class="bf-verdict" id="bfVerdict" style="display:none;"></div>
      <div class="bf-buttons">
        <button class="btn-bug" id="btnBug">🐛 Это баг!</button>
        <button class="btn-feature" id="btnFeature">✨ Это фича!</button>
      </div>
      <button class="btn-secondary" id="btnNextBug">Следующий →</button>
    </div>
    <div class="bf-result" id="bfResult" style="display:none;">
      <h3 id="bfResultTitle"></h3>
      <p id="bfResultText"></p>
      <button class="btn-main" id="bfRestart">Пройти снова</button>
    </div>
  </div>
</section>

<!-- HOROSCOPE -->
<section id="horoscope" class="section">
  <div class="container">
    <h2 class="section-title"><span class="accent">🔮</span> Программистский гороскоп</h2>
    <p class="section-sub">Астрология для тех кто верит только в данные</p>
    <div class="horoscope-grid">
      <?php foreach ($horoscope as $sign => [$text, $emoji]): ?>
      <div class="horoscope-card <?= $sign === $todayZodiac ? 'active' : '' ?>" data-sign="<?= htmlspecialchars($sign) ?>">
        <div class="h-emoji"><?= $emoji ?></div>
        <div class="h-sign"><?= htmlspecialchars($sign) ?></div>
        <div class="h-text" style="display:none;"><?= htmlspecialchars($text) ?></div>
      </div>
      <?php endforeach; ?>
    </div>
    <div class="horoscope-result" id="horoResult" style="display:none;">
      <div class="horo-sign-big" id="horoSignBig"></div>
      <div class="horo-text-big" id="horoTextBig"></div>
      <div class="horo-advice">💡 Совет дня: сохрани изменения в git перед деплоем.</div>
    </div>
  </div>
</section>

<!-- QUIZ -->
<section id="quiz" class="section section-alt">
  <div class="container">
    <h2 class="section-title"><span class="accent">🧠</span> Какой ты программист?</h2>
    <p class="section-sub">5 вопросов — честный результат</p>
    <div class="quiz-wrap" id="quizWrap">
      <div class="quiz-progress">
        <div class="quiz-progress-bar" id="quizProgressBar"></div>
        <span id="quizProgressText">Вопрос 1 из 5</span>
      </div>
      <div class="quiz-card" id="quizCard">
        <div class="quiz-question" id="quizQuestion">Нажми «Начать тест» чтобы узнать кто ты</div>
        <div class="quiz-options" id="quizOptions"></div>
      </div>
      <button class="btn-main" id="quizStart">Начать тест 🚀</button>
    </div>
    <div class="quiz-result" id="quizResult" style="display:none;">
      <div class="result-emoji" id="resultEmoji"></div>
      <h3 id="resultTitle"></h3>
      <p id="resultDesc"></p>
      <div class="result-traits" id="resultTraits"></div>
      <button class="btn-main" id="quizRestart">Пройти снова</button>
    </div>
  </div>
</section>

<!-- ROADMAP -->
<section id="roadmap" class="section">
  <div class="container">
    <h2 class="section-title"><span class="accent">//</span> Дорожная карта</h2>
    <p class="section-sub">Что строим дальше — честно и публично</p>

    <div class="roadmap-current">
      <div class="rm-current-label"><i class="fas fa-check-circle"></i> Уже в игре</div>
      <div class="rm-current-tags">
        <span class="rm-tag">⚙️ Idle-ядро</span>
        <span class="rm-tag">✨ Престиж</span>
        <span class="rm-tag">🏰 Подземелье (10 этажей)</span>
        <span class="rm-tag">🐛 Охота на баги</span>
        <span class="rm-tag">📖 Сюжет (8 глав)</span>
        <span class="rm-tag">🎲 Случайные события</span>
        <span class="rm-tag">🏆 Таблица лидеров</span>
        <span class="rm-tag">👤 Аккаунты</span>
      </div>
    </div>

    <div class="roadmap-phases">

      <div class="rm-phase rm-phase--next">
        <div class="rm-phase-head">
          <div class="rm-phase-num">01</div>
          <div class="rm-phase-info">
            <div class="rm-phase-title">Укрепление основы</div>
            <div class="rm-badge rm-badge--next"><i class="fas fa-arrow-right"></i> Следующий этап</div>
          </div>
        </div>
        <ul class="rm-items">
          <li class="rm-item"><span class="rm-dot"></span><strong>Dungeon v2 — классы</strong><br><span>Frontend / Backend / DevOps со своими статами и способностями</span></li>
          <li class="rm-item"><span class="rm-dot"></span><strong>Dungeon v2 — боссы</strong><br><span>Боссы на 5-м и 10-м этажах с уникальными механиками</span></li>
          <li class="rm-item"><span class="rm-dot"></span><strong>Dungeon v2 — экипировка</strong><br><span>Предметы, инвентарь, синергия с idle-прогрессом</span></li>
          <li class="rm-item"><span class="rm-dot"></span><strong>Цепочки событий в idle</strong><br><span>Квесты из 2–3 шагов вместо одиночных событий</span></li>
          <li class="rm-item"><span class="rm-dot"></span><strong>Активные способности</strong><br><span>Кликабельные скиллы с кулдауном в основной игре</span></li>
        </ul>
      </div>

      <div class="rm-phase">
        <div class="rm-phase-head">
          <div class="rm-phase-num">02</div>
          <div class="rm-phase-info">
            <div class="rm-phase-title">Новые активности</div>
            <div class="rm-badge rm-badge--planned"><i class="fas fa-clock"></i> Планируется</div>
          </div>
        </div>
        <ul class="rm-items">
          <li class="rm-item"><span class="rm-dot"></span><strong>⚔️ PVP Арена</strong><br><span>Асинхронные дуэли, ставки на очки опыта, рейтинг арены</span></li>
          <li class="rm-item"><span class="rm-dot"></span><strong>🔍 Code Review</strong><br><span>Мини-игра: найди баги в псевдокоде за 60 секунд</span></li>
          <li class="rm-item"><span class="rm-dot"></span><strong>⚡ Спринт-режим</strong><br><span>5-минутный challenge с уникальными наградами раз в час</span></li>
        </ul>
      </div>

      <div class="rm-phase">
        <div class="rm-phase-head">
          <div class="rm-phase-num">03</div>
          <div class="rm-phase-info">
            <div class="rm-phase-title">Мета-прогрессия</div>
            <div class="rm-badge rm-badge--planned"><i class="fas fa-clock"></i> Планируется</div>
          </div>
        </div>
        <ul class="rm-items">
          <li class="rm-item"><span class="rm-dot"></span><strong>Престиж v2 — смена работы</strong><br><span>Второй слой: выбор работодателя с уникальными механиками</span></li>
          <li class="rm-item"><span class="rm-dot"></span><strong>Компании</strong><br><span>Стартап / Корпорация / Удалёнка / Gamedev — разный геймплей</span></li>
          <li class="rm-item"><span class="rm-dot"></span><strong>Сезонные события</strong><br><span>Ежемесячные ивенты с уникальными наградами</span></li>
        </ul>
      </div>

      <div class="rm-phase">
        <div class="rm-phase-head">
          <div class="rm-phase-num">04</div>
          <div class="rm-phase-info">
            <div class="rm-phase-title">Социальность</div>
            <div class="rm-badge rm-badge--idea"><i class="fas fa-lightbulb"></i> Идеи</div>
          </div>
        </div>
        <ul class="rm-items">
          <li class="rm-item"><span class="rm-dot"></span><strong>Гильдии / Команды</strong><br><span>Совместные проекты, командный лидерборд</span></li>
          <li class="rm-item"><span class="rm-dot"></span><strong>Асинхронные рейды</strong><br><span>Группа игроков против общего «легаси-монолита»</span></li>
        </ul>
      </div>

    </div>

    <div class="roadmap-footer-note">
      <i class="fas fa-terminal"></i>
      Роадмап живой — обновляется по мере разработки. Каждая фаза должна быть играбельна сама по себе.
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="footer">
  <div class="container">
    <div class="footer-inner">
      <div class="footer-logo"><span class="logo-bracket">&lt;</span>dev.life<span class="logo-bracket">/&gt;</span></div>
      <div class="footer-text">
        Сделано на <span class="accent">кофе</span> и <span class="accent">Stack Overflow</span> © <?= $year ?>
      </div>
      <div class="footer-text muted">
        Всё совпадение с реальными разработчиками — случайно. Наверное.
      </div>
    </div>
  </div>
</footer>

<button id="backTop" title="Наверх">↑</button>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script>
  // PHP data passed to JS
  const EXCUSES = <?= json_encode($excuses, JSON_UNESCAPED_UNICODE) ?>;
  const BUGS    = <?= json_encode($bugs, JSON_UNESCAPED_UNICODE) ?>;
</script>
<script src="js/main.js"></script>
</body>
</html>
