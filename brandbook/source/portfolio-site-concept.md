# Концепция portfolio-site DimkoFF

## Роль сайта

Не электронное резюме и не каталог всех услуг. Сайт — маршрутизатор доверия: за 30–60 секунд объясняет категорию, показывает доказательство и переводит человека в релевантный путь.

## Главная гипотеза

> Посетитель должен увидеть, что сам сайт уже является доказательством связки SMM, продукта и creative development.

При этом базовое содержание доступно без WebGL, длинного intro и обязательного звука.

## Information architecture

- `/` — универсальный brand/portfolio home.
- `/clients` — задачи, пакеты, процесс, кейсы, CTA.
- `/employers` — роли, матрица навыков, live cases, availability.
- `/cases/caloriept-ai`.
- `/cases/stylist-ai`.
- `/bots` — DimkoFF AI Bot Portfolio с тремя компактными real-project cards.
- `/lab` — concept / experiments / 3D.
- `/about` — путь, принципы, контакты.
- `/contact` — короткий brief с выбором `project / role / collaboration`.

## Главная страница

### 1. Hero

**Eyebrow:** `SMM × AI × PRODUCT`.

**H1:** «Упаковываю, продвигаю и запускаю онлайн-продукты под ключ».

**Подзаголовок:** «От позиционирования, контента и Telegram-воронки до Mini App, AI-бота, сайта и деплоя».

**CTA:** «Мне нужен запуск» / «Ищу специалиста в команду».

**Visual:** интерактивная signal map. Курсор/палец активирует путь `content → funnel → product → result`; WebGL enhancement, но статичная SVG/canvas версия остаётся полноценной.

### 2. Proof strip

`Live products / Telegram-first / SMM system / Production deploy` плюс только подтверждённые числа.

### 3. What I do

Пять outcome cards: `Упаковать / Привлечь / Конвертировать / Автоматизировать / Запустить`. Навыки раскрываются внутри, не наоборот.

### 4. Selected cases

CaloriePT AI и Stylist AI. Карточка: контекст, роль, 3 решения, статус `Live`, короткое видео. Третий слот — SMM concept case с маркировкой `Concept`.

### 5. AI Bot Portfolio

Отдельная горизонтальная линейка из трёх компактных карточек. Она не конкурирует с подробными case studies и не смешивается с Demo Lab.

| Карточка | Короткое описание | Ниша | Что доказывает | CTA |
|---|---|---|---|---|
| Psy Mind AI | Telegram AI-продукт для диалога и self-reflection | psychology / self-reflection | адаптация продукта и коммуникации к чувствительному контексту | [Открыть бота](https://t.me/psy_mind_rf_bot) |
| Businessmen AI | Telegram AI-ментор в контексте бизнес-образования | business education / AI mentor | перевод экспертной идеи в понятный образовательный продукт | [Открыть бота](https://t.me/businessmen_ai_bot) |
| Pulse AI Coach | Telegram AI-продукт для коучингового взаимодействия и поддержания ритма | coaching / habits / performance | проектирование регулярного сценария и возвращаемости | [Открыть бота](https://t.me/PulseAICoach_bot) |

На карточке обязательны: статус, роль DimkoFF, один проверяемый артефакт и кнопка перехода. Метрики и подробные функции добавляются только после подтверждения.

### 6. SMM system

Интерактивная схема `SIGNAL → SYSTEM → PRODUCT`. По клику — артефакт: competitor map, content matrix, funnel flow.

### 7. Product system

CJM → prototype → build → QA → launch → learn. Показать fallback и error state как признак зрелости.

### 8. Routes

Две панели: `Для клиентов` и `Для работодателей`, каждая с собственным результатом и CTA.

### 9. Demo Lab

Пять экспериментальных работ, статус, роль и технологии. Не смешивать с коммерческими кейсами.

### 10. Principles

Коротко: смысл раньше инструмента; prototype before scale; честные статусы; данные без vanity; motion with purpose.

### 11. Contact

Выбор типа запроса, 4 поля, Telegram alternative. После отправки — ожидание ответа и что подготовить.

## Client route

1. Hero с outcome.
2. Pain recognition.
3. Full-system diagram.
4. Пакеты Signal / Launch / Product / Full System.
5. Кейсы по бизнес-задачам.
6. Процесс и boundaries.
7. FAQ.
8. Brief CTA.

## Employer route

1. Hero с adaptable role title.
2. `What I bring in 90 days`.
3. Skills × evidence matrix.
4. Два больших live cases.
5. AI Bot Portfolio как доказательство широты ниш и переносимости метода.
6. One concept marketing case.
7. Collaboration principles.
8. Stack (secondary).
9. Availability + CV/GitHub/contact.

## Страница `/bots`

1. Короткое объяснение: DimkoFF превращает SMM-идею в Telegram AI-продукт под конкретную нишу.
2. Три real-project cards: Psy Mind AI, Businessmen AI, Pulse AI Coach.
3. Для каждой карточки: аудитория, продуктовая задача, SMM-вход, роль DimkoFF, подтверждённые артефакты, публичная ссылка.
4. Схема общего метода: `insight → positioning → content → Telegram flow → AI logic → retention`.
5. Переходы к двум главным case studies — CaloriePT AI и Stylist AI.
6. CTA: «Обсудить AI-продукт для моей ниши».

## Case template

1. Hero: outcome, status, role, timeline.
2. Problem and constraints.
3. Audience / JTBD.
4. Key insight.
5. Journey before/after.
6. Solution and why.
7. SMM/content layer.
8. Product/technical layer.
9. Edge cases and reliability.
10. Results/evidence.
11. Reflection and next iteration.
12. Related case + CTA.

## UX principles

- H1 и CTA доступны в первом viewport на 375 px.
- Навигация содержит не более 5 верхнеуровневых пунктов.
- WebGL загружается после primary content; предусмотрены static fallback и quality toggle.
- `prefers-reduced-motion` отключает параллакс, camera drift и kinetic type.
- Case video: muted, captions, poster image, play by user on mobile.
- Фокус, контраст и размеры touch target соответствуют WCAG 2.2 AA.
- Контакт не требует регистрации.

## Motion narrative

- **Hero:** линия собирает хаотичные точки в работающий маршрут — метафора системности.
- **Cases:** переход раскрывает слой `message / journey / technology`, а не просто увеличивает картинку.
- **Metrics:** числа появляются вместе с источником/контекстом.
- **CTA:** спокойный magnetic hover только на pointer devices.

## SEO и контент

- Главная тема: `SMM + AI Product Builder`.
- Кластеры: Telegram Mini Apps, AI-боты для бизнеса, Telegram-воронки, SMM-система, запуск digital-продукта.
- Для кейсов — уникальные title/description, Open Graph image, structured data `Person`, `CreativeWork`, `SoftwareApplication` только где корректно.
- RU-first; английская версия после стабилизации основной истории, не машинный сырой перевод.

## Аналитика

События: route choice, case open, video play, lab open, CTA start, brief submit, external contact click. Не собирать лишние персональные данные. Dashboard разделяет клиента и работодателя по выбранному пути, а не по скрытому профилированию.

## MVP → V2

### MVP

Статический быстрый сайт, 2 routes, 2 case pages, contact, лёгкий GSAP/CSS motion, analytics.

### V2

Demo Lab, WebGL hero, CMS/MDX cases, RU/EN, downloadable targeted decks.

### V3

Interactive brief, personalised route, case filters, experiment archive. Персонализация — только по явному выбору пользователя.

## Рекомендуемый стек

Next.js/Astro или Vite по текущей инфраструктуре; TypeScript; CSS tokens; GSAP/Framer Motion; Three.js как lazy enhancement; MDX для кейсов; privacy-friendly analytics; Vercel/Cloudflare/GitHub Pages в зависимости от SSR и forms.
