<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap/app.php';

\App\Bootstrap\AppBootstrap::bootPage();

$scenes = [

    /* =============================== СТАРТ =============================== */
    'start' => [
        'act'     => '',
        'title'   => 'День программиста',
        'emoji'   => '💻',
        'text'    => [
            'Добро пожаловать.',
            'Ты — программист. Обычный программист в обычной компании.',
            'Сегодня обычный рабочий день. Ничего не предвещает беды.',
            '(Что-то предвещает беды.)',
        ],
        'choices' => [
            ['text' => '▶ Начать рабочий день', 'next' => 'wake', 'fx' => []],
        ],
    ],

    /* =============================== АКТ 1: УТРО =============================== */
    'wake' => [
        'act'   => 'Акт 1: Утро',
        'title' => '09:48. Будильник.',
        'emoji' => '⏰',
        'text'  => [
            'Телефон орёт уже 20 минут. Стендап в 10:00.',
            'Ты смотришь в потолок и думаешь о жизненных выборах которые привели тебя сюда.',
            'Вставать или не вставать — вот в чём вопрос.',
        ],
        'choices' => [
            ['text' => '☕ Вскочить, добежать до кофемашины и включить камеру',       'next' => 'standup', 'result' => 'Ты врываешься в митинг с взъерошенными волосами и чашкой кофе. Классика.', 'fx' => ['coffee' => +20, 'stress' => +10, 'focus' => -5]],
            ['text' => '🤥 Включить камеру, сделать вид что уже давно работаешь', 'next' => 'standup', 'result' => 'Фон — стена. Одет — предположительно. Коллеги всё понимают, но молчат.', 'fx' => ['coffee' => 0, 'stress' => +5, 'rep' => -5]],
            ['text' => '🏠 Написать «Работаю из дома, камера сломалась»',          'next' => 'standup', 'result' => 'Камера «сломалась» в третий раз за месяц. Босс принял. Не поверил.', 'fx' => ['coffee' => 0, 'stress' => -5, 'rep' => -10]],
        ],
    ],

    'standup' => [
        'act'   => 'Акт 1: Утро',
        'title' => 'Стендап. «Что делал вчера?»',
        'emoji' => '🎤',
        'text'  => [
            'Очередь дошла до тебя. Все смотрят.',
            'Вчера ты... гм. Вчера ты открывал много вкладок.',
            'И закрывал их. Это тоже работа, технически.',
        ],
        'choices' => [
            ['text' => '😇 «Вчера ничего не успел, сегодня навёрстываю»',                     'next' => 'task', 'result' => 'Тишина. Потом кто-то кашлянул. Потом переходим к следующему. Тяжело, но честно.', 'fx' => ['stress' => +20, 'rep' => -10, 'focus' => +10]],
            ['text' => '😏 «Исследовал архитектуру решения и изучал best practices»',         'next' => 'task', 'result' => 'Технически не ложь. Ты открывал Stack Overflow — это исследование.', 'fx' => ['stress' => +5,  'rep' => +5,  'focus' => -5]],
            ['text' => '🤫 Начать говорить, закашляться и выключить микрофон',                'next' => 'task', 'result' => 'Гениально. Никто не понял что произошло. Ты легенда.', 'fx' => ['stress' => -10, 'rep' => -5, 'focus' => +0]],
            ['text' => '📊 Показать огромную диаграмму которую нарисовал за 5 минут до митинга', 'next' => 'task', 'result' => 'Все смотрят на диаграмму. Никто ничего не понял. Все кивают.', 'fx' => ['stress' => +0,  'rep' => +10, 'focus' => -10]],
        ],
    ],

    /* =============================== АКТ 2: ЗАДАЧА =============================== */
    'task' => [
        'act'   => 'Акт 2: Задача',
        'title' => 'Новая задача в Jira',
        'emoji' => '📋',
        'text'  => [
            'В Jira появился тикет: «Нужен Instagram, но для котиков. Как у Amazon, только лучше. Дедлайн — пятница.»',
            'Сегодня четверг.',
            'Продакт уже пишет в слак: «Видел задачу? Там всё просто, правда?»',
        ],
        'choices' => [
            ['text' => '😬 «Ок, сделаю к пятнице»',                    'next' => 'bug_prod', 'result' => 'Ты это сказал. Обратно не отыграть.', 'fx' => ['stress' => +30, 'rep' => -5,  'code' => -20]],
            ['text' => '📅 «Реально — 3 месяца, минимум»',             'next' => 'bug_prod', 'result' => 'Продакт ответил: «Хм. А если 2 недели?» — «Нет.» — «1 месяц?» — Вы торгуетесь 40 минут.', 'fx' => ['stress' => +10, 'rep' => +10, 'code' => +15]],
            ['text' => '🤔 «Нужно уточнить требования»',               'next' => 'bug_prod', 'result' => 'Создан новый тикет «Уточнение требований». Через неделю он протухнет в бэклоге.', 'fx' => ['stress' => -10, 'rep' => +5,  'code' => +10, 'focus' => +10]],
            ['text' => '🦆 Поставить задачу в «В работе» и не трогать', 'next' => 'bug_prod', 'result' => 'Классика жанра. «В работе» — это почти то же самое что «сделано», только нет.', 'fx' => ['stress' => -15, 'rep' => -15, 'code' => 0]],
        ],
    ],

    /* =============================== АКТ 3: БАГ =============================== */
    'bug_prod' => [
        'act'   => 'Акт 3: Баг в проде',
        'title' => '17:31. Пятница.',
        'emoji' => '🔥',
        'text'  => [
            'Телеграм взрывается. Слак горит. Почта пришла от CEO.',
            'Прод упал. Полностью. Всё.',
            'Ты смотришь на свой последний коммит: «minor fix, shouldn\'t affect anything».',
            'Это твой коммит.',
        ],
        'choices' => [
            ['text' => '⏪ Откатить деплой и потом разобраться',          'next' => 'fix_bug', 'result' => 'Прод поднялся. Все выдохнули. Ты — герой. Временно.', 'fx' => ['stress' => -10, 'rep' => +20, 'code' => +10]],
            ['text' => '🔍 Начать срочно разбираться в логах',             'next' => 'fix_bug', 'result' => 'Ты в логах. Там ошибка. Внутри ошибки — другая ошибка. Это кроличья нора.', 'fx' => ['stress' => +30, 'rep' => +5,  'code' => +20]],
            ['text' => '😇 Написать «Смотрю» и продолжить смотреть',      'next' => 'fix_bug', 'result' => 'Слово «смотрю» — это священный щит разработчика. Все ждут.', 'fx' => ['stress' => +5,  'rep' => -5,  'code' => 0]],
            ['text' => '📵 Выключить телефон и лечь спать',               'next' => 'fix_bug', 'result' => 'Смелый выбор. Утро вечера мудренее. Понедельник будет интересным.', 'fx' => ['stress' => -30, 'rep' => -35, 'code' => -10]],
        ],
    ],

    'fix_bug' => [
        'act'   => 'Акт 3: Баг в проде',
        'title' => 'Нашёл причину бага',
        'emoji' => '🐛',
        'text'  => [
            'Ты нашёл баг. Одна опечатка. Одна буква.',
            'Три дня отладки. Один символ.',
            'Теперь нужно решить — что написать в PR.',
        ],
        'choices' => [
            ['text' => '📝 «fix: typo in variable name» — коротко и честно',              'next' => 'review', 'result' => 'Коллеги прочли. Поняли. Один поставил 👍, один написал «lol». Всё норм.', 'fx' => ['rep' => +5,  'stress' => -10, 'code' => +5]],
            ['text' => '🎩 «refactor: optimize critical data processing pipeline»',       'next' => 'review', 'result' => 'Красиво. Никто не поймёт что там опечатка. Ты художник.', 'fx' => ['rep' => +10, 'stress' => -10, 'code' => -5]],
            ['text' => '📖 Написать 3 страницы с объяснением почему это не твоя вина',  'next' => 'review', 'result' => 'Людям нравится когда разработчик думает вслух. Или нет. Сложно сказать.', 'fx' => ['rep' => -5,  'stress' => +10, 'code' => +10]],
        ],
    ],

    /* =============================== АКТ 4: CODE REVIEW =============================== */
    'review' => [
        'act'   => 'Акт 4: Code Review',
        'title' => 'Тебя позвали на code review',
        'emoji' => '👁️',
        'text'  => [
            'Коллега Петя прислал PR на 2000 строк.',
            'Без описания. Без тестов. Коммит: «done».',
            'Ты открываешь. Видишь цикл внутри цикла внутри цикла.',
            'Глубоко вдыхаешь.',
        ],
        'choices' => [
            ['text' => '✅ Approve не глядя — Пете надо',                               'next' => 'meeting', 'result' => 'Через две недели этот код ляжет в прод и создаст тот самый баг. Но это потом.', 'fx' => ['rep' => -10, 'code' => -20, 'stress' => -5]],
            ['text' => '💬 Написать 47 комментариев с примерами и ссылками',            'next' => 'meeting', 'result' => 'Петя ответил «окей» на все комментарии и ничего не изменил.', 'fx' => ['rep' => +5,  'code' => +20, 'stress' => +15]],
            ['text' => '🤝 «LGTM, но лучше бы добавить пару тестов» и Approve',        'next' => 'meeting', 'result' => 'Дипломатично. Петя скажет спасибо. Тесты не появятся никогда.', 'fx' => ['rep' => +10, 'code' => +5,  'stress' => 0]],
            ['text' => '🔥 Написать «это нужно переписать с нуля» и уйти',             'next' => 'meeting', 'result' => 'Правда, но больно. Петя не разговаривает с тобой неделю.', 'fx' => ['rep' => -5,  'code' => +15, 'stress' => +10]],
        ],
    ],

    /* =============================== АКТ 5: МИТИНГ =============================== */
    'meeting' => [
        'act'   => 'Акт 5: Встреча',
        'title' => '«Созвон на 5 минут»',
        'emoji' => '📞',
        'text'  => [
            'Пришёл инвайт на встречу: «Обсудить пару вещей, 5 минут максимум».',
            'Там 12 участников.',
            'Встреча идёт уже 47 минут.',
            'Ты молчишь 46 из них.',
        ],
        'choices' => [
            ['text' => '😴 Отключить видео и тихо писать код',                               'next' => 'boss_talk', 'result' => 'Ты закрыл 3 задачи пока все обсуждали «формат следующего митинга».', 'fx' => ['focus' => +15, 'rep' => -5,  'code' => +10, 'stress' => -10]],
            ['text' => '🙋 Активно участвовать, предлагать идеи',                            'next' => 'boss_talk', 'result' => 'Тебя заметили. Тебя назначили ответственным за реализацию всех идей.', 'fx' => ['focus' => -10, 'rep' => +15, 'code' => 0,   'stress' => +20]],
            ['text' => '📊 Спросить «А можем ли мы сделать этот митинг в виде документа?»', 'next' => 'boss_talk', 'result' => 'Молчание. Потом кто-то сказал «хорошая идея». Встреча продолжилась ещё час.', 'fx' => ['focus' => 0,   'rep' => +5,  'code' => 0,   'stress' => +5]],
            ['text' => '✋ «Мне нужно вернуться к задаче, могу я уйти?»',                   'next' => 'boss_talk', 'result' => 'Это можно? Оказывается можно. Все завидуют. Никто не повторит.', 'fx' => ['focus' => +20, 'rep' => 0,   'code' => +15, 'stress' => -15]],
        ],
    ],

    /* =============================== АКТ 6: РАЗГОВОР С БОССОМ =============================== */
    'boss_talk' => [
        'act'   => 'Акт 6: Разговор с боссом',
        'title' => 'Босс зовёт на «приватный созвон»',
        'emoji' => '👔',
        'text'  => [
            'Босс пишет: «Есть минута? Надо поговорить.»',
            'Это может быть что угодно. Повышение. Увольнение. Новый проект. Ещё один митинг.',
            'Скорее всего митинг.',
            'Ты набираешь номер.',
        ],
        'choices' => [
            ['text' => '😤 Рассказать всё как есть: дедлайны, техдолг, усталость',     'next' => 'ending', 'result' => 'Босс слушал. Долго. Потом сказал «ценю честность».', 'fx' => ['stress' => -20, 'rep' => +10, 'focus' => +10]],
            ['text' => '🏆 Показать только успехи, умолчать о проблемах',              'next' => 'ending', 'result' => 'Отличная презентация. Босс доволен. Проблемы никуда не делись.', 'fx' => ['stress' => +10, 'rep' => +15, 'focus' => -5]],
            ['text' => '💸 Намекнуть что тебе звонили рекрутеры',                      'next' => 'ending', 'result' => 'Пауза. Долгая пауза. «Мы ценим тебя в команде». Нервная улыбка босса.', 'fx' => ['stress' => +15, 'rep' => +20, 'focus' => 0]],
            ['text' => '🤖 Говорить только техническими терминами пока босс не сдастся', 'next' => 'ending', 'result' => 'Босс сказал «хорошо, продолжай в том же духе» не понимая о чём ты говоришь.', 'fx' => ['stress' => 0,   'rep' => -5, 'focus' => +5]],
        ],
    ],

    /* =============================== КОНЕЦ =============================== */
    'ending' => [
        'act'   => 'Финал',
        'title' => 'Конец рабочего дня',
        'emoji' => '🌙',
        'text'  => ['Подведём итоги твоего рабочего дня...'],
        'choices' => [],
    ],
];

// Endings
$endings = [
    'hero' => [
        'title' => '🏆 СЕНЬОР РАЗРАБОТЧИК',
        'subtitle' => 'Тебя повысили!',
        'text' => 'Репутация и качество кода говорят сами за себя. Тебя повышают до Senior. Теперь тебе дают больше ответственности, больше задач, и ту же зарплату. Поздравляем.',
        'color' => '#00d4aa',
    ],
    'promoted' => [
        'title' => '📐 ТИМЛИД',
        'subtitle' => 'Ты стал тимлидом!',
        'text' => 'Твой код хорош и команда тебя уважает. Тебя делают тимлидом. Ты больше не пишешь код — ты ходишь на митинги и объясняешь другим почему дедлайн нереален. Добро пожаловать в менеджмент.',
        'color' => '#7c5cfc',
    ],
    'burned' => [
        'title' => '🌱 ФЕРМЕР',
        'subtitle' => 'Ты сгорел и ушёл',
        'text' => 'Стресс достиг предела. В один прекрасный день ты встал из-за компьютера, вышел на улицу и не вернулся. Сейчас ты выращиваешь помидоры и отвечаешь на сообщения когда хочется. Баги не падают. Прод не горит. Счастье.',
        'color' => '#f97316',
    ],
    'fired' => [
        'title' => '📦 УВОЛЕН',
        'subtitle' => 'Всё закончилось',
        'text' => 'Репутация упала ниже плинтуса. Тебя вызвали в HR. Дали коробку. Попросили сдать ноутбук. Посмотри на светлую сторону: теперь у тебя есть время переписать пет-проект который ты начинал 4 раза.',
        'color' => '#ff5f57',
    ],
    'freelance' => [
        'title' => '🏖️ ФРИЛАНСЕР',
        'subtitle' => 'Свобода!',
        'text' => 'Качество кода через крышу, но работа в офисе достала. Ты уходишь во фриланс. Теперь ты сам себе босс. Сам ставишь дедлайны. Сам их срываешь. Продакт в твоей голове самый требовательный из всех.',
        'color' => '#ffbd2e',
    ],
    'okay' => [
        'title' => '😐 КАК ВСЕГДА',
        'subtitle' => 'Обычный день',
        'text' => 'Ничего особенного. Ты пришёл. Поработал. Ушёл. Завтра снова. Баги живут. Дедлайны переносятся. Stack Overflow не закрывается. Это программирование. Всё нормально.',
        'color' => '#6b7a99',
    ],
];

$scenesJson  = json_encode($scenes, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG);
$endingsJson = json_encode($endings, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG);
?>
<!DOCTYPE html>
<html lang="ru">
<?php
$pageTitle = 'День программиста — Игра';
$pageIcon = '🎮';
$pageStyles = ['css/game.css'];
require __DIR__ . '/templates/partials/app-head.php';
?>
<body>

<div class="game-wrap" id="gameWrap">

  <!-- STATS BAR -->
  <div class="stats-bar" id="statsBar" style="display:none;">
    <div class="stat" id="stat-coffee">
      <span class="stat-icon">☕</span>
      <span class="stat-label">Кофе</span>
      <div class="stat-track"><div class="stat-fill" id="fill-coffee"></div></div>
      <span class="stat-val" id="val-coffee">50</span>
    </div>
    <div class="stat" id="stat-focus">
      <span class="stat-icon">🧠</span>
      <span class="stat-label">Фокус</span>
      <div class="stat-track"><div class="stat-fill" id="fill-focus"></div></div>
      <span class="stat-val" id="val-focus">50</span>
    </div>
    <div class="stat" id="stat-stress">
      <span class="stat-icon">😤</span>
      <span class="stat-label">Стресс</span>
      <div class="stat-track stress-track"><div class="stat-fill" id="fill-stress"></div></div>
      <span class="stat-val" id="val-stress">30</span>
    </div>
    <div class="stat" id="stat-code">
      <span class="stat-icon">⌨️</span>
      <span class="stat-label">Код</span>
      <div class="stat-track"><div class="stat-fill" id="fill-code"></div></div>
      <span class="stat-val" id="val-code">50</span>
    </div>
    <div class="stat" id="stat-rep">
      <span class="stat-icon">⭐</span>
      <span class="stat-label">Репут.</span>
      <div class="stat-track"><div class="stat-fill" id="fill-rep"></div></div>
      <span class="stat-val" id="val-rep">50</span>
    </div>
  </div>

  <!-- SCENE CONTAINER -->
  <div class="scene-container" id="sceneContainer">

    <!-- ACT LABEL -->
    <div class="act-label" id="actLabel"></div>

    <!-- SCENE CARD -->
    <div class="scene-card" id="sceneCard">
      <div class="scene-emoji" id="sceneEmoji"></div>
      <h2 class="scene-title" id="sceneTitle"></h2>
      <div class="scene-text" id="sceneText"></div>

      <!-- RESULT (shown after choice) -->
      <div class="choice-result" id="choiceResult" style="display:none;"></div>

      <!-- CHOICES -->
      <div class="choices" id="choices"></div>

      <!-- STAT CHANGES (shown after choice) -->
      <div class="stat-changes" id="statChanges" style="display:none;"></div>

      <!-- CONTINUE BUTTON (after choice) -->
      <button class="btn-continue" id="btnContinue" style="display:none;">
        Продолжить →
      </button>
    </div>

    <!-- PROGRESS DOTS -->
    <div class="progress-dots" id="progressDots"></div>
  </div>

  <!-- ENDING SCREEN -->
  <div class="ending-screen" id="endingScreen" style="display:none;">
    <div class="ending-card" id="endingCard">
      <div class="ending-emoji" id="endingEmoji"></div>
      <div class="ending-title" id="endingTitle"></div>
      <div class="ending-subtitle" id="endingSubtitle"></div>
      <p class="ending-text" id="endingText"></p>
      <div class="ending-stats" id="endingStats"></div>
      <div class="ending-log" id="endingLog"></div>
      <div class="ending-actions">
        <button class="btn-restart" id="btnRestart">🔄 Сыграть ещё раз</button>
        <a href="index.php" class="btn-back">← Вернуться на сайт</a>
      </div>
    </div>
  </div>

</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script>
  var SCENES  = <?= $scenesJson ?>;
  var ENDINGS = <?= $endingsJson ?>;
</script>
<script src="js/game.js"></script>
</body>
</html>
