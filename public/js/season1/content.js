export const STORAGE_KEY = 's1_tycoon_v1';
export const STATE_VERSION = 1;
export const TICK_MS = 5000;
export const MAX_OFFLINE_DAYS = 20;
export const DAILY_COST = 240;
export const GENRE_DATA = {
    arcade: { label: 'Аркада', icon: '🕹️', codingW: 0.65, designW: 0.35 },
    rpg: { label: 'РПГ', icon: '⚔️', codingW: 0.50, designW: 0.50 },
    puzzle: { label: 'Головоломка', icon: '🧩', codingW: 0.45, designW: 0.55 },
    sim: { label: 'Симулятор', icon: '🏗️', codingW: 0.60, designW: 0.40 },
    platformer: { label: 'Платформер', icon: '🦘', codingW: 0.55, designW: 0.45 },
    visual_novel: { label: 'Визуальная новелла', icon: '📖', codingW: 0.20, designW: 0.80 },
};
export const PLATFORM_DATA = {
    mobile: { label: 'Мобайл', icon: '📱', earningsM: 1.2, fansM: 1.5 },
    pc: { label: 'ПК', icon: '💻', earningsM: 1.0, fansM: 1.0 },
    web: { label: 'Браузер', icon: '🌐', earningsM: 0.7, fansM: 0.8 },
};
export const SIZE_DATA = {
    jam: { label: 'Jam-проект', days: 4, baseEarnings: 700, baseFans: 30 },
    small: { label: 'Малый', days: 8, baseEarnings: 2200, baseFans: 100 },
    medium: { label: 'Средний', days: 16, baseEarnings: 6500, baseFans: 280 },
};
export const ACTIVITY_DATA = {
    work: { label: 'Работать', icon: '💻', hint: 'Прогресс проекта' },
    study_code: { label: 'Учить код', icon: '📚', hint: '+Coding' },
    study_design: { label: 'Учить дизайн', icon: '🎨', hint: '+Design' },
    rest: { label: 'Отдыхать', icon: '😴', hint: '+Endurance' },
    socialize: { label: 'Тусоваться', icon: '🍕', hint: '+Bond с персонажем' },
};
export const CHARACTER_DATA = {
    max: { name: 'Макс', role: 'Дизайнер-фрилансер', bonus: '+Design на проектах', unlockDesc: 'Реп 15' },
    zheka: { name: 'Жека', role: 'QA / Фидбек', bonus: '+0.5 к рейтингу релиза', unlockDesc: '3 проекта' },
    zhora: { name: 'Жора', role: 'Хайп-менеджер', bonus: '+30% фанатов с релиза', unlockDesc: '100 фанатов' },
};
const PREFIXES = ['Очередной', 'Легендарный', 'Засекреченный', 'Дерзкий', 'Скромный', 'Амбициозный', 'Эпичный', 'Наспех сделанный', 'Многообещающий'];
const GENRE_NOUNS = {
    arcade: ['Флапи-клон', 'Эндлесс-раннер', 'Спейс-инвейдер', 'Брейк-аут', 'Додж-игра'],
    rpg: ['Данжн-кроулер', 'JRPG', 'Тактика', 'Hack\'n\'Slash', 'Рогалик'],
    puzzle: ['Пазл', 'Матч-3', 'Логическая игра', 'Лабиринт', '2048-клон'],
    sim: ['Тайкун', 'Симулятор фермы', 'Городской билдер', 'Бизнес-тайкун', 'Симулятор кофейни'],
    platformer: ['Платформер', 'Пиксельный прыгун', 'Метроидвания', 'Паркур-игра', 'Мини-марио'],
    visual_novel: ['Визуальная новелла', 'Дейтинг-сим', 'Интерактивная история', 'Текстовый квест'],
};
export function generateProjectName(genre) {
    const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const nouns = GENRE_NOUNS[genre];
    return `${prefix} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
}
export function getReviewQuote(rating) {
    if (rating >= 9.0)
        return pick(['Это шедевр. Один человек, одна комната, и вот этот результат.', 'Вы серьёзно сделали это в одиночку?', 'Лучший инди-релиз года. Точка.']);
    if (rating >= 7.5)
        return pick(['Крепко. Чувствуется вложенная работа.', 'Не без шероховатостей, но с душой.', 'Приятный сюрприз от маленькой студии.', 'Видно: разработчик знает что делает.']);
    if (rating >= 5.5)
        return pick(['Ну, работает. Чего-то не хватает, но сыграть можно.', 'Типичный инди. Ни плохо, ни хорошо.', '«Играбельно» — лучший комплимент.', 'Очередной клон, но честный.']);
    if (rating >= 3.5)
        return pick(['Разработчик явно старался. Просто получилось не очень.', 'Потенциал виден. Реализация подкачала.', 'Это существует. Уже кое-что.', 'Хм. Следующий будет лучше, наверное.']);
    return pick(['Это было сделано? Это было выпущено? Ну окей.', 'Разработчику нужен отдых. И курсы.', 'Первый блин. Что тут скажешь.']);
}
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
