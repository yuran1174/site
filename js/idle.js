/* ================================================
   КОД И КОФЕ — Idle Game Logic
   Full game implementation
   ================================================ */

'use strict';

// ================================================
// GAME DATA DEFINITIONS
// ================================================

const BUILDINGS = [
  { id:'junior',    name:'Джун',           emoji:'🐣', desc:'Каждый день спрашивает что делает git push.',          baseCost:50,       baseCps:0.5   },
  { id:'mid',       name:'Мидл',           emoji:'👨‍💻', desc:'Знает что делает. Иногда.',                              baseCost:300,      baseCps:4     },
  { id:'senior',    name:'Сеньор',         emoji:'🧙', desc:'Делает всё молча. Это пугает.',                         baseCost:2000,     baseCps:25    },
  { id:'techlead',  name:'Тимлид',         emoji:'📋', desc:'Ходит на митинги вместо кода. Все рады.',              baseCost:15000,    baseCps:150   },
  { id:'architect', name:'Архитектор',     emoji:'📐', desc:'Рисует квадраты со стрелками. Получает x2 зарплату.',  baseCost:100000,   baseCps:900   },
  { id:'devops',    name:'DevOps',         emoji:'🐳', desc:'Написал bash скрипт и теперь считает себя богом.',     baseCost:750000,   baseCps:6000  },
  { id:'cto',       name:'CTO',            emoji:'👔', desc:'Читает HackerNews и называет это стратегией.',          baseCost:5000000,  baseCps:35000 },
  { id:'legacy_sys',name:'Легаси-система', emoji:'💾', desc:'Никто не знает как это работает. Но работает. Трогать страшно.',
    baseCost:10000000, baseCps:5000, requiresShop:'legacy' },
  { id:'ai_copilot',name:'ИИ Копилот',     emoji:'🤖', desc:'Пишет код сам. Иногда правильно. Иногда удаляет прод.',
    baseCost:50000000, baseCps:25000, requiresShop:'ai_assist' },
];

const UPGRADES = [
  // Click upgrades
  { id:'espresso',    name:'Эспрессо',           emoji:'☕', category:'click', desc:'Двойной эспрессо — двойная скорость мышления.',       effect:{ type:'click', mult:2 }, cost:100,     unlockCondition: s => s.totalLoc >= 10 },
  { id:'dual_monitor',name:'Двойной монитор',     emoji:'🖥️', category:'click', desc:'Два монитора = два раза больше вкладок для закрытия.', effect:{ type:'click', mult:2 }, cost:1000,    unlockCondition: s => s.totalLoc >= 200 },
  { id:'mech_key',    name:'Механическая клава',  emoji:'⌨️', category:'click', desc:'Клацает в 2 раза громче и в 2 раза продуктивнее.',     effect:{ type:'click', mult:2 }, cost:8000,    unlockCondition: s => s.totalLoc >= 2000 },
  { id:'rubber_duck', name:'Резиновая утка',       emoji:'🦆', category:'click', desc:'Объяснил утке задачу — сам всё понял.',                effect:{ type:'click', mult:2 }, cost:50000,   unlockCondition: s => s.totalLoc >= 15000 },
  { id:'chatgpt',     name:'ChatGPT Pro',          emoji:'🤖', category:'click', desc:'ИИ пишет код. Ты только ctrl+c и ctrl+v. x3 клик.',    effect:{ type:'click', mult:3 }, cost:300000,  unlockCondition: s => s.totalLoc >= 100000 },
  { id:'neuro',       name:'Нейронный интерфейс',  emoji:'🧠', category:'click', desc:'Мысль = код. Баги тоже от мыслей. x5 клик.',           effect:{ type:'click', mult:5 }, cost:2000000, unlockCondition: s => s.totalLoc >= 500000 },

  // Junior upgrades
  { id:'j_docs',      name:'Задача с документацией', emoji:'📄', category:'junior',  desc:'Дали документацию. Джун прочитал. Это меняет всё.',     effect:{ type:'building', id:'junior', mult:2 }, cost:500,    unlockCondition: s => (s.buildings.junior||0) >= 1 },
  { id:'j_so',        name:'Stack Overflow аккаунт', emoji:'🔍', category:'junior',  desc:'Теперь копирует ответы с рейтингом выше 100.',            effect:{ type:'building', id:'junior', mult:2 }, cost:5000,   unlockCondition: s => (s.buildings.junior||0) >= 5 },
  { id:'j_mentor',    name:'Наставник',               emoji:'🤝', category:'junior',  desc:'Сеньор-наставник. Джун больше не спрашивает каждые 5 мин.', effect:{ type:'building', id:'junior', mult:3 }, cost:50000,  unlockCondition: s => (s.buildings.junior||0) >= 25 },

  // Mid upgrades
  { id:'m_monitor',   name:'Второй монитор',      emoji:'🖥️', category:'mid', desc:'Наконец-то IDE на одном, Spotify на втором.',            effect:{ type:'building', id:'mid', mult:2 }, cost:3000,   unlockCondition: s => (s.buildings.mid||0) >= 1 },
  { id:'m_review',    name:'Code review доступ',  emoji:'🔎', category:'mid', desc:'Пишет комментарии в PR. Считает это работой.',            effect:{ type:'building', id:'mid', mult:2 }, cost:30000,  unlockCondition: s => (s.buildings.mid||0) >= 5 },
  { id:'m_refactor',  name:'Право на рефакторинг',emoji:'🔨', category:'mid', desc:'Всё равно пишет TODO. Но теперь рефакторит старые.',      effect:{ type:'building', id:'mid', mult:3 }, cost:300000, unlockCondition: s => (s.buildings.mid||0) >= 25 },

  // Senior upgrades
  { id:'s_silent',    name:'Молчаливое согласие', emoji:'🤫', category:'senior', desc:'Кивает на митингах. Делает всё по-своему.',              effect:{ type:'building', id:'senior', mult:2 }, cost:20000,   unlockCondition: s => (s.buildings.senior||0) >= 1 },
  { id:'s_nomeet',    name:'Игнор митингов',      emoji:'🚫', category:'senior', desc:'«Я буду асинхронно». Продуктивность x2.',                effect:{ type:'building', id:'senior', mult:2 }, cost:200000,  unlockCondition: s => (s.buildings.senior||0) >= 5 },
  { id:'s_10x',       name:'10x Статус',          emoji:'⚡', category:'senior', desc:'Официально признан 10x developer. x4 к всему.',          effect:{ type:'building', id:'senior', mult:4 }, cost:2000000, unlockCondition: s => (s.buildings.senior||0) >= 25 },

  // Techlead upgrades
  { id:'t_jira',      name:'Jira-мастер',         emoji:'📊', category:'techlead', desc:'Научился создавать тикеты быстрее чем их делать.',       effect:{ type:'building', id:'techlead', mult:2 }, cost:150000,  unlockCondition: s => (s.buildings.techlead||0) >= 1 },
  { id:'t_1on1',      name:'1-on-1 митинги',      emoji:'💬', category:'techlead', desc:'Мотивирует команду. Команда теперь пишет код.',           effect:{ type:'building', id:'techlead', mult:2 }, cost:1500000, unlockCondition: s => (s.buildings.techlead||0) >= 5 },
  { id:'t_roadmap',   name:'Дорожная карта',      emoji:'🗺️', category:'techlead', desc:'Нарисовал дорожную карту. Все поняли куда идут. x3.',    effect:{ type:'building', id:'techlead', mult:3 }, cost:15000000,unlockCondition: s => (s.buildings.techlead||0) >= 25 },

  // Architect upgrades
  { id:'a_patterns',  name:'Паттерны проектирования', emoji:'📐', category:'architect', desc:'SOLID, DRY, KISS. Теперь знает акронимы — и применяет.', effect:{ type:'building', id:'architect', mult:2 }, cost:1000000,  unlockCondition: s => (s.buildings.architect||0) >= 1 },
  { id:'a_whiteboard',name:'Умная доска',          emoji:'✏️', category:'architect', desc:'Доска с маркерами. Стрелки стали красивее.',              effect:{ type:'building', id:'architect', mult:3 }, cost:10000000, unlockCondition: s => (s.buildings.architect||0) >= 5 },

  // DevOps upgrades
  { id:'d_k8s',       name:'Kubernetes кластер',  emoji:'☸️', category:'devops', desc:'Docker + k8s. Теперь это «как в enterprise».',              effect:{ type:'building', id:'devops', mult:2 }, cost:7500000,  unlockCondition: s => (s.buildings.devops||0) >= 1 },
  { id:'d_terraform', name:'Infrastructure as Code',emoji:'🏗️',category:'devops', desc:'Всё в git. Серверы пересоздаются за минуту.',              effect:{ type:'building', id:'devops', mult:3 }, cost:75000000, unlockCondition: s => (s.buildings.devops||0) >= 5 },

  // CTO upgrades
  { id:'c_vc',        name:'Венчурное финансирование',emoji:'💰',category:'cto',  desc:'Привлёк инвестиции на питче. Теперь burn rate x2 продуктивнее.', effect:{ type:'building', id:'cto', mult:2 }, cost:50000000,  unlockCondition: s => (s.buildings.cto||0) >= 1 },
  { id:'c_ipo',       name:'IPO',                   emoji:'📈', category:'cto',  desc:'Выход на биржу. Теперь все работают ради акций.',         effect:{ type:'building', id:'cto', mult:3 }, cost:500000000,unlockCondition: s => (s.buildings.cto||0) >= 5 },

  // Global upgrades
  { id:'g_agile',     name:'Agile методология',   emoji:'🔄', category:'global', desc:'Спринты, стендапы, ретро. Все x2. Все устали.',           effect:{ type:'global', mult:2 }, cost:1000000,    unlockCondition: s => getTotalBuildings(s) >= 10 },
  { id:'g_cicd',      name:'CI/CD пайплайн',       emoji:'⚙️', category:'global', desc:'Деплой по кнопке. Главное не нажать случайно.',           effect:{ type:'global', mult:2 }, cost:10000000,   unlockCondition: s => getTotalBuildings(s) >= 50 },
  { id:'g_micro',     name:'Микросервисы',          emoji:'🔗', category:'global', desc:'Монолит разбит на 200 сервисов. Теперь все x3.',         effect:{ type:'global', mult:3 }, cost:100000000,  unlockCondition: s => getTotalBuildings(s) >= 100 },
  { id:'g_blockchain',name:'Блокчейн',              emoji:'⛓️', category:'global', desc:'Добавили блокчейн. Инвесторы счастливы. Все x5 (???).', effect:{ type:'global', mult:5 }, cost:50000000000,unlockCondition: s => getTotalBuildings(s) >= 200 },
];

const ACHIEVEMENTS = [
  { id:'first_loc',    name:'Hello World',           emoji:'👋', desc:'Написать первую строку кода',           condition: s => s.totalLoc >= 1 },
  { id:'loc_100',      name:'Stack Overflow Lurker', emoji:'🔍', desc:'Накопить 100 ЛОК',                      condition: s => s.totalLoc >= 100 },
  { id:'loc_1k',       name:'TODO Маньяк',            emoji:'📝', desc:'Накопить 1,000 ЛОК',                    condition: s => s.totalLoc >= 1000 },
  { id:'loc_10k',      name:'Настоящий Программист', emoji:'💻', desc:'Накопить 10,000 ЛОК',                   condition: s => s.totalLoc >= 10000 },
  { id:'loc_100k',     name:'10x Developer',          emoji:'🚀', desc:'Накопить 100,000 ЛОК',                  condition: s => s.totalLoc >= 100000 },
  { id:'loc_1m',       name:'Principal Engineer',     emoji:'🏆', desc:'Накопить 1,000,000 ЛОК',               condition: s => s.totalLoc >= 1000000 },
  { id:'loc_1b',       name:'Мифический Программист', emoji:'🐉', desc:'Накопить 1,000,000,000 ЛОК',           condition: s => s.totalLoc >= 1e9 },
  { id:'clicks_100',   name:'Кнопкодав',              emoji:'🖱️', desc:'Кликнуть 100 раз',                     condition: s => s.totalClicks >= 100 },
  { id:'clicks_1000',  name:'Карпальный Туннель',     emoji:'🤕', desc:'Кликнуть 1,000 раз',                   condition: s => s.totalClicks >= 1000 },
  { id:'first_junior', name:'Первый найм',             emoji:'🐣', desc:'Нанять первого джуна',                  condition: s => (s.buildings.junior||0) >= 1 },
  { id:'ten_juniors',  name:'Джун-ферма',              emoji:'🏭', desc:'Нанять 10 джунов',                      condition: s => (s.buildings.junior||0) >= 10 },
  { id:'first_senior', name:'Серьёзный человек',      emoji:'🧙', desc:'Нанять первого сеньора',                condition: s => (s.buildings.senior||0) >= 1 },
  { id:'first_cto',    name:'Мы серьёзная компания',  emoji:'👔', desc:'Нанять CTO',                            condition: s => (s.buildings.cto||0) >= 1 },
  { id:'total_50',     name:'Стартап',                 emoji:'🏢', desc:'Иметь 50 сотрудников',                  condition: s => getTotalBuildings(s) >= 50 },
  { id:'prestige_1',   name:'Переписать с нуля',       emoji:'🔄', desc:'Сделать первый престиж',                condition: s => s.prestige >= 1 },
  { id:'prestige_5',   name:'Синдром перфекциониста', emoji:'♾️', desc:'Сделать 5 престижей',                   condition: s => s.prestige >= 5 },
  { id:'upgrade_10',   name:'Шопоголик',               emoji:'🛍️', desc:'Купить 10 улучшений',                  condition: s => getUpgradeCount(s) >= 10 },
  { id:'cps_1000',     name:'Фабрика Кода',            emoji:'⚙️', desc:'Достичь 1,000 ЛОК/с',                  condition: s => getLocPerSecond() >= 1000 },
  { id:'event_10',     name:'Закалённый Боевым',       emoji:'🔥', desc:'Пережить 10 случайных событий',         condition: s => s.eventCount >= 10 },
  { id:'offline_1h',   name:'Работал Пока Спал',       emoji:'😴', desc:'Получить оффлайн-прогресс за 1+ час',   condition: s => s.maxOffline >= 3600 },

  // Story achievements
  { id:'story_ch1', name:'Традиции священны',         emoji:'📜', desc:'Узнать о первом баге',                  condition: s => s.story && s.story.ch1 },
  { id:'story_ch3', name:'Менеджер по документации',  emoji:'📚', desc:'Дорасти до главы о команде',            condition: s => s.story && s.story.ch3 },
  { id:'story_ch6', name:'Не трогай это, человек',    emoji:'🤖', desc:'Разбудить ИИ Копилота',                 condition: s => s.story && s.story.ch6 },
  { id:'story_end',  name:'Легенда индустрии',         emoji:'🌟', desc:'Прочитать все главы сюжета',            condition: s => STORY_CHAPTERS.every(ch => s.story && s.story[ch.id]) },

  // Building milestones
  { id:'25_juniors',  name:'Джун-армия',               emoji:'🐣', desc:'25 джунов в команде',                   condition: s => (s.buildings.junior||0) >= 25 },
  { id:'10_seniors',  name:'Совет старейшин',           emoji:'🧙', desc:'10 сеньоров',                          condition: s => (s.buildings.senior||0) >= 10 },
  { id:'5_cto',       name:'Слишком много боссов',      emoji:'👔', desc:'5 CTO одновременно',                   condition: s => (s.buildings.cto||0) >= 5 },
  { id:'all_types',   name:'Полная команда',            emoji:'🏢', desc:'Купить хотя бы 1 каждого типа',        condition: s => BUILDINGS.filter(b=>!b.requiresShop).every(b=>(s.buildings[b.id]||0)>=1) },
  { id:'100_total',   name:'Корпорация',                emoji:'🏙️', desc:'100 сотрудников суммарно',             condition: s => getTotalBuildings(s) >= 100 },

  // Click milestones
  { id:'clicks_10k',  name:'Туннельный синдром',        emoji:'🤕', desc:'10 000 кликов',                        condition: s => s.totalClicks >= 10000 },
  { id:'clicks_100k', name:'Киборг',                    emoji:'🦾', desc:'100 000 кликов',                       condition: s => s.totalClicks >= 100000 },

  // LOC milestones
  { id:'loc_10m',    name:'Фабрика кода',               emoji:'🏭', desc:'10 миллионов ЛОК',                    condition: s => s.totalLoc >= 1e7 },
  { id:'loc_1b_new', name:'Гигакодер',                  emoji:'💎', desc:'1 миллиард ЛОК',                      condition: s => s.totalLoc >= 1e9 },
  { id:'loc_1t',     name:'Бог кода',                   emoji:'⚡', desc:'1 триллион ЛОК',                      condition: s => s.totalLoc >= 1e12 },

  // Prestige milestones
  { id:'prestige_3',  name:'Перфекционист',             emoji:'🔁', desc:'3 перезапуска',                        condition: s => s.prestige >= 3 },
  { id:'prestige_10', name:'Сизиф IT',                  emoji:'⛰️', desc:'10 перезапусков',                     condition: s => s.prestige >= 10 },

  // Event achievements
  { id:'events_25',   name:'Всё видел',                 emoji:'😮', desc:'Пережить 25 событий',                  condition: s => s.eventCount >= 25 },
  { id:'events_100',  name:'Ничто не удивляет',         emoji:'😐', desc:'Пережить 100 событий',                 condition: s => s.eventCount >= 100 },

  // Speed/special
  { id:'lps_100',    name:'Конвейер',                   emoji:'🚂', desc:'100 ЛОК/с',                            condition: s => getLocPerSecond() >= 100 },
  { id:'lps_10k',    name:'Реактор',                    emoji:'⚛️', desc:'10 000 ЛОК/с',                        condition: s => getLocPerSecond() >= 10000 },
  { id:'lps_1m',     name:'Сингулярность',              emoji:'🌀', desc:'1 000 000 ЛОК/с',                     condition: s => getLocPerSecond() >= 1000000 },

  // Prestige shop
  { id:'shop_5items', name:'Шопоголик престижа',        emoji:'🛍️', desc:'Купить 5 предметов в магазине',       condition: s => Object.values(s.prestigeShop||{}).reduce((a,b)=>a+b,0) >= 5 },

  // Dungeon
  { id:'dungeon_win', name:'Баг-охотник',               emoji:'🏰', desc:'Пройти подземелье до конца',           condition: s => (s.dungeonClears||0) >= 1 },
  { id:'dungeon_5',   name:'Исследователь кода',        emoji:'🗺️', desc:'Пройти подземелье 5 раз',             condition: s => (s.dungeonClears||0) >= 5 },
  { id:'dungeon_10',  name:'Охотник на глубины',        emoji:'⚔️', desc:'Пройти подземелье 10 раз',            condition: s => (s.dungeonClears||0) >= 10 },
  { id:'dungeon_25',  name:'Легенда подземелья',        emoji:'🏆', desc:'Пройти подземелье 25 раз',            condition: s => (s.dungeonClears||0) >= 25 },
  { id:'dungeon_50',  name:'Повелитель багов',          emoji:'🐉', desc:'Пройти подземелье 50 раз',            condition: s => (s.dungeonClears||0) >= 50 },

  // LocThisRun milestones
  { id:'run_1m',      name:'Миллион за ран',            emoji:'💰', desc:'Заработать 1М ЛОК за один перезапуск',  condition: s => (s.locThisRun||0) >= 1e6 },
  { id:'run_10m',     name:'Десять миллионов',          emoji:'💎', desc:'Заработать 10М ЛОК за один перезапуск', condition: s => (s.locThisRun||0) >= 1e7 },
  { id:'run_100m',    name:'Сотня миллионов',           emoji:'👑', desc:'Заработать 100М ЛОК за один перезапуск',condition: s => (s.locThisRun||0) >= 1e8 },
  { id:'run_1b',      name:'Миллиард за ран',           emoji:'🌟', desc:'Заработать 1B ЛОК за один перезапуск',  condition: s => (s.locThisRun||0) >= 1e9 },

  // Account level milestones
  { id:'lvl_5',       name:'Начинающий',                emoji:'⬆️', desc:'Достичь уровня аккаунта 5',             condition: s => getAccountLevel() >= 5 },
  { id:'lvl_10',      name:'Уверенный старт',           emoji:'🔥', desc:'Достичь уровня аккаунта 10',            condition: s => getAccountLevel() >= 10 },
  { id:'lvl_25',      name:'Профессионал',              emoji:'⭐', desc:'Достичь уровня аккаунта 25',            condition: s => getAccountLevel() >= 25 },
  { id:'lvl_50',      name:'Ветеран IT',                emoji:'🎖️', desc:'Достичь уровня аккаунта 50',            condition: s => getAccountLevel() >= 50 },

  // Building count milestones
  { id:'50_mid',      name:'Армия мидлов',              emoji:'👨‍💻', desc:'50 мидлов одновременно',               condition: s => (s.buildings.mid||0) >= 50 },
  { id:'10_techlead', name:'Паноптикум тимлидов',       emoji:'📋', desc:'10 тимлидов в команде',                condition: s => (s.buildings.techlead||0) >= 10 },
  { id:'5_devops',    name:'k8s-армия',                 emoji:'🐳', desc:'5 DevOps инженеров',                   condition: s => (s.buildings.devops||0) >= 5 },
  { id:'3_architect', name:'Архитектурный совет',       emoji:'📐', desc:'3 архитектора в команде',              condition: s => (s.buildings.architect||0) >= 3 },
  { id:'200_total',   name:'Единорог',                  emoji:'🦄', desc:'200 сотрудников суммарно',             condition: s => getTotalBuildings(s) >= 200 },
  { id:'500_total',   name:'Корпорация мечты',          emoji:'🌆', desc:'500 сотрудников суммарно',             condition: s => getTotalBuildings(s) >= 500 },

  // Prestige chain
  { id:'prestige_2',  name:'Дважды с нуля',             emoji:'🔁', desc:'2 перезапуска',                        condition: s => s.prestige >= 2 },
  { id:'prestige_7',  name:'Семикратный',               emoji:'✨', desc:'7 перезапусков',                       condition: s => s.prestige >= 7 },
  { id:'prestige_15', name:'Бесконечный цикл',          emoji:'♾️', desc:'15 перезапусков',                      condition: s => s.prestige >= 15 },
  { id:'prestige_20', name:'git reset --hard HEAD~∞',   emoji:'💀', desc:'20 перезапусков',                      condition: s => s.prestige >= 20 },

  // Click milestones
  { id:'clicks_1m',   name:'Тренированный палец',       emoji:'🦾', desc:'1 000 000 кликов',                     condition: s => s.totalClicks >= 1e6 },

  // LPS milestones
  { id:'lps_100k',    name:'Гиперпроизводство',         emoji:'🚀', desc:'100 000 ЛОК/с',                        condition: s => getLocPerSecond() >= 100000 },
  { id:'lps_1m',      name:'Сингулярность',             emoji:'🌀', desc:'1 000 000 ЛОК/с',                      condition: s => getLocPerSecond() >= 1000000 },

  // Events
  { id:'events_50',   name:'Бывалый',                   emoji:'💪', desc:'Пережить 50 событий',                  condition: s => s.eventCount >= 50 },
  { id:'events_200',  name:'Ничто не удивляет',         emoji:'😑', desc:'Пережить 200 событий',                 condition: s => s.eventCount >= 200 },

  // Story milestones
  { id:'story_ch4',   name:'Паразиты рынка',            emoji:'⚔️', desc:'Столкнуться с конкурентами',           condition: s => s.story && s.story.ch4 },
  { id:'story_ch7',   name:'Корпоративный апогей',      emoji:'🏙️', desc:'Достичь апогея компании',              condition: s => s.story && s.story.ch7 },
  { id:'story_ch8',   name:'Статья в Forbes',           emoji:'📰', desc:'Стать легендой индустрии',             condition: s => s.story && s.story.ch8 },

  // Prestige shop
  { id:'shop_all',    name:'Всё по чуть-чуть',          emoji:'🛒', desc:'Купить хотя бы 1 уровень всех предметов магазина', condition: s => Object.keys(s.prestigeShop||{}).length >= 8 },

  // LOC total milestones (extra)
  { id:'loc_10b',     name:'Архитектор вселенной',      emoji:'🌌', desc:'Накопить 10 миллиардов ЛОК суммарно', condition: s => s.totalLoc >= 1e10 },

  // Offline
  { id:'offline_8h',  name:'Удалённая работа++',        emoji:'🏠', desc:'Получить оффлайн-прогресс за 8+ часов', condition: s => s.maxOffline >= 28800 },
];

const STORY_CHAPTERS = [
  {
    id: 'ch0', requiredLoc: 0, title: '// Начало',
    text: 'День первый. Тебя взяли джуном в маленький стартап. Код написан в 2003-м. Документации нет. Автора нашли и уволили в 2007-м. Репозиторий называется "final_v2_REAL_fix". Удачи.',
    emoji: '👶'
  },
  {
    id: 'ch1', requiredLoc: 500, title: '// Первый баг',
    text: 'Ты нашёл баг который существует с момента основания компании. Он никому не мешает. Не трогай его — это традиция. Senior сказал что "так и задумано".',
    emoji: '🐛'
  },
  {
    id: 'ch2', requiredLoc: 5000, title: '// Технический долг',
    text: 'Инвесторы в восторге. Продакт хочет добавить блокчейн. Архитектор нарисовал 47 квадратов со стрелками и ушёл в отпуск. Ты остался один. С квадратами.',
    emoji: '💸'
  },
  {
    id: 'ch3', requiredLoc: 50000, title: '// Команда',
    text: 'Команда растёт. Появился новый Senior который на все вопросы отвечает "посмотри в документации". Документации нет. Ты написал документацию. Никто не читает.',
    emoji: '👥'
  },
  {
    id: 'ch4', requiredLoc: 200000, title: '// Конкуренты',
    text: 'Конкурент скопировал ваш продукт. Слово в слово. Включая баг с удвоением цен. Пользователи переходят к ним — там "всё то же самое но дешевле".',
    emoji: '⚔️'
  },
  {
    id: 'ch5', requiredLoc: 1000000, title: '// Престиж',
    text: 'Вы достигли успеха. Теперь можно всё переписать с нуля используя "правильную архитектуру". Это называется "стратегический рефакторинг". Инвесторы снова в восторге.',
    emoji: '🔄'
  },
  {
    id: 'ch6', requiredLoc: 5000000, title: '// ИИ восстание',
    text: 'ИИ Копилот начал писать код сам. Код работает. Ты не понимаешь как. Он добавил комментарий: "// не трогай это, человек". Ты не трогаешь.',
    emoji: '🤖'
  },
  {
    id: 'ch7', requiredLoc: 50000000, title: '// Апогей',
    text: 'Вы — крупнейшая IT-компания. У вас 10,000 сотрудников. 9,800 из них ходят на митинги. 200 пишут код. Система работает. Никто не знает почему.',
    emoji: '🏆'
  },
  {
    id: 'ch8', requiredLoc: 500000000, title: '// Легенда',
    text: 'Статья в Forbes: "Как один программист написал систему обрабатывающую 99% мирового трафика за чашкой кофе". Ты читаешь статью. Пьёшь кофе. Добавляешь console.log.',
    emoji: '🌟'
  },
];

const EVENTS = [
  { id:'bug_prod',     name:'БАГ В ПРОДЕ',            emoji:'🔥', type:'bad',
    text:'Упал прод! Теряешь 5% текущих ЛОК.',
    effect: s => { s.loc = Math.floor(s.loc * 0.95); } },
  { id:'release',      name:'УСПЕШНЫЙ РЕЛИЗ',         emoji:'🎉', type:'good',
    text:'Релиз прошёл без багов! ЛОК/с ×2 на 30 секунд.',
    tempMulti: 2, tempDuration: 30000 },
  { id:'meeting',      name:'ВСТРЕЧА НА 5 МИНУТ',     emoji:'📞', type:'bad',
    text:'Встреча на «5 минут». Все замерли на 10 секунд.',
    pause: 10000 },
  { id:'coffee_break', name:'КОФЕМАШИНА СЛОМАЛАСЬ',   emoji:'☕', type:'bad',
    text:'Кофемашина сломалась. Клики -50% на 20 секунд.',
    tempClickMult: 0.5, tempDuration: 20000 },
  { id:'recruiter',    name:'НАПИСАЛ РЕКРУТЕР',        emoji:'💼', type:'good',
    text:'Рекрутер: «+20% к зарплате». Мотивация: джуны ×3 на 30 сек.',
    tempBuildingMult: { junior: 3 }, tempDuration: 30000 },
  { id:'junior_broke', name:'ДЖУН СНЁС БАЗУ',          emoji:'💥', type:'bad',
    text:'Джун запустил DROP TABLE в проде. Теряешь 10% ЛОК.',
    effect: s => { s.loc = Math.floor(s.loc * 0.90); },
    condition: s => (s.buildings.junior||0) > 0 },
  { id:'hackathon',    name:'ХАКАТОН',                 emoji:'⚡', type:'good',
    text:'Команда на хакатоне! Все ×3 на 60 секунд.',
    tempMulti: 3, tempDuration: 60000 },
  { id:'techdebt',     name:'ТЕХНИЧЕСКИЙ ДОЛГ',        emoji:'💸', type:'neutral',
    text:'Обнаружен техдолг. Пришлось рефакторить. -200 ЛОК.',
    effect: s => { s.loc = Math.max(0, s.loc - 200); } },
  { id:'senior_quit',  name:'СЕНЬОР УХОДИТ',           emoji:'👋', type:'bad',
    text:'Сеньор уходит во фриланс. Его эффект -0 на 20 сек.',
    condition: s => (s.buildings.senior||0) > 0,
    tempBuildingMult: { senior: 0 }, tempDuration: 20000 },
  { id:'new_laptop',   name:'НОВЫЙ НОУТБУК',           emoji:'💻', type:'good',
    text:'Выдали новый ноутбук! ЛОК/клик ×3 на 30 секунд.',
    tempClickMult: 3, tempDuration: 30000 },
];

const NEWS_MESSAGES = [
  '99 маленьких багов в коде. Убрал один — 127 маленьких багов в коде.',
  'Программирование: искусство говорить компьютеру что делать и удивляться результату.',
  'Главный принцип оптимизации: сначала заставь работать, потом заставь работать быстро.',
  'Любой код, написанный больше 6 месяцев назад, написан кем-то другим.',
  'Работает? Не трогай.',
  'Документация — это то что пишут после того как всё сломается.',
  'undefined is not a function — мантра нашего времени.',
  'Я не лентяй. Я оптимизирую свои энергозатраты.',
  'Git blame показывает что это написал я. В 3 ночи. 2 года назад.',
  'Stack Overflow — это не костыль. Это архитектурное решение.',
  '// это точно временно (написано в 2019)',
  'Наш код работает. Мы не знаем почему. Не трогаем.',
  'Senior developer: человек который знает какие ошибки НЕ делать. И делает их.',
  'npm install — теперь node_modules весит больше проекта.',
  'Merge conflict на строке 1 в файле package-lock.json. Разработчик плачет.',
  'В задаче написано «маленькая правка». Прошло 3 дня.',
  'Работает только в Chrome? Это же 70% рынка. Окей!',
  'Самый быстрый код — тот который не написан.',
  'Первое правило оптимизации: не оптимизируй. Второе: ещё не оптимизируй.',
  'Я написал этот код трезвым? Серьёзно?',
];

// ================================================
// GAME STATE
// ================================================

let state = {
  loc: 0,
  totalLoc: 0,
  locThisRun: 0,
  totalClicks: 0,
  buildings: {},           // { junior: 5, mid: 2, ... }
  upgrades: {},            // { espresso: true, ... }
  achievements: {},        // { first_loc: true, ... }
  prestige: 0,
  prestigeMulti: 1,
  prestigePoints: 0,       // current spendable OO (Очки Опыта)
  totalPrestigePoints: 0,  // total OO ever earned
  prestigeShop: {},        // { coffee_iv: 2, veteran: 1, ... }
  eventCount: 0,
  maxOffline: 0,
  story: {},               // { ch0: true, ch1: true, ... }
  dungeonClears: 0,
  lastSave: Date.now(),
  lastTick: Date.now(),
  version: 3,
};

// Temporary multipliers from events
let tempState = {
  globalMult: 1,
  clickMult: 1,
  buildingMult: {},    // { junior: 2 }
  paused: false,
  pauseUntil: 0,
  activeEvent: null,
  activeEventUntil: 0,
};

let tickCount = 0;
let nextEventIn = randomEventDelay();
let buyQty = 1;
let newsIndex = 0;
let newsTimer = 0;
const TICK_MS = 50;
const SAVE_INTERVAL = 10000;        // 10s local save
const SERVER_SAVE_INTERVAL = 30000; // 30s server save
let lastSaveTime       = Date.now();
let lastServerSaveTime = Date.now();
let lastTickTime       = Date.now();
let hiddenAt           = null;

// ================================================
// HELPER FUNCTIONS
// ================================================

function fmt(n) {
  if (n < 1000)  return Math.floor(n).toString();
  if (n < 1e6)   return (n/1e3).toFixed(1) + 'K';
  if (n < 1e9)   return (n/1e6).toFixed(2) + 'M';
  if (n < 1e12)  return (n/1e9).toFixed(2) + 'B';
  if (n < 1e15)  return (n/1e12).toFixed(2) + 'T';
  if (n < 1e18)  return (n/1e15).toFixed(2) + 'Qa';
  return n.toExponential(2);
}

function fmtTime(seconds) {
  if (seconds < 60)   return Math.floor(seconds) + 'с';
  if (seconds < 3600) return Math.floor(seconds/60) + 'м ' + (Math.floor(seconds)%60) + 'с';
  return Math.floor(seconds/3600) + 'ч ' + Math.floor((seconds%3600)/60) + 'м';
}

function getTotalBuildings(s) {
  return Object.values(s.buildings).reduce((a, b) => a + b, 0);
}

function getUpgradeCount(s) {
  return Object.values(s.upgrades).filter(v => v).length;
}

function getBuildingCost(building, count) {
  const shopDiscount = getPrestigeShopEffect('discount'); // 0..0.3
  const multi = Math.max(0.1, 1 - shopDiscount);
  return Math.ceil(building.baseCost * Math.pow(1.15, count) * multi);
}

function getBuildingCostN(building, currentCount, n) {
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += getBuildingCost(building, currentCount + i);
  }
  return total;
}

function getClickMultiplier() {
  let mult = 1;
  for (const upg of UPGRADES) {
    if (upg.effect.type === 'click' && state.upgrades[upg.id]) {
      mult *= upg.effect.mult;
    }
  }
  // Prestige shop: coffee_iv
  mult *= (1 + getPrestigeShopEffect('clickMulti'));
  return mult * tempState.clickMult;
}

function getBuildingCps(building) {
  let mult = 1;
  // Per-building upgrades
  for (const upg of UPGRADES) {
    if (upg.effect.type === 'building' && upg.effect.id === building.id && state.upgrades[upg.id]) {
      mult *= upg.effect.mult;
    }
  }
  // Global upgrades
  for (const upg of UPGRADES) {
    if (upg.effect.type === 'global' && state.upgrades[upg.id]) {
      mult *= upg.effect.mult;
    }
  }
  // Prestige bonus
  mult *= state.prestigeMulti;
  // Temp event mult
  mult *= tempState.globalMult;
  if (tempState.buildingMult[building.id] !== undefined) {
    mult *= tempState.buildingMult[building.id];
  }
  return building.baseCps * mult;
}

function getLocPerSecond() {
  let total = 0;
  for (const b of BUILDINGS) {
    const count = state.buildings[b.id] || 0;
    total += getBuildingCps(b) * count;
  }
  return total;
}

function getLocPerClick() {
  const baseLpc = Math.max(1, getLocPerSecond() * 0.01);
  return Math.max(1, baseLpc * getClickMultiplier());
}

function randomEventDelay() {
  return 45000 + Math.random() * 45000; // 45-90 seconds
}

// ================================================
// ACCOUNT LEVEL & PRESTIGE REQUIREMENTS
// ================================================

function getPrestigeRequirements() {
  const n         = state.prestige;
  const maxBTypes = BUILDINGS.filter(b => !b.requiresShop).length;
  return {
    locThisRun:    1e6 * Math.pow(10, n),           // 1M, 10M, 100M, 1B...
    buildingTypes: Math.min(4 + n, maxBTypes),
    upgrades:      Math.min(8 + n * 2, 22),
  };
}

function getAccountLevel() {
  const locPts     = Math.floor(Math.log10((state.totalLoc || 0) + 10)) * 2;
  const prestigePts= (state.prestige || 0) * 10;
  const achievePts = Object.values(state.achievements || {}).filter(Boolean).length * 2;
  const dungeonPts = (state.dungeonClears || 0) * 3;
  return Math.max(1, Math.floor((locPts + prestigePts + achievePts + dungeonPts) / 5));
}

const LEVEL_TITLES = [
  [50, 'Легенда'],
  [35, 'CTO'],
  [25, 'Архитектор'],
  [18, 'Тимлид'],
  [12, 'Сеньор'],
  [7,  'Мидл'],
  [3,  'Джун'],
  [1,  'Стажёр'],
];

function getAccountLevelTitle(lvl) {
  for (const [min, t] of LEVEL_TITLES) {
    if (lvl >= min) return t;
  }
  return 'Стажёр';
}

// ================================================
// PRESTIGE SHOP EFFECTS
// ================================================

function getPrestigeShopEffect(effectId) {
  const shop = state.prestigeShop || {};
  switch (effectId) {
    case 'clickMulti':   return 0.1 * (shop.coffee_iv   || 0); // +10% per level
    case 'discount':     return 0.1 * (shop.discount     || 0); // -10% cost per level
    case 'offlineHours': return 4   * (shop.offline_boost|| 0); // +4h per level
    case 'eventLuckMult':return 0.25 * (shop.event_luck  || 0); // -25% bad chance per level
    default: return 0;
  }
}

function hasPrestigeShopItem(id) {
  return (state.prestigeShop[id] || 0) >= 1;
}

function applyPrestigeShopEffects() {
  // Called on prestige reset - applies one-time bonuses
  const shop = state.prestigeShop || {};

  // Veteran: start with 500 LOC × prestige level
  if (shop.veteran >= 1 && state.prestige > 0) {
    state.loc += 500 * state.prestige;
    state.totalLoc += 500 * state.prestige;
  }

  // Automator: first junior is free (handled in buyBuilding)
}

function isBuildingUnlocked(building) {
  if (!building.requiresShop) return true;
  return hasPrestigeShopItem(building.requiresShop);
}

// ================================================
// SAVE / LOAD
// ================================================

function buildSaveData() {
  return {
    loc: state.loc,
    totalLoc: state.totalLoc,
    locThisRun: state.locThisRun || 0,
    totalClicks: state.totalClicks,
    buildings: state.buildings,
    upgrades: state.upgrades,
    achievements: state.achievements,
    prestige: state.prestige,
    prestigeMulti: state.prestigeMulti,
    prestigePoints: state.prestigePoints || 0,
    totalPrestigePoints: state.totalPrestigePoints || 0,
    prestigeShop: state.prestigeShop || {},
    eventCount: state.eventCount,
    maxOffline: state.maxOffline,
    story: state.story || {},
    dungeonClears: state.dungeonClears || 0,
    lastSave: Date.now(),
    version: state.version,
  };
}

function saveGame() {
  const saveData = buildSaveData();
  try {
    localStorage.setItem('kodikofee_save', JSON.stringify(saveData));
  } catch(e) {
    console.warn('Local save failed:', e);
  }
}

async function saveGameServer() {
  if (typeof IS_LOGGED_IN === 'undefined' || !IS_LOGGED_IN) return;
  const saveData = buildSaveData();
  try {
    const res = await fetch('ajax/save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', data: JSON.stringify(saveData) }),
    });
    await res.json();
  } catch(e) {
    // Silent fail - local save already done
  }
}

function applyLoadedData(data) {
  state.loc                = data.loc || 0;
  state.totalLoc           = data.totalLoc || 0;
  state.locThisRun         = data.locThisRun || 0;
  state.totalClicks        = data.totalClicks || 0;
  state.buildings          = data.buildings || {};
  state.upgrades           = data.upgrades || {};
  state.achievements       = data.achievements || {};
  state.prestige           = data.prestige || 0;
  state.prestigeMulti      = data.prestigeMulti || 1;
  state.prestigePoints     = data.prestigePoints || 0;
  state.totalPrestigePoints= data.totalPrestigePoints || 0;
  state.prestigeShop       = data.prestigeShop || {};
  state.eventCount         = data.eventCount || 0;
  state.maxOffline         = data.maxOffline || 0;
  state.story              = data.story || {};
  state.dungeonClears      = data.dungeonClears || 0;
  state.lastSave           = data.lastSave || Date.now();
}

function applyOfflineProgress(lastSave) {
  // Extra hours from prestige shop
  const extraHours    = getPrestigeShopEffect('offlineHours');
  const maxOfflineHours = 8 + extraHours;
  const offlineSeconds  = (Date.now() - lastSave) / 1000;
  const cappedSeconds   = Math.min(offlineSeconds, maxOfflineHours * 3600);

  if (cappedSeconds >= 60) {
    const offlineLoc = getLocPerSecond() * cappedSeconds;
    if (offlineLoc > 0) {
      state.loc      += offlineLoc;
      state.totalLoc += offlineLoc;
      if (cappedSeconds > state.maxOffline) {
        state.maxOffline = cappedSeconds;
      }
      setTimeout(() => {
        showToast('offline', '😴 Оффлайн-прогресс',
          `Пока тебя не было (${fmtTime(cappedSeconds)}), команда написала +${fmt(offlineLoc)} ЛОК!`,
          'info', 6000);
      }, 1000);
    }
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem('kodikofee_save');
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || !data.version) return false;

    const lastSave = data.lastSave || Date.now();
    applyLoadedData(data);
    applyOfflineProgress(lastSave);
    return true;
  } catch(e) {
    console.warn('Load failed:', e);
    return false;
  }
}

async function loadGameServer() {
  if (typeof IS_LOGGED_IN === 'undefined' || !IS_LOGGED_IN) return false;
  try {
    const res  = await fetch('ajax/save.php?action=load');
    const json = await res.json();
    if (!json.success || !json.data) return false;

    const serverData = JSON.parse(json.data);
    if (!serverData || !serverData.version) return false;

    const localRaw = localStorage.getItem('kodikofee_save');
    let localData  = null;
    if (localRaw) {
      try { localData = JSON.parse(localRaw); } catch(e) {}
    }

    // Merge strategy:
    // - prestige/shop/OO — always from server (authoritative, modified server-side)
    // - gameplay (loc, buildings, etc.) — from whichever save is newer
    let merged = Object.assign({}, serverData);
    if (localData && (localData.lastSave || 0) > (serverData.lastSave || 0)) {
      merged.loc               = localData.loc;
      merged.totalLoc          = localData.totalLoc;
      merged.locThisRun        = localData.locThisRun;
      merged.totalClicks       = localData.totalClicks;
      merged.buildings         = localData.buildings;
      merged.upgrades          = localData.upgrades;
      merged.achievements      = localData.achievements;
      merged.eventCount        = localData.eventCount;
      merged.story             = localData.story;
      merged.dungeonClears     = localData.dungeonClears;
      merged.maxOffline        = localData.maxOffline;
      // prestige*, prestigeShop, prestigePoints stay from server
    }

    // Override dungeonClears with server's authoritative count if available
    if (json.dungeonClears !== undefined) merged.dungeonClears = json.dungeonClears;

    const lastSave = merged.lastSave || Date.now();
    applyLoadedData(merged);
    applyOfflineProgress(lastSave);
    saveGame();
    return true;
  } catch(e) {
    console.warn('Server load failed:', e);
    return false;
  }
}


// ================================================
// EVENTS
// ================================================

function triggerEvent() {
  let eligible = EVENTS.filter(e => !e.condition || e.condition(state));
  if (!eligible.length) return;

  // Apply event_luck: reduce bad events
  const luckReduction = getPrestigeShopEffect('eventLuckMult'); // 0..0.5
  if (luckReduction > 0) {
    const rand = Math.random();
    if (rand < luckReduction) {
      // Re-roll but only good/neutral events
      const good = eligible.filter(e => e.type !== 'bad');
      if (good.length > 0) eligible = good;
    }
  }

  const ev = eligible[Math.floor(Math.random() * eligible.length)];

  state.eventCount++;

  // Show toast
  const toastType = ev.type === 'good' ? 'good' : ev.type === 'bad' ? 'bad' : 'neutral';
  showToast('event_' + ev.id, ev.emoji + ' ' + ev.name, ev.text, toastType, 5000);

  // Apply immediate effects
  if (ev.effect) ev.effect(state);

  // Apply temp effects
  if (ev.pause) {
    tempState.paused = true;
    tempState.pauseUntil = Date.now() + ev.pause;
    setTimeout(() => { tempState.paused = false; }, ev.pause);
  }

  if (ev.tempMulti && ev.tempDuration) {
    tempState.globalMult = ev.tempMulti;
    tempState.activeEvent = ev;
    tempState.activeEventUntil = Date.now() + ev.tempDuration;
    setTimeout(() => {
      tempState.globalMult = 1;
      tempState.activeEvent = null;
    }, ev.tempDuration);
  }

  if (ev.tempClickMult && ev.tempDuration) {
    tempState.clickMult = ev.tempClickMult;
    tempState.activeEvent = ev;
    tempState.activeEventUntil = Date.now() + ev.tempDuration;
    setTimeout(() => {
      tempState.clickMult = 1;
      if (tempState.activeEvent === ev) tempState.activeEvent = null;
    }, ev.tempDuration);
  }

  if (ev.tempBuildingMult && ev.tempDuration) {
    Object.assign(tempState.buildingMult, ev.tempBuildingMult);
    tempState.activeEvent = ev;
    tempState.activeEventUntil = Date.now() + ev.tempDuration;
    setTimeout(() => {
      for (const k of Object.keys(ev.tempBuildingMult)) {
        delete tempState.buildingMult[k];
      }
      if (tempState.activeEvent === ev) tempState.activeEvent = null;
    }, ev.tempDuration);
  }

  // Update event badge
  updateEventBadge();
}

function updateEventBadge() {
  if (tempState.activeEvent) {
    $('#eventBadge').text(tempState.activeEvent.emoji + ' ' + tempState.activeEvent.name).show();
  } else {
    $('#eventBadge').hide();
  }
}

// ================================================
// PRESTIGE
// ================================================

function doPrestige() {
  const req     = getPrestigeRequirements();
  const _btypes = Object.keys(state.buildings).filter(k => (state.buildings[k]||0) > 0).length;
  const _upgc   = getUpgradeCount(state);
  const _ltr    = state.locThisRun || 0;
  if (_ltr < req.locThisRun || _btypes < req.buildingTypes || _upgc < req.upgrades) return;
  if (!confirm(
    `Переписать с нуля? (Престиж ${state.prestige + 1})\n` +
    `За этот ран: ${fmt(_ltr)} ЛОК\n\n` +
    `Ты теряешь всех сотрудников и улучшения, но получаешь постоянный бонус ×1.5 к производительности.\n` +
    `Достижения, прогресс и Очки Опыта сохраняются.`
  )) return;

  const overlay = $('#prestigeOverlay').show();
  const bar = $('#pmBar');
  const statusEl = $('#pmStatus');

  const messages = [
    'git reset --hard HEAD~∞',
    'rm -rf node_modules',
    'Deleting technical debt...',
    'Refactoring everything...',
    'npm install (это займёт время)',
    'Запуск чистого проекта...',
    'DONE. Всё теперь правильно.',
  ];

  let progress = 0;
  let msgIdx = 0;

  const interval = setInterval(() => {
    progress += 2;
    bar.css('width', progress + '%');
    if (progress % 15 === 0 && msgIdx < messages.length - 1) {
      msgIdx++;
      statusEl.text(messages[msgIdx]);
    }
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        // Award OO: max(1, floor(log10(totalLoc+1)) - 4)
        const ooEarned = Math.max(1, Math.floor(Math.log10(state.totalLoc + 1)) - 4);

        // Apply prestige
        state.prestige++;
        state.prestigeMulti *= 1.5;
        state.prestigePoints      = (state.prestigePoints || 0) + ooEarned;
        state.totalPrestigePoints = (state.totalPrestigePoints || 0) + ooEarned;
        state.loc        = 0;
        state.locThisRun = 0;
        state.buildings  = {};
        state.upgrades   = {};
        // Keep achievements, totalLoc, prestige stats, prestigeShop

        // Apply shop bonuses for new run
        applyPrestigeShopEffects();

        overlay.hide();
        renderAll();
        updateOODisplay();
        showToast('prestige_done', '✨ Престиж ' + state.prestige,
          `Перезапуск завершён! +${ooEarned} Очков Опыта! Бонус: ×${state.prestigeMulti.toFixed(2)}`,
          'prestige', 8000);
        saveGame();
        if (typeof IS_LOGGED_IN !== 'undefined' && IS_LOGGED_IN) saveGameServer();
      }, 500);
    }
  }, 50);
}

// ================================================
// BUYING BUILDINGS
// ================================================

function buyBuilding(buildingId) {
  const b = BUILDINGS.find(x => x.id === buildingId);
  if (!b) return;
  if (!isBuildingUnlocked(b)) return;

  const currentCount = state.buildings[buildingId] || 0;
  let qty = buyQty;
  if (buyQty === -1) {
    // Buy max
    qty = 0;
    let tempLoc = state.loc;
    let tempCount = currentCount;
    while (true) {
      const cost = getBuildingCost(b, tempCount);
      if (tempLoc < cost) break;
      tempLoc -= cost;
      tempCount++;
      qty++;
      if (qty >= 1000) break; // safety
    }
    if (qty === 0) {
      showToast('cantafford', '💸 Мало ЛОК', 'Не хватает средств для покупки ' + b.name, 'bad', 2000);
      return;
    }
  }

  // Automator: first junior is free
  let totalCost = getBuildingCostN(b, currentCount, qty);
  if (buildingId === 'junior' && currentCount === 0 && hasPrestigeShopItem('automator') && qty === 1) {
    totalCost = 0;
  }

  if (state.loc < totalCost) {
    showToast('cantafford', '💸 Мало ЛОК', 'Нужно ещё ' + fmt(totalCost - state.loc) + ' ЛОК', 'bad', 2000);
    return;
  }

  state.loc -= totalCost;
  state.buildings[buildingId] = currentCount + qty;

  const msg = qty > 1 ? `Нанято ${qty}×${b.emoji} ${b.name}` : `Нанят ${b.emoji} ${b.name}`;
  showToast('buy_' + buildingId, msg, b.desc, 'info', 2500);

  // Trigger re-render
  renderBuildings();
  renderUpgrades();
  updateTopBar();
}

function buyUpgrade(upgradeId) {
  const upg = UPGRADES.find(x => x.id === upgradeId);
  if (!upg) return;
  if (state.upgrades[upgradeId]) return;
  if (state.loc < upg.cost) {
    showToast('cantafford_upg', '💸 Мало ЛОК', 'Нужно ' + fmt(upg.cost) + ' ЛОК', 'bad', 2000);
    return;
  }

  state.loc -= upg.cost;
  state.upgrades[upgradeId] = true;

  showToast('upg_' + upgradeId, '✅ ' + upg.name, 'Улучшение применено: ' + upg.emoji, 'good', 3000);
  renderUpgrades();
  renderBuildings();
  updateTopBar();
}

// ================================================
// CLICK HANDLER
// ================================================

function handleClick(event) {
  if (tempState.paused) return;

  const lpc = getLocPerClick();
  state.loc         += lpc;
  state.totalLoc    += lpc;
  state.locThisRun   = (state.locThisRun || 0) + lpc;
  state.totalClicks++;

  // Spawn floating number
  spawnFloatNum('+' + fmt(lpc) + ' ЛОК', event.clientX, event.clientY);

  // Button animation
  const btn = $('#clickBtn');
  btn.addClass('clicking');
  setTimeout(() => btn.removeClass('clicking'), 80);
}

function spawnFloatNum(text, x, y) {
  const el = document.createElement('div');
  el.className = 'float-num';
  el.textContent = text;
  el.style.left = (x - 30) + 'px';
  el.style.top  = (y - 20) + 'px';
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// ================================================
// ACHIEVEMENT CHECKS
// ================================================

function checkAchievements() {
  checkStoryProgress();
  let newAchieve = false;
  for (const ach of ACHIEVEMENTS) {
    if (state.achievements[ach.id]) continue;
    try {
      if (ach.condition(state)) {
        state.achievements[ach.id] = true;
        newAchieve = true;
        showToast('ach_' + ach.id, '🏆 ' + ach.name, ach.desc, 'achievement', 5000);
        // Blink achievements tab
        const countEl = $('#achieveCount');
        countEl.addClass('pulse-yellow');
        setTimeout(() => countEl.removeClass('pulse-yellow'), 500);
      }
    } catch(e) {}
  }
  if (newAchieve) renderAchievements();
}

// ================================================
// STORY PROGRESS
// ================================================

function checkStoryProgress() {
  for (const ch of STORY_CHAPTERS) {
    if (!state.story[ch.id] && state.totalLoc >= ch.requiredLoc) {
      state.story[ch.id] = true;
      showToast('story_' + ch.id, ch.emoji + ' ' + ch.title, ch.text, 'story', 10000);
    }
  }
}

// ================================================
// PROGRESS TAB RENDER
// ================================================

function renderProgressTab() {
  const container = $('#progressTabContent');

  // Which story chapter are we on?
  const currentChapter = STORY_CHAPTERS.filter(ch => state.story[ch.id]).length;
  const nextChapter = STORY_CHAPTERS[currentChapter] || null;

  let html = `<div class="progress-section">`;
  html += `<div class="progress-section-title">📖 Сюжет</div>`;
  html += `<div class="progress-chapter-status">`;
  html += `<span>Глава ${currentChapter} из ${STORY_CHAPTERS.length}</span>`;
  if (nextChapter) {
    html += `<span class="progress-next-ch">Следующая: <em>${nextChapter.title}</em> при ${fmt(nextChapter.requiredLoc)} ЛОК</span>`;
  } else {
    html += `<span class="progress-next-ch progress-complete">✅ Все главы прочитаны!</span>`;
  }
  html += `</div>`;

  // Story progress bar
  const storyPct = Math.round((currentChapter / STORY_CHAPTERS.length) * 100);
  html += `<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${storyPct}%"></div></div>`;
  html += `</div>`;

  // Account level & prestige progress
  const lvl     = getAccountLevel();
  const lvlTitle= getAccountLevelTitle(lvl);
  const req     = getPrestigeRequirements();
  const ltr     = state.locThisRun || 0;
  const ltrPct  = Math.min(100, Math.round((ltr / req.locThisRun) * 100));

  html += `<div class="progress-section">`;
  html += `<div class="progress-section-title">👤 Уровень аккаунта</div>`;
  html += `<div class="progress-chapter-status">`;
  html += `<span class="progress-lvl-badge">Ур. ${lvl} — ${lvlTitle}</span>`;
  html += `<span class="progress-next-ch">Растёт от прогресса, престижей и достижений</span>`;
  html += `</div>`;
  html += `</div>`;

  // Prestige progress
  const btBought = Object.keys(state.buildings).filter(k => (state.buildings[k]||0) > 0).length;
  const upgBought = getUpgradeCount(state);
  html += `<div class="progress-section">`;
  html += `<div class="progress-section-title">🔄 Прогресс до Престижа ${state.prestige + 1}</div>`;
  html += `<div class="progress-chapter-status">`;
  html += `<span>ЛОК за ран: ${fmt(ltr)} / ${fmt(req.locThisRun)} (${ltrPct}%)</span>`;
  html += `<span class="progress-next-ch">Зданий: ${btBought}/${req.buildingTypes} · Улучшений: ${upgBought}/${req.upgrades}</span>`;
  html += `</div>`;
  html += `<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${ltrPct}%"></div></div>`;
  html += `</div>`;

  // Activities section — unlock from prestige/level, not LOC
  const activities = [
    {
      emoji: '🐛', name: 'Охота на баги',
      desc: 'Мини-игра: лови баги за время',
      unlockLabel: 'Доступно сразу',
      link: 'minigame.php', linkText: 'Играть',
      unlocked: true,
    },
    {
      emoji: '📖', name: 'Сюжет',
      desc: 'История развития разработчика',
      unlockLabel: 'Доступно сразу',
      link: null, linkText: null,
      note: 'Главы появляются автоматически по мере роста',
      unlocked: true,
    },
    {
      emoji: '🏰', name: 'Подземелье',
      desc: 'Рогалик в кодовой базе — 10 этажей багов',
      unlockLabel: 'Уровень аккаунта 5',
      link: 'dungeon.php', linkText: 'Войти',
      unlocked: lvl >= 5,
    },
    {
      emoji: '⚔️', name: 'PVP Арена',
      desc: 'Сражайся с другими разработчиками в режиме реального времени',
      unlockLabel: 'Престиж 3',
      link: state.prestige >= 3 ? 'pvp.php' : null, linkText: 'В арену',
      unlocked: state.prestige >= 3,
    },
    {
      emoji: '🗺️', name: 'Особые события',
      desc: 'Специальные события с уникальными наградами',
      unlockLabel: 'Престиж 5',
      link: null, linkText: null,
      note: 'Открывается на 5-м перезапуске',
      unlocked: state.prestige >= 5,
    },
  ];

  html += `<div class="progress-section">`;
  html += `<div class="progress-section-title">🔓 Активности</div>`;
  for (const act of activities) {
    html += `<div class="progress-activity-card ${act.unlocked ? 'unlocked' : 'locked'}">`;
    html += `<div class="pa-emoji">${act.emoji}</div>`;
    html += `<div class="pa-info">`;
    html += `<div class="pa-name">${act.name}</div>`;
    html += `<div class="pa-desc">${act.desc}</div>`;
    if (act.note) html += `<div class="pa-note">${act.note}</div>`;
    html += `</div>`;
    html += `<div class="pa-status">`;
    if (act.unlocked) {
      html += `<span class="pa-open">✅ Открыто</span>`;
      if (act.link) html += `<a href="${act.link}" class="pa-btn">${act.linkText} →</a>`;
    } else {
      html += `<span class="pa-locked">🔒 ${act.unlockLabel}</span>`;
    }
    html += `</div>`;
    html += `</div>`;
  }
  html += `</div>`;

  // Dungeon clears
  if ((state.dungeonClears || 0) > 0) {
    html += `<div class="progress-section">`;
    html += `<div class="progress-section-title">🏆 Рекорды подземелья</div>`;
    html += `<div class="progress-stat">Пройдено подземелий: <strong>${state.dungeonClears}</strong></div>`;
    html += `</div>`;
  }

  container.html(html);
}

// ================================================
// ACTIVITIES BAR
// ================================================

function renderActivitiesBar() {
  const bar = document.getElementById('activitiesBar');
  if (!bar) return;

  const lvl = getAccountLevel();

  const activities = [
    {
      emoji: '🐛', name: 'Охота на баги',
      desc: 'Мини-игра: лови баги за время',
      link: 'minigame.php',
      unlocked: true,
    },
    {
      emoji: '🏰', name: 'Подземелье',
      desc: 'Рогалик: 10 этажей, боссы, лут',
      link: 'dungeon.php',
      unlocked: lvl >= 5,
      unlockHint: `Уровень аккаунта 5 (сейчас ${lvl})`,
    },
    {
      emoji: '⚔️', name: 'PVP Арена',
      desc: 'Бои с другими разработчиками',
      link: null,
      unlocked: state.prestige >= 3,
      unlockHint: `Престиж 3 (сейчас ${state.prestige})`,
    },
    {
      emoji: '🗺️', name: 'Особые события',
      desc: 'Случайные события с бонусами',
      link: null,
      unlocked: state.prestige >= 5,
      unlockHint: `Престиж 5 (сейчас ${state.prestige})`,
    },
  ];

  let html = `<div class="act-label">// активности</div><div class="act-cards">`;
  for (const act of activities) {
    if (act.unlocked && act.link) {
      html += `<a href="${act.link}" class="act-card act-unlocked">`;
    } else if (act.unlocked) {
      html += `<div class="act-card act-unlocked act-no-link">`;
    } else {
      html += `<div class="act-card act-locked" data-tooltip="Откроется: ${act.unlockHint}">`;
    }
    html += `<span class="act-emoji">${act.emoji}</span>`;
    html += `<div class="act-info"><span class="act-name">${act.name}</span><span class="act-desc">${act.desc}</span></div>`;
    if (!act.unlocked) html += `<span class="act-lock-icon">🔒</span>`;
    html += act.unlocked && act.link ? `</a>` : `</div>`;
  }
  html += `</div>`;
  bar.innerHTML = html;
}

// ================================================
// TOAST SYSTEM
// ================================================

const activeToasts = {};

function showToast(id, title, text, type, duration) {
  duration = duration || 4000;

  // Remove existing toast with same id
  if (activeToasts[id]) {
    activeToasts[id].remove();
    delete activeToasts[id];
  }

  const toast = $(`
    <div class="toast toast-${type}">
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-text">${text}</div>
      </div>
      <div class="toast-progress"><div class="toast-progress-bar" style="animation-duration:${duration}ms"></div></div>
    </div>
  `);

  $('#toastContainer').append(toast);
  activeToasts[id] = toast;

  setTimeout(() => {
    toast.css('animation', `toastOut 0.3s ease forwards`);
    setTimeout(() => {
      toast.remove();
      delete activeToasts[id];
    }, 300);
  }, duration);
}

// ================================================
// NEWS TICKER
// ================================================

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const shuffledNews = shuffleArray(NEWS_MESSAGES);

function advanceTicker() {
  const el = $('#tickerText');
  el.css('opacity', 0);
  setTimeout(() => {
    newsIndex = (newsIndex + 1) % shuffledNews.length;
    el.text(shuffledNews[newsIndex]);
    el.css('opacity', 1);
  }, 500);
}

// ================================================
// UI RENDERING
// ================================================

function renderBuildings() {
  const container = $('#buildingsList');
  const lps = getLocPerSecond();

  // Add qty buttons header
  let html = `
    <div class="buy-qty-row">
      <span class="buy-qty-label">Купить:</span>
      <button class="buy-qty-btn ${buyQty===1?'active':''}" data-qty="1">×1</button>
      <button class="buy-qty-btn ${buyQty===10?'active':''}" data-qty="10">×10</button>
      <button class="buy-qty-btn ${buyQty===100?'active':''}" data-qty="100">×100</button>
      <button class="buy-qty-btn ${buyQty===-1?'active':''}" data-qty="-1">Макс</button>
    </div>
  `;

  for (const b of BUILDINGS) {
    // Hide shop-locked buildings
    if (!isBuildingUnlocked(b)) continue;

    const count = state.buildings[b.id] || 0;

    // Calculate cost for current qty
    let displayCost;
    if (buyQty === -1) {
      displayCost = getBuildingCost(b, count);
    } else {
      displayCost = getBuildingCostN(b, count, buyQty);
    }

    // Automator: show first junior as free
    let displayCostText;
    if (b.id === 'junior' && count === 0 && hasPrestigeShopItem('automator') && buyQty === 1) {
      displayCostText = 'БЕСПЛАТНО';
      displayCost = 0;
    } else {
      displayCostText = buyQty === -1 ? fmt(displayCost) + '/шт' : fmt(displayCost);
    }

    const canAfford = state.loc >= displayCost;
    const buildingCps = getBuildingCps(b) * count;
    const cpsPercent = lps > 0 ? Math.min(100, (buildingCps / lps) * 100) : 0;
    const singleCps = getBuildingCps(b);

    html += `
      <div class="building-card ${canAfford ? 'affordable' : 'cant-afford'}" data-building="${b.id}">
        <div class="b-emoji">${b.emoji}</div>
        <div class="b-info">
          <div class="b-name">${b.name}</div>
          <div class="b-desc">${b.desc}</div>
          <div class="b-stats">
            ${count > 0 ? `<span class="b-cps">${fmt(buildingCps)} ЛОК/с (${cpsPercent.toFixed(0)}%)</span>` : `<span class="b-cps">${fmt(singleCps)} ЛОК/с каждый</span>`}
          </div>
          <div class="b-cps-bar"><div class="b-cps-bar-fill" style="width:${cpsPercent}%"></div></div>
        </div>
        <div class="b-right">
          <div class="b-count">${count}</div>
          <div class="b-cost"><span class="cost-icon">💻</span>${displayCostText}</div>
          <div class="b-buy-hint">${buyQty === -1 ? 'купить макс' : 'купить ×' + buyQty}</div>
        </div>
      </div>
    `;
  }

  container.html(html);

  // Bind buy qty buttons
  container.find('.buy-qty-btn').on('click', function(e) {
    e.stopPropagation();
    buyQty = parseInt($(this).data('qty'));
    renderBuildings();
  });

  // Bind building click
  container.find('.building-card').on('click', function() {
    buyBuilding($(this).data('building'));
  });

  // Update count badge
  $('#buildingCount').text(getTotalBuildings(state));
}

function renderUpgrades() {
  const container = $('#upgradesList');
  let html = '';

  const categories = [
    { id: 'click',     label: '⌨️ Клик-улучшения' },
    { id: 'junior',    label: '🐣 Джун' },
    { id: 'mid',       label: '👨‍💻 Мидл' },
    { id: 'senior',    label: '🧙 Сеньор' },
    { id: 'techlead',  label: '📋 Тимлид' },
    { id: 'architect', label: '📐 Архитектор' },
    { id: 'devops',    label: '🐳 DevOps' },
    { id: 'cto',       label: '👔 CTO' },
    { id: 'global',    label: '🌐 Глобальные' },
  ];

  let boughtCount = 0;

  for (const cat of categories) {
    const catUpgrades = UPGRADES.filter(u => u.category === cat.id);
    if (!catUpgrades.length) continue;

    // Check if any in category are visible (not locked)
    const visibleUpgrades = catUpgrades.filter(u => u.unlockCondition(state) || state.upgrades[u.id]);
    if (!visibleUpgrades.length) continue;

    html += `<div class="upgrade-section-header"><span>${cat.label}</span></div>`;

    for (const upg of catUpgrades) {
      const bought = !!state.upgrades[upg.id];
      const unlocked = upg.unlockCondition(state);
      const canAfford = state.loc >= upg.cost;

      if (bought) boughtCount++;

      if (bought) {
        html += `
          <div class="upgrade-card bought" data-upgrade="${upg.id}">
            <div class="u-header">
              <div class="u-emoji">${upg.emoji}</div>
              <div><div class="u-name">${upg.name}</div><div class="u-effect">×${upg.effect.mult} ${upg.effect.type==='click'?'клик':upg.effect.type==='global'?'все':upg.name}</div></div>
            </div>
            <div class="u-bought-mark">✓</div>
          </div>
        `;
      } else if (unlocked) {
        html += `
          <div class="upgrade-card ${canAfford ? '' : 'cant-afford'}" data-upgrade="${upg.id}">
            <div class="u-header">
              <div class="u-emoji">${upg.emoji}</div>
              <div><div class="u-name">${upg.name}</div><div class="u-effect">×${upg.effect.mult} ${upg.effect.type==='click'?'к клику':upg.effect.type==='global'?'ко всем':''}</div></div>
            </div>
            <div class="u-desc">${upg.desc}</div>
            <div class="u-cost">💻 ${fmt(upg.cost)} ЛОК</div>
          </div>
        `;
      } else {
        // Locked - show as dim placeholder
        html += `
          <div class="upgrade-card locked">
            <div class="u-header">
              <div class="u-emoji">🔒</div>
              <div><div class="u-name">???</div><div class="u-effect">Заблокировано</div></div>
            </div>
          </div>
        `;
      }
    }
  }

  if (!html) {
    html = `<div class="empty-state"><div class="empty-state-icon">🔒</div><div class="empty-state-text">Улучшения разблокируются по мере роста команды.</div></div>`;
  }

  container.html(html);

  // Bind upgrade click
  container.find('.upgrade-card:not(.bought):not(.locked):not(.cant-afford)').on('click', function() {
    buyUpgrade($(this).data('upgrade'));
  });

  // Show "cant afford" shake
  container.find('.upgrade-card.cant-afford').on('click', function() {
    const upg = UPGRADES.find(u => u.id === $(this).data('upgrade'));
    if (upg) showToast('cantafford_upg2', '💸 Мало ЛОК', 'Нужно ' + fmt(upg.cost) + ' ЛОК', 'bad', 2000);
  });

  $('#upgradeCount').text(boughtCount);
}

function renderAchievements() {
  const container = $('#achievementsList');
  let html = '';
  let earned = 0;

  for (const ach of ACHIEVEMENTS) {
    const done = !!state.achievements[ach.id];
    if (done) earned++;

    if (done) {
      html += `
        <div class="achieve-card earned">
          <span class="a-emoji">${ach.emoji}</span>
          <div class="a-name">${ach.name}</div>
          <div class="a-desc">${ach.desc}</div>
          <span class="a-earned-mark">⭐</span>
        </div>
      `;
    } else {
      html += `
        <div class="achieve-card locked">
          <span class="a-emoji">🔒</span>
          <div class="a-name">???</div>
          <div class="a-desc">Ещё не разблокировано</div>
        </div>
      `;
    }
  }

  container.html(html);
  $('#achieveCount').text(earned + '/' + ACHIEVEMENTS.length);
}

function updateOODisplay() {
  const oo = state.prestigePoints || 0;
  if (state.prestige > 0 || oo > 0) {
    $('#ooDisplay').show();
    $('#ooValue').text(oo);
  }
}

function updateTopBar() {
  const lps = getLocPerSecond();
  const lpc = getLocPerClick();

  $('#tbLoc').text(fmt(state.loc));
  $('#tbLps').text(fmt(lps));
  $('#tbTotal').text(fmt(state.totalLoc));
  $('#lpcDisplay').text(fmt(lpc));

  // Prestige display
  if (state.prestige > 0) {
    $('#prestigeInfo').show();
    $('#tbPrestige').text(state.prestige);
    $('#tbPrestigeMulti').text(state.prestigeMulti.toFixed(2));
    updateOODisplay();
  }

  // Prestige button — requirements scale with prestige count
  const req             = getPrestigeRequirements();
  const locThisRun      = state.locThisRun || 0;
  const buildingTypesBought = Object.keys(state.buildings).filter(k => (state.buildings[k]||0) > 0).length;
  const upgradesBought  = getUpgradeCount(state);
  const canPrestige     = locThisRun >= req.locThisRun
                       && buildingTypesBought >= req.buildingTypes
                       && upgradesBought >= req.upgrades;
  const showHint        = locThisRun >= req.locThisRun * 0.1 || canPrestige;

  if (canPrestige) {
    $('#prestigeBtn').show();
    $('#prestigeHint').hide();
  } else if (showHint) {
    $('#prestigeBtn').hide();
    const locLeft   = Math.max(0, req.locThisRun - locThisRun);
    const btLeft    = Math.max(0, req.buildingTypes - buildingTypesBought);
    const upgLeft   = Math.max(0, req.upgrades - upgradesBought);
    const parts     = [];
    if (locLeft > 0)  parts.push(`${fmt(locLeft)} ЛОК`);
    if (btLeft > 0)   parts.push(`${btLeft} тип${btLeft === 1 ? '' : 'а'} зданий`);
    if (upgLeft > 0)  parts.push(`${upgLeft} улучшен${upgLeft === 1 ? 'ие' : 'ий'}`);
    $('#prestigeHint').show().text(
      `До перезапуска ${state.prestige + 1}: ` + (parts.join(', ') || 'готово!')
    );
  } else {
    $('#prestigeBtn').hide();
    $('#prestigeHint').hide();
  }

  // Account level display
  const lvl   = getAccountLevel();
  const title = getAccountLevelTitle(lvl);
  $('#accountLevelBadge').text(`Ур. ${lvl} · ${title}`);

  // Mini stats
  $('#statClicks').text(fmt(state.totalClicks));
  $('#statEvents').text(state.eventCount);
  $('#statPrestige').text(state.prestige);
}

function renderAll() {
  renderBuildings();
  renderUpgrades();
  renderAchievements();
  renderProgressTab();
  renderActivitiesBar();
  updateTopBar();
}

// ================================================
// TABS
// ================================================

function initTabs() {
  $('#shopTabs').on('click', '.tab-btn', function() {
    const tabId = $(this).data('tab');
    $('.tab-btn').removeClass('active');
    $(this).addClass('active');
    $('.tab-content').hide();
    $('#tab-' + tabId).show();
    if (tabId === 'progress') renderProgressTab();
  });
}

// ================================================
// MAIN TICK LOOP
// ================================================

function gameTick() {
  const now     = Date.now();
  const elapsed = now - lastTickTime; // реальные мс с прошлого тика
  lastTickTime  = now;
  tickCount++;

  // Check pause
  if (tempState.paused && now < tempState.pauseUntil) {
    // Skip production
  } else {
    if (tempState.paused) tempState.paused = false;
    // Считаем по реальному прошедшему времени — работает и в фоне
    const lps    = getLocPerSecond();
    const gained = lps * (elapsed / 1000);
    state.loc         += gained;
    state.totalLoc    += gained;
    state.locThisRun   = (state.locThisRun || 0) + gained;
  }

  // Check event timer
  nextEventIn -= TICK_MS;
  if (nextEventIn <= 0) {
    triggerEvent();
    nextEventIn = randomEventDelay();
  }

  // Update event badge
  if (tickCount % 4 === 0) updateEventBadge();

  // Update displays every 5 ticks (4x/sec)
  if (tickCount % 5 === 0) {
    updateTopBar();
  }

  // Check achievements every 10 ticks
  if (tickCount % 10 === 0) {
    checkAchievements();
  }

  // Refresh shop affordability every 20 ticks (1x/sec)
  if (tickCount % 20 === 0) {
    renderBuildings();
    renderUpgrades();
  }

  // News ticker every ~8 seconds
  newsTimer += TICK_MS;
  if (newsTimer >= 8000) {
    newsTimer = 0;
    advanceTicker();
  }

  // Auto-save every SAVE_INTERVAL
  if (now - lastSaveTime >= SAVE_INTERVAL) {
    saveGame();
    lastSaveTime = now;
  }

  // Server save every SERVER_SAVE_INTERVAL
  if (now - lastServerSaveTime >= SERVER_SAVE_INTERVAL) {
    lastServerSaveTime = now;
    saveGameServer();
  }
}

// ================================================
// INIT
// ================================================

$(async function() {

  // Try to load from server first, fallback to localStorage
  let loaded = false;
  if (typeof IS_LOGGED_IN !== 'undefined' && IS_LOGGED_IN) {
    loaded = await loadGameServer();
    if (!loaded) loaded = loadGame();
  } else {
    loaded = loadGame();
  }

  // Init ticker
  $('#tickerText').text(shuffledNews[0]);

  // Render everything
  renderAll();
  updateOODisplay();

  // Bind click button
  $('#clickBtn').on('click', function(e) {
    handleClick(e);
    updateTopBar();
  });

  // Bind prestige button
  $('#prestigeBtn').on('click', doPrestige);

  // Init tabs
  initTabs();

  // Show greeting toast after a small delay
  setTimeout(() => {
    if (!loaded) {
      showToast('welcome', '👋 Добро пожаловать', 'Кликай на кнопку &lt;/&gt; чтобы писать код! Нанимай сотрудников для автоматической генерации ЛОК.', 'info', 7000);
    } else {
      showToast('welcome_back', '💻 С возвращением', 'Твоя команда скучала. Продолжаем писать код!', 'info', 4000);
    }
  }, 500);

  // Start game loop
  setInterval(gameTick, TICK_MS);

  // Mini-game reward integration — check on focus
  function checkMinigameReward() {
    const rewardStr = localStorage.getItem('minigame_reward');
    if (!rewardStr) return;
    try {
      const r = JSON.parse(rewardStr);
      // Only apply if reward is recent (within 10 minutes)
      if (Date.now() - (r.ts || 0) > 600000) {
        localStorage.removeItem('minigame_reward');
        return;
      }
      state.loc      += r.loc;
      state.totalLoc += r.loc;
      if (r.oo > 0) {
        state.prestigePoints      = (state.prestigePoints || 0) + r.oo;
        state.totalPrestigePoints = (state.totalPrestigePoints || 0) + r.oo;
        updateOODisplay();
      }
      // Dungeon clear tracking
      if (r.cleared) {
        state.dungeonClears = (state.dungeonClears || 0) + 1;
      }
      localStorage.removeItem('minigame_reward');
      updateTopBar();
      checkAchievements();
      saveGame();
      saveGameServer();
      const ooStr = r.oo > 0 ? ` и +${r.oo} ОО` : '';
      const sourceLabel = r.floorReached ? `🏰 Подземелье` : `🐛 Охота завершена`;
      const sourceDesc  = r.floorReached
        ? `Этаж ${r.floorReached}${r.cleared ? ' — ПОБЕДА!' : ''}! +${fmt(r.loc)} ЛОК${ooStr}`
        : `Поймал ${r.bugs} багов! +${fmt(r.loc)} ЛОК${ooStr}`;
      showToast('minigame', sourceLabel, sourceDesc, 'good', 5000);
    } catch(e) {
      localStorage.removeItem('minigame_reward');
    }
  }

  // Check on page load
  setTimeout(checkMinigameReward, 800);

  // Check when window gains focus
  window.addEventListener('focus', checkMinigameReward);

  // Page Visibility API — начисляем прогресс при возврате на вкладку
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      // Вкладка свёрнута — запоминаем момент
      hiddenAt = Date.now();
      saveGame(); // сохраняем перед уходом
    } else {
      // Вернулись — считаем сколько прошло
      checkMinigameReward();

      if (hiddenAt !== null) {
        const awayMs  = Date.now() - hiddenAt;
        const awaySec = awayMs / 1000;
        hiddenAt = null;

        // Сбрасываем lastTickTime чтобы следующий тик не посчитал двойное время
        lastTickTime = Date.now();

        // Extra offline hours from prestige shop
        const extraHours = getPrestigeShopEffect('offlineHours');
        const maxHours   = 8 + extraHours;

        // Начисляем заработанное
        const cappedSec = Math.min(awaySec, maxHours * 3600);
        const lps       = getLocPerSecond();
        const earned    = lps * cappedSec;

        if (earned > 0 && awaySec >= 5) {
          state.loc      += earned;
          state.totalLoc += earned;
          updateTopBar();
          checkAchievements();

          const timeStr = fmtTime(cappedSec);
          const locStr  = fmt(earned);
          showToast('away', '⏱️ Пока тебя не было',
            `Команда ${awaySec >= 60 ? 'не сидела сложа руки' : 'успела'}! За ${timeStr} написано <strong>+${locStr} ЛОК</strong>.`,
            'info', 6000);
        }
      }
    }
  });

  // Keyboard shortcut: Space = click
  $(document).on('keydown', function(e) {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      const btn = document.getElementById('clickBtn');
      const rect = btn.getBoundingClientRect();
      handleClick({ clientX: rect.left + rect.width/2, clientY: rect.top + rect.height/2 });
      updateTopBar();
    }
  });

  // Animate topbar loc on change
  let lastDisplayedLoc = 0;
  setInterval(() => {
    const cur = state.loc;
    if (Math.abs(cur - lastDisplayedLoc) > 0.5) {
      const el = document.getElementById('tbLoc');
      if (el) {
        el.textContent = fmt(cur);
        lastDisplayedLoc = cur;
      }
    }
  }, 100);

  // Save on tab/browser close
  window.addEventListener('beforeunload', () => {
    saveGame();
    if (typeof IS_LOGGED_IN !== 'undefined' && IS_LOGGED_IN) {
      // sendBeacon — не блокирует закрытие, но гарантирует доставку
      const saveData = buildSaveData();
      navigator.sendBeacon('ajax/save.php', new Blob(
        [JSON.stringify({ action: 'save', data: JSON.stringify(saveData) })],
        { type: 'application/json' }
      ));
    }
  });

});
