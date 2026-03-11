$(function () {
  'use strict';

  /* =============================================
     GAME STATE
     ============================================= */
  var state = {
    scene:   'start',
    stats: { coffee: 50, focus: 50, stress: 30, code: 50, rep: 50 },
    log:     [],
    sceneOrder: ['start','wake','standup','task','bug_prod','fix_bug','review','meeting','boss_talk','ending'],
  };

  var statLabels = {
    coffee: '☕ Кофе', focus: '🧠 Фокус',
    stress: '😤 Стресс', code: '⌨️ Код', rep: '⭐ Репут.'
  };

  /* =============================================
     INIT
     ============================================= */
  function init() {
    state.scene = 'start';
    state.stats = { coffee: 50, focus: 50, stress: 30, code: 50, rep: 50 };
    state.log   = [];
    $('#statsBar').hide();
    $('#endingScreen').hide();
    renderScene('start');
  }

  /* =============================================
     RENDER SCENE
     ============================================= */
  function renderScene(sceneId) {
    var scene = SCENES[sceneId];
    if (!scene) return;
    state.scene = sceneId;

    var $card = $('#sceneCard');

    $card.addClass('fade-out');
    setTimeout(function () {

      // Fill content
      $('#actLabel').text(scene.act || '');
      $('#sceneEmoji').text(scene.emoji || '💻');
      $('#sceneTitle').text(scene.title);

      // Text paragraphs
      var $txt = $('#sceneText').empty();
      (scene.text || []).forEach(function (line) {
        $txt.append($('<p>').text(line));
      });

      // Reset result / stat changes
      $('#choiceResult').hide().text('');
      $('#statChanges').hide().empty();
      $('#btnContinue').hide();

      // Render choices
      var $choices = $('#choices').empty();
      if (scene.choices && scene.choices.length) {
        scene.choices.forEach(function (choice, i) {
          var $btn = $('<button class="choice-btn"></button>').text(choice.text);
          $btn.on('click', function () {
            handleChoice(choice, $(this));
          });
          $choices.append($btn);
        });
      }

      // Progress dots
      renderDots(sceneId);

      // Swap animation
      $card.removeClass('fade-out fade-in');
      $card.addClass('fade-in');
      setTimeout(function () {
        $card.removeClass('fade-in');
      }, 350);

      // Show stats bar (after start scene)
      if (sceneId !== 'start') {
        $('#statsBar').fadeIn(300);
        updateStatBars();
      }

    }, 300);
  }

  /* =============================================
     HANDLE CHOICE
     ============================================= */
  function handleChoice(choice, $btn) {
    // Disable all buttons
    $('.choice-btn').prop('disabled', true);
    $btn.addClass('chosen');

    // Show result text
    if (choice.result) {
      $('#choiceResult').text(choice.result).slideDown(300);
    }

    // Apply stat effects
    var changes = [];
    if (choice.fx && Object.keys(choice.fx).length) {
      $.each(choice.fx, function (stat, delta) {
        if (delta === 0) return;
        state.stats[stat] = Math.max(0, Math.min(100, (state.stats[stat] || 0) + delta));
        var sign = delta > 0 ? '+' : '';
        changes.push({ stat: statLabels[stat], delta: sign + delta, cls: delta > 0 ? 'pos' : 'neg' });
      });

      if (changes.length) {
        var $sc = $('#statChanges').empty();
        changes.forEach(function (c) {
          $sc.append(
            $('<span class="stat-change"></span>').addClass(c.cls).text(c.stat + ' ' + c.delta)
          );
        });
        setTimeout(function () {
          $('#statChanges').slideDown(200);
          updateStatBars();
        }, 400);
      }
    }

    // Log this choice
    state.log.push({
      scene: SCENES[state.scene].title,
      choice: choice.text.replace(/^[^\w\u0400-\u04FF]+/, '').substring(0, 60),
    });

    // Show continue button
    setTimeout(function () {
      if (choice.next === 'ending') {
        $('#btnContinue').text('Узнать финал →').fadeIn(300);
      } else if (choice.next) {
        $('#btnContinue').text('Продолжить →').fadeIn(300);
      }
    }, 600);

    // Next scene handler
    $('#btnContinue').off('click').on('click', function () {
      if (choice.next === 'ending') {
        showEnding();
      } else {
        renderScene(choice.next);
      }
    });
  }

  /* =============================================
     UPDATE STAT BARS
     ============================================= */
  function updateStatBars() {
    $.each(state.stats, function (stat, val) {
      val = Math.max(0, Math.min(100, val));
      $('#fill-' + stat).css('width', val + '%');
      $('#val-' + stat).text(val);

      // Color pulse on change
      var $statEl = $('#stat-' + stat);
      $statEl.addClass('pulse');
      setTimeout(function () { $statEl.removeClass('pulse'); }, 500);
    });
  }

  /* =============================================
     PROGRESS DOTS
     ============================================= */
  function renderDots(currentId) {
    var scenes = ['wake','standup','task','bug_prod','fix_bug','review','meeting','boss_talk'];
    var $dots = $('#progressDots').empty();
    var currentIdx = scenes.indexOf(currentId);

    scenes.forEach(function (id, i) {
      var $dot = $('<div class="p-dot"></div>');
      if (i < currentIdx)       $dot.addClass('done');
      else if (i === currentIdx) $dot.addClass('active');
      $dots.append($dot);
    });
  }

  /* =============================================
     DETERMINE ENDING
     ============================================= */
  function getEndingKey() {
    var s = state.stats;

    if (s.stress >= 80) return 'burned';
    if (s.rep <= 25)    return 'fired';
    if (s.rep >= 75 && s.stress <= 55) return 'hero';
    if (s.code >= 70 && s.rep >= 60)   return 'promoted';
    if (s.code >= 65 && s.rep < 50)    return 'freelance';
    return 'okay';
  }

  /* =============================================
     SHOW ENDING
     ============================================= */
  function showEnding() {
    var key    = getEndingKey();
    var ending = ENDINGS[key];

    // Set dynamic color
    var $card = $('#endingCard');
    $card.css('border-color', ending.color);

    // Emoji based on key
    var emojis = { hero: '🏆', promoted: '📐', burned: '🌱', fired: '📦', freelance: '🏖️', okay: '😐' };
    $('#endingEmoji').text(emojis[key] || '🎮');
    $('#endingTitle').text(ending.title).css('color', ending.color);
    $('#endingSubtitle').text(ending.subtitle);
    $('#endingText').text(ending.text);

    // Final stats
    var $es = $('#endingStats').empty();
    var statDisplay = [
      { key: 'coffee', icon: '☕', name: 'Кофе' },
      { key: 'focus',  icon: '🧠', name: 'Фокус' },
      { key: 'stress', icon: '😤', name: 'Стресс' },
      { key: 'code',   icon: '⌨️',  name: 'Код' },
      { key: 'rep',    icon: '⭐', name: 'Репут.' },
    ];
    statDisplay.forEach(function (s) {
      var val = state.stats[s.key];
      var color = s.key === 'stress'
        ? (val > 70 ? '#ff5f57' : val > 40 ? '#ffbd2e' : '#28c840')
        : (val > 70 ? '#00d4aa' : val > 40 ? '#ffbd2e' : '#ff5f57');
      $es.append(
        $('<div class="e-stat"></div>').append(
          $('<div class="e-stat-val"></div>').text(s.icon + ' ' + val).css('color', color),
          $('<div class="e-stat-name"></div>').text(s.name)
        )
      );
    });

    // Choice log
    var $log = $('#endingLog').empty();
    $log.append('<h4>📜 Как прошёл твой день:</h4>');
    state.log.forEach(function (entry) {
      $log.append(
        $('<div class="log-entry"></div>').text(entry.scene + ': ' + entry.choice + '...')
      );
    });

    $('#endingScreen').fadeIn(400);
  }

  /* =============================================
     RESTART
     ============================================= */
  $('#btnRestart').on('click', function () {
    $('#endingScreen').fadeOut(300, function () {
      init();
    });
  });

  /* =============================================
     START
     ============================================= */
  init();

});
