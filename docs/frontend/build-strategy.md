# Frontend Build Strategy

## Решение

На текущем этапе build step не вводим.

Проект уже получил безопасную модульность без bundler:

- `idle`-ядро разложено на `idle-runtime`, `idle-economy`, `idle-save`, `idle-render`, `idle-data`, `idle-actions`
- PHP-страницы отдают статические CSS и JS напрямую
- CDN-зависимости ограничены и понятны
- для локальной разработки не нужен `npm install`, dev server и отдельный asset pipeline

Для текущего масштаба это дешевле и надёжнее, чем ранний переход на Vite/Webpack/Parcel.

## Почему build step пока не нужен

- нет современного SPA-frontend, который требует module graph bundling
- нет TypeScript, JSX, PostCSS, tree-shaking или code splitting как обязательных требований
- JS уже можно сопровождать через отдельные файлы без монолитного `idle.js`
- CSS уже получил общий token-layer без preprocessors
- проект остаётся проще для локального запуска, CI и прод-выкладки

## Текущий рабочий подход

- PHP остаётся серверным entrypoint-слоем
- JS подключается явной последовательностью через `<script src=...>`
- данные баланса лежат отдельно в `data/game/idle-balance.js`
- lint и тестовый baseline уже работают без frontend toolchain

## Минусы отказа от сборки сейчас

- нет import/export модулей браузерного уровня
- нет автоматического dependency graph и bundling
- нет минификации и оптимизации ассетов в production pipeline
- shared frontend contracts пока поддерживаются дисциплиной файлов, а не tooling enforcement

Эти минусы пока приемлемы относительно стоимости внедрения полноценного toolchain.

## Триггеры для перехода на сборку

Build step нужно вводить, если выполнится хотя бы часть условий:

1. Появится 2+ крупных frontend entrypoint'а с общими модулями и частыми регрессиями из-за порядка подключения скриптов.
2. Появится TypeScript или необходимость в stricter static analysis на фронтенде.
3. Понадобятся импорт SVG, шрифтов, ассет-хеширование, production minification и cache-busting как обязательная норма.
4. Появится live frontend layer сложнее текущего jQuery/vanilla стека: reactive UI, component framework, client router.
5. Ручное управление зависимостями через глобалы `window.*` начнёт замедлять изменения и увеличивать баги.

## Рекомендуемый следующий шаг вместо сборки

Пока вместо bundler полезнее делать следующее:

- удерживать data/actions/runtime/render/save слои разделёнными
- постепенно уменьшать использование глобального `window` compatibility bridge
- при необходимости ввести `docs/frontend/module-contracts.md` с описанием доступных frontend API
- вынести общий `css/base.css`, если дублирование reset/body/nav/button primitive-слоёв продолжит расти

## Если позже вводить сборку

Предпочтительный кандидат: `Vite`.

Почему именно он:

- низкая цена входа
- быстрый dev server
- простой production build
- нормальная работа с vanilla JS и CSS без немедленного перехода на framework

Но это следующий этап, а не текущая необходимость.
