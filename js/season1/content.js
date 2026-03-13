export const STORAGE_KEY = 'season1_idle_phaser_v1';
export const STATE_VERSION = 1;
export const CYCLE_MS = 45000;
export const MAX_OFFLINE_CYCLES = 18;
export const WEEKDAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const WEEKDAY_LABELS = {
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье',
};
export const LIFE_MODES = [
    {
        id: 'survival',
        label: 'Выживание',
        shortLabel: 'Выживание',
        description: 'Держит быт в сборе и не даёт провалиться по деньгам.',
        bonus: 'Ровный income и меньше просадок.',
        risk: 'Проект движется медленно.',
    },
    {
        id: 'side_hustle',
        label: 'Подработка',
        shortLabel: 'Подработка',
        description: 'Аварийный режим, когда надо срочно закрыть бытовой минус.',
        bonus: 'Сильнее всего поднимает деньги.',
        risk: 'Растут стресс и усталость.',
    },
    {
        id: 'recovery',
        label: 'Восстановление',
        shortLabel: 'Восстановление',
        description: 'Режим починки себя после перегруза.',
        bonus: 'Возвращает энергию и сбивает стресс.',
        risk: 'Почти не двигает проект.',
    },
    {
        id: 'project_focus',
        label: 'Фокус на проект',
        shortLabel: 'Проект',
        description: 'Лучшая конфигурация для продакшена и прогресса идеи.',
        bonus: 'Сильнее давит в project throughput.',
        risk: 'Быстрее подводит к выгоранию.',
    },
    {
        id: 'people_focus',
        label: 'Фокус на людях',
        shortLabel: 'Люди',
        description: 'Режим сборки круга и readiness для meaningful контактов.',
        bonus: 'Растит bond и group pulse.',
        risk: 'Деньги и проект замедляются.',
    },
];
export const PROJECT_FOCUSES = [
    { id: 'clarify', label: 'Clarify', description: 'Проясняет форму, тон и идею проекта.' },
    { id: 'build', label: 'Build', description: 'Толкает прототип и сборку playable-среза.' },
    { id: 'polish', label: 'Polish', description: 'Поднимает качество и отзывчивость.' },
    { id: 'show', label: 'Show', description: 'Готовит проект к показу и разговорам наружу.' },
];
export const SLOT_OPTIONS = [
    { id: 'rest_slot', label: 'Восстановление', description: 'Возвращает энергию и снижает стресс.' },
    { id: 'project_slot', label: 'Работа над проектом', description: 'Толкает текущий project focus.' },
    { id: 'relationship_slot', label: 'Контакт с человеком', description: 'Качает readiness и bond.' },
    { id: 'room_slot', label: 'Комната и быт', description: 'Чинит порядок и recovery-модификаторы.' },
    { id: 'group_slot', label: 'Круг / посиделки', description: 'Растит group momentum и social warmth.' },
];
export const CHARACTERS = [
    {
        id: 'cash',
        name: 'Кэш',
        role: 'Домашний стабилизатор тона',
        unlockHint: 'Доступен с первого цикла.',
        modifierLabel: 'Смягчает тяжёлые дни и даёт micro-recovery.',
    },
    {
        id: 'max',
        name: 'Макс',
        role: 'Вытаскивает героя наружу',
        unlockHint: 'Всегда рядом, если держать social pulse.',
        modifierLabel: 'Усиливает social evenings и showability.',
    },
    {
        id: 'kostya',
        name: 'Костя',
        role: 'Стабилизирует круг',
        unlockHint: 'Открывается, когда bond с Максом и life stability уже держатся.',
        modifierLabel: 'Поднимает trust и group momentum.',
    },
    {
        id: 'zheka',
        name: 'Жека',
        role: 'Переводит хаос в production',
        unlockHint: 'Подключается, когда у проекта есть что показать.',
        modifierLabel: 'Даёт бонус к build/polish и снижает пустые project ticks.',
    },
];
export const ALERT_LABELS = {
    money_crunch: 'Денег осталось впритык',
    burnout_risk: 'Есть риск выгорания',
    room_decline: 'Комната ломает recovery',
};
export const POSITIVE_LABELS = {
    stable_routine: 'Цикл держится устойчиво',
    project_flow: 'Проект поймал поток',
};
