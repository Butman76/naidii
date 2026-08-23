# Промпты для рекламных баннеров карусели на главной

Карусель на главной (`HeroCarousel.tsx`) — по образцу карусели Playerok:
широкий рекламный слайд на каждое направление, автопролистывание,
стрелки и точки-индикаторы. Пока баннеры не сгенерированы — слайд
показывает градиент направления + иконку вместо картинки (`banner-manifest.ts`).

Это отдельный набор от [`COVER_ART_PROMPTS.md`](COVER_ART_PROMPTS.md) — там
маленькие иконки-иллюстрации для карточек услуг в спокойном флэт-стиле, здесь
— большие рекламные баннеры, ярче и с людьми/сценами, под другой размер.

## Куда сохранять и как называть файлы

**Папка:** `web/public/banners/`

**Имя файла:** `banner-{слаг направления}.png` — например `banner-ai-agents.png`,
`banner-rag.png`. Слаги направлений — из `web/src/data/categories.ts`
(`ai-agents`, `rag`, `orchestration`, `chatbots`, `voice-ai`, `ai-video`,
`crm-ai`, `prompt-engineering`, `ai-analytics`).

## Размер и ориентация (правка 2026-08-23 v3 — по итогам 4 попыток)

**Текст промпта не задаёт точный размер картинки.** Соотношение сторон в
большинстве генераторов (в т.ч. в ChatGPT) выбирается кнопкой/пресетом в
интерфейсе ("Квадрат" / "Портрет" / "Альбом" и т.п.), а не словами в
промте — слова вроде "cinematic ultra-wide 3:1" для модели это просьба к
композиции, а не жёсткая настройка холста. Это подтвердилось на практике:
из 4 сгенерированных баннеров с очень похожим текстом промпта получилось
4 разных соотношения — 3:1, 1.79:1, 1.49:1, и снова 3:1. Дальше строить
план на "если правильно попросить словами — получится нужный размер" не
стоит.

**Что реально работает — 2 шага, оба обязательные:**

1. В интерфейсе генератора (не в тексте промпта!) выбрать самый широкий
   из доступных пресетов размера/ориентации — обычно называется
   "Landscape" / "Widescreen" / "16:9" / альбомная. Не квадрат, не
   портрет.
2. **После генерации — обрезать самостоятельно** в любом редакторе (даже
   Paint/Preview подойдёт) до пропорции **примерно 3:1** (в три раза шире,
   чем выше — как у уже готовых баннеров AI-агентов и RAG, они получились
   такими и на сайте выглядят хорошо). При обрезке — **лицо/голову
   человека держите строго по центру кадра по вертикали**, не в верхней и
   не в нижней трети: на сайте применяется обрезка по центру (`object-
   cover`, без смещения вверх/вниз — пробовали сдвигать к верху, но это
   ломало кадры, где генератор сам поставил человека ниже), так что
   именно ваша ручная обрезка — единственное, что гарантированно убережёт
   лицо от обрезки на самом сайте.

Шаг 2 — не «на всякий случай», а по умолчанию для каждого баннера, даже
если генератор вроде бы выдал что-то похожее на альбомную ориентацию.

## Стиль

В отличие от промптов для карточек услуг (там — сдержанная плоская
иконка-иллюстрация), здесь нужна **яркая, рекламная, глянцевая** картинка —
как настоящий промо-баннер сервиса, можно с человеком в кадре. Единый стиль
между баннерами: energetic composition, dramatic lighting with lens flare,
glossy modern tech-corporate photography mixed with abstract glowing light
shapes (не «UI-панели» и не «чат-пузыри с сообщениями» — такие
формулировки заставляют генератор дорисовывать текст внутри них, см. ниже),
punchy saturated color grading по цвету направления (тот же оттенок, что
уже используется на обложках карточек этого направления — для AI-агентов
синий/бирюзовый, для RAG изумрудный/тил и т.д.).

**Внешность человека в кадре (правка 2026-08-23):** явно указывайте
европейскую внешность (`a business professional of European appearance`) —
без этого уточнения генератор может выдать любую этничность на своё
усмотрение, что и произошло на первой версии баннера чат-ботов. Во все
промпты ниже уточнение уже добавлено.

## Куда ведут баннеры

Каждый слайд кликабелен и ведёт на `/category/{слаг}` — то есть на страницу
направления. Текст на самой картинке не нужен — заголовок и подзаголовок
рендерятся сайтом поверх картинки (см. `hero-banners.ts`), картинка — только
фон/сцена.

## Промпты

Промпты ниже — v3 (2026-08-23): целевая пропорция снижена с 3:1 до
2–2.5:1 (сайт теперь одинаково хорошо это обрежет на любом экране, см.
раздел про размер выше), и явно указана европейская внешность человека в
кадре. Более ранняя правка (v2) убрала «чат-пузыри»/«UI-панели с
сообщениями» — из-за таких формулировок генератор сам дорисовывал слова в
них, хотя промпт прямо просил без текста; вместо этого — только
абстрактные светящиеся формы без намёка на текст, и требование «no text»
повторено несколько раз разными словами.

**AI-агенты и RAG уже сгенерированы (v2, 3:1) и подключены** — переделывать
не обязательно, просто на будущее промпты ниже приведены к единому v3 на
случай, если решите перегенерировать. **Оркестрацию и особенно чат-ботов
(там European appearance ещё не было) имеет смысл перегенерировать.**

### 1. AI-агенты
Файл: `banner-ai-agents.png`
```
An extremely wide panoramic advertising banner for an AI business automation service, cinematic wide composition — about twice to two and a half times wider than it is tall, like a horizontal banner strip, not a normal photo. A confident business professional of European appearance stands in a modern bright office, smiling, looking toward a glowing friendly robot-like AI orb floating beside them — soft rounded shape made of light, simple friendly face, no screens, no panels, no readable content anywhere on it. Abstract glowing particles, soft light streaks, and simple icon-only shapes (a plain checkmark, a plain upward arrow) float around the robot purely as glowing symbols with no accompanying words or labels of any kind. Dynamic composition, dramatic professional lighting with lens flare, glossy modern tech-corporate photography style. Color grading: vivid saturated blue to cyan gradient lighting throughout the scene. Keep the subject and the robot compact within the middle horizontal band of the frame, with open window light or soft blurred bokeh filling the space above and below them — compose it as an already-wide banner strip, not a square or portrait photo. Absolutely no text, no letters, no words, no numbers, no chat bubbles, no UI mockups, no screens with content, no logos, no watermarks. Ultra vibrant, punchy, premium advertising quality, photorealistic, highly detailed.
```

### 2. RAG / базы знаний
Файл: `banner-rag.png`
```
An extremely wide panoramic advertising banner for an AI knowledge-search service, cinematic wide composition — about twice to two and a half times wider than it is tall, like a horizontal banner strip, not a normal photo. A confident professional of European appearance in a modern office reaches toward a glowing abstract stack of holographic panel shapes hovering in the air in front of them — plain glowing rectangular shapes with soft blank light lines suggesting a document silhouette, no readable content on them, one panel glows brighter with a beam of light pinpointing it like a search highlight. Abstract glowing particles and light streaks float around the scene with no accompanying words or labels of any kind. Dynamic composition, dramatic professional lighting with lens flare, glossy modern tech-corporate photography style. Color grading: vivid saturated emerald green to teal gradient lighting throughout the scene. Keep the subject and the glowing panels compact within the middle horizontal band of the frame, with open space or soft blurred bokeh filling the area above and below — compose it as an already-wide banner strip, not a square or portrait photo. Absolutely no text, no letters, no words, no numbers, no chat bubbles, no UI mockups, no screens with content, no logos, no watermarks. Ultra vibrant, punchy, premium advertising quality, photorealistic, highly detailed.
```

### 3. No-code оркестрация
Файл: `banner-orchestration.png`
```
An extremely wide panoramic advertising banner for a no-code business process automation service, cinematic wide composition — about twice to two and a half times wider than it is tall, like a horizontal banner strip, not a normal photo. A confident business professional of European appearance stands in a modern bright office, smiling, looking at a glowing web of abstract connected orbs floating beside them — simple glowing circles linked by flowing light-stream lines, like an abstract network diagram, no icons, no logos, no readable content on any node. A single soft light particle travels along one connecting stream from one orb to another, suggesting automatic data flow between them. Dynamic composition, dramatic professional lighting with lens flare, glossy modern tech-corporate photography style. Color grading: vivid saturated indigo to blue gradient lighting throughout the scene. Keep the subject and the glowing network compact within the middle horizontal band of the frame, with open window light or soft blurred bokeh filling the space above and below them — compose it as an already-wide banner strip, not a square or portrait photo. Absolutely no text, no letters, no words, no numbers, no chat bubbles, no UI mockups, no screens with content, no app logos, no watermarks. Ultra vibrant, punchy, premium advertising quality, photorealistic, highly detailed.
```

### 4. Чат-боты / мессенджеры
Файл: `banner-chatbots.png`
```
An extremely wide panoramic advertising banner for an AI chatbot and messenger automation service, cinematic wide composition — about twice to two and a half times wider than it is tall, like a horizontal banner strip, not a normal photo. A confident professional of European appearance smiles while holding a smartphone, looking toward a glowing abstract paper-plane-shaped light trail swooping past them, representing an instant message being sent, with soft glowing particles trailing behind it. A simple smooth rounded glowing shape floats nearby suggesting a friendly presence, completely blank and abstract with no text, symbols, or icons on it. Dynamic composition, dramatic professional lighting with lens flare, glossy modern tech-corporate photography style. Color grading: vivid saturated sky blue to deep blue gradient lighting throughout the scene. Keep the subject and the glowing shapes compact within the middle horizontal band of the frame, with open window light or soft blurred bokeh filling the space above and below them — compose it as an already-wide banner strip, not a square or portrait photo. Absolutely no text, no letters, no words, no numbers, no readable chat bubbles or speech bubbles with content, no UI mockups, no screens with content, no app logos, no watermarks. Ultra vibrant, punchy, premium advertising quality, photorealistic, highly detailed.
```

## Остальные 5 направлений

Сделаем следующим шагом, тем же способом — посмотрим, насколько стиль
ложится на карусель (яркость, читаемость текста поверх картинки, обрезка
сверху/снизу), и если нужно — подправим формулировку стиля перед тем как
писать оставшиеся промпты.

Отдельно на будущее: AI-агенты, No-code оркестрация и Чат-боты у нас все
трое в сине-голубой гамме (как и на обложках карточек услуг — та же
проблема уже отмечена в `COVER_ART_PROMPTS.md`). На баннерах это может
быть заметнее, т.к. они крупнее и мелькают в одной карусели подряд — если
после генерации все три будут визуально сливаться, возможно, стоит сменить
оттенок оркестрации или чат-ботов на что-то более контрастное, отступив от
точного совпадения с обложками карточек.
