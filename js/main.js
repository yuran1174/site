$(function () {
  'use strict';

  /* ============================================
     NAVBAR
     ============================================ */
  $(window).on('scroll', function () {
    var s = $(this).scrollTop();
    $('#navbar').toggleClass('scrolled', s > 10);
    $('#backTop').toggleClass('visible', s > 400);

    // Active nav link
    $('.section, .hero').each(function () {
      var top = $(this).offset().top - 80;
      var bot = top + $(this).outerHeight();
      var id  = $(this).attr('id');
      if (s >= top && s < bot) {
        $('.nav-links a').removeClass('active');
        $('.nav-links a[href="#' + id + '"]').addClass('active');
      }
    });
  });

  $('#hamburger').on('click', function () {
    $(this).toggleClass('open');
    $('.nav-links').toggleClass('open');
  });

  $('.nav-links a').on('click', function () {
    $('.nav-links').removeClass('open');
    $('#hamburger').removeClass('open');
  });

  $('#backTop').on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 400);
  });

  /* ============================================
     FADE-UP ON SCROLL
     ============================================ */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        $(e.target).addClass('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  $('.fade-up').each(function () { observer.observe(this); });

  /* ============================================
     HERO COUNTERS (random funny numbers)
     ============================================ */
  function randomBetween(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  function animateCounter($el, target, duration) {
    var start = 0;
    var step  = target / (duration / 16);
    var timer = setInterval(function () {
      start += step;
      if (start >= target) { start = target; clearInterval(timer); }
      $el.text(Math.floor(start));
    }, 16);
  }

  var bugs  = randomBetween(3, 47);
  var coffe = randomBetween(2, 8);
  var todos = randomBetween(124, 2048);
  var sof   = randomBetween(12, 64);

  setTimeout(function () {
    animateCounter($('#bugs-counter'),   bugs,  1200);
    animateCounter($('#coffee-counter'), coffe,  800);
    animateCounter($('#todo-counter'),   todos, 1500);
    animateCounter($('#stack-counter'),  sof,   1000);
  }, 500);

  /* ============================================
     INTERACTIVE TERMINAL
     ============================================ */
  var termHistory = [];
  var histIndex   = -1;

  var commands = {
    help: function () {
      return [
        { cls: 't-info',    text: 'Доступные команды:' },
        { cls: 't-comment', text: '  help      — показать эту справку' },
        { cls: 't-comment', text: '  status    — состояние проекта' },
        { cls: 't-comment', text: '  git       — история коммитов' },
        { cls: 't-comment', text: '  coffee    — проверить уровень кофеина' },
        { cls: 't-comment', text: '  fix bug   — починить баг' },
        { cls: 't-comment', text: '  sudo      — попробовать sudo' },
        { cls: 't-comment', text: '  deploy    — задеплоить на прод' },
        { cls: 't-comment', text: '  ls        — список файлов' },
        { cls: 't-comment', text: '  clear     — очистить терминал' },
      ];
    },
    status: function () {
      var bugs = randomBetween(3, 47);
      return [
        { cls: 't-info',    text: '📊 Состояние проекта:' },
        { cls: 't-error',   text: '  ✗ Баги в проде: ' + bugs },
        { cls: 't-error',   text: '  ✗ Техдолг: критический' },
        { cls: 't-success', text: '  ✓ Зарплата задержана: нет (пока)' },
        { cls: 't-comment', text: '  ~ Дедлайн: вчера' },
        { cls: 't-comment', text: '  ~ TODO комментариев: ' + randomBetween(100, 999) },
        { cls: 't-error',   text: '  ✗ Документация: не существует' },
      ];
    },
    git: function () {
      return [
        { cls: 't-info',    text: 'On branch main' },
        { cls: 't-comment', text: 'Recent commits:' },
        { cls: '',          text: '  abc1234  fix: finally fixed the bug (3 попытки)' },
        { cls: '',          text: '  def5678  fix: fix previous fix' },
        { cls: '',          text: '  ghi9012  fix: fix fix' },
        { cls: '',          text: '  jkl3456  feat: add feature (не работает)' },
        { cls: '',          text: '  mno7890  chore: remove console.log' },
        { cls: '',          text: '  pqr1234  chore: add console.log for debug' },
        { cls: 't-comment', text: '  ... (847 commits) ...' },
        { cls: '',          text: '  aaa0001  Initial commit — it works on my machine' },
      ];
    },
    coffee: function () {
      var lvl = randomBetween(0, 100);
      var status = lvl < 25 ? '😵 КРИТИЧНО' : lvl < 50 ? '🥱 Низкий' : lvl < 75 ? '😐 Норм' : '🚀 РЕЖИМ БОГА';
      return [
        { cls: 't-info',  text: '☕ Кофейный монитор:' },
        { cls: '',        text: '  Текущий уровень: ' + lvl + '% — ' + status },
        { cls: 't-comment', text: '  Рекомендация: ' + (lvl < 50 ? 'СРОЧНО выпить кофе' : 'Всё под контролем') },
      ];
    },
    'fix bug': function () {
      var steps = [
        '🔍 Анализирую баг...',
        '📖 Открываю Stack Overflow...',
        '📋 Нахожу ответ 2009 года...',
        '✂️  Копирую код...',
        '🤞 Запускаю...',
        randomBetween(0,1) ? '✅ Баг исправлен! (создал 3 новых)' : '❌ Баг не исправлен. Перехожу к этапу отрицания.',
      ];
      return steps.map(function (s) { return { cls: 't-comment', text: s }; });
    },
    sudo: function () {
      return [
        { cls: 't-error', text: '[sudo] пароль для programmer:' },
        { cls: 't-error', text: 'Неверный пароль. Это происшествие будет записано.' },
        { cls: 't-error', text: 'sudo: 3 incorrect password attempts' },
        { cls: 't-comment', text: '# Кстати, пароль — 123456. Ты же его не сменил с дефолтного?' },
      ];
    },
    deploy: function () {
      return [
        { cls: 't-info',    text: '🚀 Запускаю деплой на прод...' },
        { cls: '',          text: '  [████████░░] 80% — почти...' },
        { cls: 't-error',   text: '  FATAL: Cannot connect to database' },
        { cls: 't-error',   text: '  ERROR: Out of memory' },
        { cls: 't-error',   text: '  PANIC: undefined index on line 1337' },
        { cls: 't-comment', text: '# Это пятница 18:00. Ты сам виноват.' },
        { cls: 't-error',   text: '  Деплой прерван. Пишу продакту что "всё сложно".' },
      ];
    },
    ls: function () {
      return [
        { cls: '',        text: 'total 42069' },
        { cls: 't-info',  text: 'drwxr-xr-x  node_modules/  (187,432 файла)' },
        { cls: '',        text: '-rw-r--r--  index.js' },
        { cls: '',        text: '-rw-r--r--  index_old.js' },
        { cls: '',        text: '-rw-r--r--  index_old_2.js' },
        { cls: '',        text: '-rw-r--r--  index_FINAL.js' },
        { cls: '',        text: '-rw-r--r--  index_FINAL_v2.js' },
        { cls: '',        text: '-rw-r--r--  index_FINAL_v2_FIX.js' },
        { cls: 't-comment', text: '-rw-r--r--  .env  (забыл в .gitignore)' },
        { cls: 't-error', text: '-rw-r--r--  TODO.txt  (никогда не открывался)' },
      ];
    },
    clear: null,
  };

  function addTermLine(cls, text) {
    var $line = $('<div class="t-line"></div>');
    if (cls) $line.addClass(cls);
    $line.text(text);
    $('#termOutput').append($line);
  }

  function scrollTerm() {
    var el = document.getElementById('termOutput');
    el.scrollTop = el.scrollHeight;
  }

  function runCommand(cmd) {
    cmd = cmd.trim().toLowerCase();
    addTermLine('', '');
    addTermLine('', '\u00a0'); // spacer via prompt row
    var $prompt = $('<div class="t-line"></div>');
    $prompt.append($('<span class="t-prompt">~$</span>'), ' ', $('<span class="t-cmd"></span>').text(cmd));
    $('#termOutput').append($prompt);

    if (!cmd) { scrollTerm(); return; }

    if (cmd === 'clear') {
      $('#termOutput').empty();
      addTermLine('t-comment', '# Терминал очищен. Баги остались.');
      scrollTerm(); return;
    }

    var handler = commands[cmd];
    if (!handler) {
      addTermLine('t-error', 'bash: ' + cmd + ': команда не найдена');
      addTermLine('t-comment', '# Попробуй: help');
    } else {
      var lines = handler();
      lines.forEach(function (l) { addTermLine(l.cls, l.text); });
    }
    scrollTerm();
  }

  $('#termInput').on('keydown', function (e) {
    if (e.key === 'Enter') {
      var val = $(this).val();
      if (val.trim()) termHistory.unshift(val);
      histIndex = -1;
      runCommand(val);
      $(this).val('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIndex < termHistory.length - 1) histIndex++;
      $(this).val(termHistory[histIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIndex > 0) histIndex--;
      else { histIndex = -1; $(this).val(''); return; }
      $(this).val(termHistory[histIndex] || '');
    }
  });

  $('.hint-btn').on('click', function () {
    var cmd = $(this).data('cmd');
    $('#termInput').val(cmd).focus();
    runCommand(cmd);
    $('#termInput').val('');
  });

  /* ============================================
     EXCUSE GENERATOR
     ============================================ */
  var excuseCount = 0;
  var icons = ['🤔','😅','🙈','😬','🤷','😶','🧑‍💻','🤦','🤫','👀'];
  var ratings = ['','Новичок','Джун','Мидл','Сеньор','Principal Blame Engineer'];

  $('#excuseBtn').on('click', function () {
    var excuse = EXCUSES[Math.floor(Math.random() * EXCUSES.length)];
    var icon   = icons[Math.floor(Math.random() * icons.length)];

    $('#excuseDisplay').fadeOut(150, function () {
      $('#excuseIcon').text(icon);
      $('#excuseText').text(excuse);
      $(this).fadeIn(200);
    });

    excuseCount++;
    $('#excuseCount').text(excuseCount);
    var ri = Math.min(Math.floor(excuseCount / 3), ratings.length - 1);
    $('#excuseRating').text(ri > 0 ? '— ' + ratings[ri] : '');
    $('#excuseCopy').fadeIn(200);
  });

  $('#excuseCopy').on('click', function () {
    var text = $('#excuseText').text();
    navigator.clipboard.writeText(text).then(function () {
      var $btn = $('#excuseCopy');
      $btn.html('<i class="fas fa-check"></i> Скопировано!');
      setTimeout(function () {
        $btn.html('<i class="fas fa-copy"></i> Скопировать');
      }, 2000);
    });
  });

  $('#customExcuseBtn').on('click', function () {
    var situation = $('#customSituation').val().trim();
    if (!situation) return;

    var $btn = $(this);
    $btn.prop('disabled', true).text('Думаю...');

    $.ajax({
      url: 'ajax/excuse.php',
      method: 'POST',
      data: { situation: situation },
      dataType: 'json',
      success: function (r) {
        $('#customExcuseResult').html('💡 <strong>' + $('<div>').text(r.excuse).html() + '</strong>').fadeIn(300);
      },
      error: function () {
        $('#customExcuseResult').html('🤷 Ситуация настолько плохая, что даже генератор не справился.').fadeIn(300);
      },
      complete: function () {
        $btn.prop('disabled', false).text('Придумать');
      }
    });
  });

  /* ============================================
     COFFEE METER
     ============================================ */
  var coffeeLevel = 0;
  var coffeeStages = [
    { level: 0,   emoji: '😵', status: 'Критическое состояние', code: 'undefined is not a function' },
    { level: 25,  emoji: '🥱', status: 'Работоспособен условно', code: 'git status # ничего не понятно' },
    { level: 50,  emoji: '😐', status: 'Функционирует', code: '// TODO: разобраться позже' },
    { level: 75,  emoji: '🙂', status: 'Продуктивен', code: 'console.log("кажется работает")' },
    { level: 100, emoji: '🚀', status: 'РЕЖИМ БОГА', code: '10x developer activated' },
  ];

  function getStage(lvl) {
    var stage = coffeeStages[0];
    for (var i = 0; i < coffeeStages.length; i++) {
      if (lvl >= coffeeStages[i].level) stage = coffeeStages[i];
    }
    return stage;
  }

  function updateCoffeeUI() {
    var stage = getStage(coffeeLevel);
    $('#coffeeFill').css('height', coffeeLevel + '%');
    $('#coffeeLevelNum').text(coffeeLevel + '%');
    $('#coffeeEmoji').text(stage.emoji);
    $('#coffeeStatus').text(stage.status);
    $('#coffeeCode').html('<code>' + stage.code + '</code>');

    if (coffeeLevel > 0) {
      $('#cupSteam').addClass('active');
    } else {
      $('#cupSteam').removeClass('active');
    }

    // Update scale
    $('.scale-mark').each(function () {
      var markLevel = parseInt($(this).data('level'));
      $(this).toggleClass('current', markLevel === stage.level);
    });
  }

  $('#addCoffee').on('click', function () {
    if (coffeeLevel >= 100) {
      $(this).html('<i class="fas fa-coffee"></i> ПЕРЕКОФЕИНЕН!');
      setTimeout(function () {
        $('#addCoffee').html('<i class="fas fa-plus"></i> Выпить кофе');
      }, 1500);
      return;
    }
    coffeeLevel = Math.min(coffeeLevel + 25, 100);
    updateCoffeeUI();
  });

  $('#resetCoffee').on('click', function () {
    coffeeLevel = 0;
    updateCoffeeUI();
  });

  updateCoffeeUI();

  /* ============================================
     BUG OR FEATURE
     ============================================ */
  var bfIndex    = -1;
  var bfBugs     = 0;
  var bfFeatures = 0;
  var bfAnswered = false;

  function loadBfItem() {
    bfIndex++;
    if (bfIndex >= BUGS.length) {
      // Game over
      $('#bfGame').hide();
      var accuracy = Math.round((bfBugs + bfFeatures) / BUGS.length * 100);
      var msg = accuracy >= 70
        ? 'Ты думаешь как опытный разработчик. Это не комплимент.'
        : 'Твоя логика баг/фича уникальна. Ты будущее продуктовых команд.';
      $('#bfResultTitle').text('Результат: ' + (bfBugs + bfFeatures) + '/' + BUGS.length);
      $('#bfResultText').text(msg);
      $('#bfResult').fadeIn(400);
      return;
    }
    var item = BUGS[bfIndex];
    $('#bfTitle').text(item.title);
    $('#bfVerdict').hide();
    $('#btnBug, #btnFeature').prop('disabled', false);
    bfAnswered = false;
  }

  function checkBfAnswer(choice) {
    if (bfAnswered) return;
    bfAnswered = true;

    var item    = BUGS[bfIndex];
    var correct = (choice === item.verdict);
    var cls     = item.verdict === 'баг' ? 'bug' : 'feature';
    var label   = item.verdict === 'баг' ? '🐛 Это баг' : '✨ Это фича';

    if (correct) {
      if (choice === 'баг') bfBugs++;
      else bfFeatures++;
    }

    var icon = correct ? '✅' : '❌';
    $('#bfVerdict')
      .attr('class', 'bf-verdict ' + cls)
      .html(icon + ' ' + label + ' — ' + item.reason)
      .fadeIn(200);

    if (correct) {
      $('#bfCard').addClass('shake');
      setTimeout(function () { $('#bfCard').removeClass('shake'); }, 400);
    }

    $('#bugScore').text(bfBugs);
    $('#featureScore').text(bfFeatures);
    $('#btnBug, #btnFeature').prop('disabled', true);
  }

  $('#btnNextBug').on('click', loadBfItem);
  $('#btnBug').on('click', function () { checkBfAnswer('баг'); });
  $('#btnFeature').on('click', function () { checkBfAnswer('фича'); });
  $('#bfRestart').on('click', function () {
    bfIndex = -1; bfBugs = 0; bfFeatures = 0;
    $('#bfResult').hide();
    $('#bfGame').show();
    loadBfItem();
  });

  /* ============================================
     HOROSCOPE
     ============================================ */
  $('.horoscope-card').on('click', function () {
    $('.horoscope-card').removeClass('active');
    $(this).addClass('active');

    var text  = $(this).find('.h-text').text();
    var emoji = $(this).find('.h-emoji').text();
    var sign  = $(this).find('.h-sign').text();

    $('#horoSignBig').text(emoji + ' ' + sign);
    $('#horoTextBig').text(text);
    $('#horoResult').fadeIn(300);
  });

  // Auto-show today's sign
  var $today = $('.horoscope-card.active');
  if ($today.length) {
    setTimeout(function () { $today.trigger('click'); }, 600);
  }

  /* ============================================
     QUIZ
     ============================================ */
  var quizQuestions = [
    {
      q: 'Тебе дали задачу «сделать быстро». Что ты делаешь?',
      opts: [
        { text: 'Делаю сразу, потом рефакторю', type: 'ninja' },
        { text: 'Прошу уточнить требования 3 раза', type: 'architect' },
        { text: 'Копирую с Stack Overflow', type: 'copy-paste' },
        { text: 'Делаю вид что уже занят', type: 'senior' },
      ]
    },
    {
      q: 'Как выглядит твой код в конце рабочего дня?',
      opts: [
        { text: 'Чистый и документированный', type: 'architect' },
        { text: 'Работает — и хватит', type: 'copy-paste' },
        { text: 'Пронизан TODO комментариями', type: 'ninja' },
        { text: 'Есть несколько закомментированных блоков «на всякий случай»', type: 'senior' },
      ]
    },
    {
      q: 'Продакт говорит «это же просто кнопка». Ты:',
      opts: [
        { text: 'Делаю кнопку за 5 минут', type: 'copy-paste' },
        { text: 'Объясняю что за этим стоит 3 часа работы', type: 'architect' },
        { text: 'Молча делаю 6 часов', type: 'ninja' },
        { text: 'Делегирую джуну', type: 'senior' },
      ]
    },
    {
      q: 'Упал прод. Первое действие:',
      opts: [
        { text: 'Откатываю последний деплой', type: 'senior' },
        { text: 'Читаю логи', type: 'architect' },
        { text: 'Перезагружаю сервер', type: 'copy-paste' },
        { text: 'Открываю новую вкладку с Stack Overflow', type: 'ninja' },
      ]
    },
    {
      q: 'Твоё отношение к code review:',
      opts: [
        { text: 'Пишу подробные комментарии', type: 'architect' },
        { text: 'Ставлю approve не читая', type: 'senior' },
        { text: 'Нахожу всё что можно придраться', type: 'ninja' },
        { text: 'Прошу подтвердить мои PR максимально быстро', type: 'copy-paste' },
      ]
    },
  ];

  var quizResults = {
    ninja: {
      emoji: '🥷',
      title: 'Ниндзя кодинга',
      desc: 'Ты работаешь быстро, эффективно и оставляешь загадочные коммиты. Коллеги не понимают как ты это делаешь. Ты и сам иногда не помнишь.',
      traits: ['⚡ Быстрый', '🔥 Эффективный', '🤫 Загадочный', '📝 TODO-маньяк'],
    },
    architect: {
      emoji: '🏛️',
      title: 'Архитектор вселенной',
      desc: 'Ты думаешь о масштабируемости системы которую ещё не начал писать. На код ревью пишешь больше слов чем автор PR. Это прекрасно.',
      traits: ['🧠 Умный', '📐 Структурированный', '⏳ Медленный (зато правильно)', '📚 Любит документацию'],
    },
    'copy-paste': {
      emoji: '📋',
      title: 'Мастер Stack Overflow',
      desc: 'Зачем изобретать велосипед если кто-то уже написал. Ctrl+C Ctrl+V — это тоже навык. Твой код работает и это главное.',
      traits: ['🔍 Ищущий', '⚡ Быстрый', '🌐 Знает где искать', '🤞 Оптимист'],
    },
    senior: {
      emoji: '🧓',
      title: 'Настоящий Сеньор',
      desc: 'Ты уже видел всё это раньше. И знаешь что всё это закончится рефакторингом. Поэтому не торопишься. Делегируешь.',
      traits: ['😌 Спокойный', '🎯 Делегирует', '☕ Кофезависимый', '💭 «Я так и знал»'],
    },
  };

  var quizAnswers  = [];
  var quizStep     = 0;
  var quizStarted  = false;

  function renderQuizQuestion() {
    var q = quizQuestions[quizStep];
    $('#quizProgressBar').css('--progress', ((quizStep) / quizQuestions.length * 100) + '%');
    $('#quizProgressText').text('Вопрос ' + (quizStep + 1) + ' из ' + quizQuestions.length);
    $('#quizQuestion').text(q.q);

    var $opts = $('#quizOptions').empty();
    q.opts.forEach(function (opt, i) {
      var $btn = $('<button class="quiz-option"></button>').text(opt.text);
      $btn.on('click', function () {
        $('.quiz-option').removeClass('selected');
        $(this).addClass('selected');
        quizAnswers.push(opt.type);

        setTimeout(function () {
          quizStep++;
          if (quizStep >= quizQuestions.length) {
            showQuizResult();
          } else {
            renderQuizQuestion();
          }
        }, 400);
      });
      $opts.append($btn);
    });
  }

  function showQuizResult() {
    var counts = {};
    quizAnswers.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
    var top = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0];
    var r   = quizResults[top];

    $('#quizProgressBar').css('--progress', '100%');
    $('#quizProgressText').text('Готово!');

    $('#resultEmoji').text(r.emoji);
    $('#resultTitle').text(r.title);
    $('#resultDesc').text(r.desc);

    var $traits = $('#resultTraits').empty();
    r.traits.forEach(function (t) {
      $traits.append($('<span class="result-trait"></span>').text(t));
    });

    $('#quizWrap').hide();
    $('#quizResult').fadeIn(400);
  }

  $('#quizStart').on('click', function () {
    quizAnswers = []; quizStep = 0; quizStarted = true;
    $(this).hide();
    renderQuizQuestion();
  });

  $('#quizRestart').on('click', function () {
    quizAnswers = []; quizStep = 0;
    $('#quizResult').hide();
    $('#quizWrap').show();
    $('#quizStart').show();
    $('#quizOptions').empty();
    $('#quizQuestion').text('Нажми «Начать тест» чтобы узнать кто ты');
    $('#quizProgressBar').css('--progress', '0%');
    $('#quizProgressText').text('Вопрос 1 из 5');
  });

});
