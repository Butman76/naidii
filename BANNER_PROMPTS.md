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

### 1. AI-агенты (v6 — без человека, робот можно)
Файл: `banner-ai-agents.png`

Правка 2026-08-24: убрали человека в кадре (та же причина, что у
оркестрации/чат-ботов/остальных — обрезка лица на баннере всегда
лотерея). Робот в кадре остаётся — это не человек, его можно.
```
An extremely wide panoramic advertising banner for an AI business automation service, cinematic wide composition — about twice to two and a half times wider than it is tall, like a horizontal banner strip, not a normal photo. No people in the frame. A glowing friendly robot-like AI orb floats in a softly lit modern office environment — soft rounded shape made of light, simple friendly face, no screens, no panels, no readable content anywhere on it. Abstract glowing particles, soft light streaks, and simple icon-only shapes (a plain checkmark, a plain upward arrow) float around the robot purely as glowing symbols with no accompanying words or labels of any kind. Dynamic composition, dramatic lighting with lens flare, glossy modern tech-corporate photography style. Color grading: vivid saturated blue to cyan gradient lighting throughout the scene. Keep the robot compact within the middle horizontal band of the frame, with open window light or soft blurred bokeh filling the space above and below it — compose it as an already-wide banner strip, not a square or portrait photo. Absolutely no text, no letters, no words, no numbers, no chat bubbles, no UI mockups, no screens with content, no logos, no watermarks, no people, no human figures. Ultra vibrant, punchy, premium advertising quality, photorealistic, highly detailed.
```

### 2. RAG / базы знаний (v6 — без человека, робот можно)
Файл: `banner-rag.png`

Та же правка — человека убрали, маленький робот-орб, который сам
«читает» подсвеченную панель, остаётся вместо него.
```
An extremely wide panoramic advertising banner for an AI knowledge-search service, cinematic wide composition — about twice to two and a half times wider than it is tall, like a horizontal banner strip, not a normal photo. No people in the frame. A small glowing friendly robot-like AI orb floats beside a glowing abstract stack of holographic panel shapes hovering in the air — plain glowing rectangular shapes with soft blank light lines suggesting a document silhouette, no readable content on them, one panel glows brighter with a beam of light pinpointing it like a search highlight, as if the robot just found it. Abstract glowing particles and light streaks float around the scene with no accompanying words or labels of any kind. Dynamic composition, dramatic lighting with lens flare, glossy modern tech-corporate photography style. Color grading: vivid saturated emerald green to teal gradient lighting throughout the scene. Keep the robot and the glowing panels compact within the middle horizontal band of the frame, with open space or soft blurred bokeh filling the area above and below — compose it as an already-wide banner strip, not a square or portrait photo. Absolutely no text, no letters, no words, no numbers, no chat bubbles, no UI mockups, no screens with content, no logos, no watermarks, no people, no human figures. Ultra vibrant, punchy, premium advertising quality, photorealistic, highly detailed.
```

### 3. No-code оркестрация (v4 — без человека)
Файл: `banner-orchestration.png`

Правка 2026-08-23: убрали человека из кадра совсем — по предложению
пользователя, раз обрезка лица всё равно каждый раз лотерея. Без человека
эта проблема просто не может возникнуть.
```
An extremely wide panoramic advertising banner for a no-code business process automation service, cinematic wide composition — about twice to two and a half times wider than it is tall, like a horizontal banner strip, not a normal photo. No people in the frame. A glowing web of abstract connected orbs floats in a softly lit modern office environment — simple glowing circles linked by flowing light-stream lines, like an abstract network diagram, no icons, no logos, no readable content on any node. A few soft light particles travel along the connecting streams from orb to orb, suggesting automatic data flow between them. Dynamic composition, dramatic lighting with lens flare, glossy modern tech-corporate photography style. Color grading: vivid saturated indigo to blue gradient lighting throughout the scene. Keep the glowing network compact within the middle horizontal band of the frame, with open window light or soft blurred bokeh filling the space above and below it — compose it as an already-wide banner strip, not a square or portrait photo. Absolutely no text, no letters, no words, no numbers, no chat bubbles, no UI mockups, no screens with content, no app logos, no watermarks, no people, no human figures. Ultra vibrant, punchy, premium advertising quality, photorealistic, highly detailed.
```

### 4. Чат-боты / мессенджеры (v5 — без человека, без самолётика)
Файл: `banner-chatbots.png`

Правка 2026-08-23: в v4 бумажный самолётик как символ отправки сообщения
не понравился ("какой-то дурацкий"). Заменили на светящийся силуэт
смартфона с «пульсом» уведомления — расходящиеся кольца света, как будто
только что пришло сообщение — без буквальных иконок-самолётиков и без
чат-пузырей.
```
An extremely wide panoramic advertising banner for an AI chatbot and messenger automation service, cinematic wide composition — about twice to two and a half times wider than it is tall, like a horizontal banner strip, not a normal photo. No people in the frame. A glowing abstract smartphone silhouette floats in a softly lit modern office environment, its screen a smooth blank glow with no content on it, softly pulsing rings of light expanding outward from it like a notification pulse. Soft glowing particles drift around it. Dynamic composition, dramatic lighting with lens flare, glossy modern tech-corporate photography style. Color grading: vivid saturated sky blue to deep blue gradient lighting throughout the scene. Keep the glowing phone and pulse rings compact within the middle horizontal band of the frame, with open window light or soft blurred bokeh filling the space above and below — compose it as an already-wide banner strip, not a square or portrait photo. Absolutely no text, no letters, no words, no numbers, no chat bubbles, no speech bubbles, no paper airplane icon, no UI mockups, no screens with content, no app logos, no watermarks, no people, no human figures. Ultra vibrant, punchy, premium advertising quality, photorealistic, highly detailed.
```

Пропорция всё ещё зависит от пресета в интерфейсе генератора, а не от
текста промпта — см. раздел «Размер и ориентация» выше, шаг с ручной
докадровкой до ~3:1 остаётся актуальным (просто без шага «держать лицо
по центру» — тут держать по центру нужно саму светящуюся сцену).

### 5. Голосовые агенты
Файл: `banner-voice-ai.png`

Без человека, по той же схеме, что оркестрация и чат-боты. Цвет — тот же
rose pink → orange, что и на обложках карточек этого направления в
`COVER_ART_PROMPTS.md`.
```
An extremely wide panoramic advertising banner for an AI voice agent and phone call automation service, cinematic wide composition — about twice to two and a half times wider than it is tall, like a horizontal banner strip, not a normal photo. No people in the frame. A glowing abstract phone handset silhouette floats in a softly lit modern office environment, surrounded by concentric glowing soundwave rings radiating outward from it, as if it is actively speaking. Soft glowing particles drift around it. Dynamic composition, dramatic lighting with lens flare, glossy modern tech-corporate photography style. Color grading: vivid saturated rose pink to orange gradient lighting throughout the scene. Keep the glowing handset and soundwave rings compact within the middle horizontal band of the frame, with open window light or soft blurred bokeh filling the space above and below — compose it as an already-wide banner strip, not a square or portrait photo. Absolutely no text, no letters, no words, no numbers, no chat bubbles, no speech bubbles, no UI mockups, no screens with content, no app logos, no watermarks, no people, no human figures. Ultra vibrant, punchy, premium advertising quality, photorealistic, highly detailed.
```

### 6. AI-видео и контент
Файл: `banner-ai-video.png`

Без человека, та же схема. Цвет — fuchsia → pink, тот же, что и на
обложках карточек этого направления в `COVER_ART_PROMPTS.md`.
```
An extremely wide panoramic advertising banner for an AI video generation and content creation service, cinematic wide composition — about twice to two and a half times wider than it is tall, like a horizontal banner strip, not a normal photo. No people in the frame. A glowing abstract film frame / clapperboard-like shape hovers in a softly lit modern office environment, with a ribbon of glowing film-strip light trailing and curving away from it like motion, softly pulsing. Soft glowing particles drift around it. Dynamic composition, dramatic lighting with lens flare, glossy modern tech-corporate photography style. Color grading: vivid saturated fuchsia to pink gradient lighting throughout the scene. Keep the glowing shape and light ribbon compact within the middle horizontal band of the frame, with open window light or soft blurred bokeh filling the space above and below — compose it as an already-wide banner strip, not a square or portrait photo. Absolutely no text, no letters, no words, no numbers, no chat bubbles, no speech bubbles, no UI mockups, no screens with content, no app logos, no watermarks, no people, no human figures. Ultra vibrant, punchy, premium advertising quality, photorealistic, highly detailed.
```

### 7. CRM + AI
Файл: `banner-crm-ai.png`

Без человека, та же схема. Цвет — amber-orange → golden-yellow, тот же,
что и на обложках карточек этого направления в `COVER_ART_PROMPTS.md`.
```
An extremely wide panoramic advertising banner for an AI-powered CRM and sales automation service, cinematic wide composition — about twice to two and a half times wider than it is tall, like a horizontal banner strip, not a normal photo. No people in the frame. A glowing abstract stack of card-like shapes hovers in a softly lit modern office environment, simple glowing rounded rectangles slightly fanned out like deal cards, one card glowing brighter than the rest as if just prioritized, soft light connecting lines linking the cards. Soft glowing particles drift around it. Dynamic composition, dramatic lighting with lens flare, glossy modern tech-corporate photography style. Color grading: vivid saturated amber-orange to golden-yellow gradient lighting throughout the scene. Keep the glowing cards compact within the middle horizontal band of the frame, with open window light or soft blurred bokeh filling the space above and below — compose it as an already-wide banner strip, not a square or portrait photo. Absolutely no text, no letters, no words, no numbers, no chat bubbles, no speech bubbles, no UI mockups, no screens with content, no app logos, no watermarks, no people, no human figures. Ultra vibrant, punchy, premium advertising quality, photorealistic, highly detailed.
```

### 8. Промпт-инжиниринг
Файл: `banner-prompt-engineering.png`

Без человека, та же схема. Цвет — deep purple → electric magenta, тот
же, что и на обложках карточек этого направления. Правка 2026-08-24:
сокращено до 480 символов (ограничение генератора на длину промпта) —
поэтому короче предыдущих, но смысл и все запреты сохранены.
```
Ultra-wide ad banner (2.5:1) for AI prompt-engineering and fine-tuning. No people. A glowing abstract equalizer of vertical light sliders floats in a softly lit office, one slider glowing brighter. Soft particles, lens flare, glossy tech style. Color: deep purple to electric magenta gradient. Centered in the middle band, blurred bokeh above/below. No text, letters, logos, UI screens, chat bubbles, watermarks, people. Photorealistic, vibrant, premium.
```

### 9. AI-аналитика (v2 — другая концепция)
Файл: `banner-ai-analytics.png`

Правка 2026-08-24: первая версия (столбики графика) вышла слишком
похожей на промпт-инжиниринг (тоже вертикальные светящиеся полоски,
просто другого цвета) — сменили силуэт на диагональную растущую линию
тренда с узлами-точками, чтобы формы явно отличались. Цвет — тот же
teal → emerald-lime. Тоже уложено в 480 символов.
```
Ultra-wide ad banner (2.5:1) for an AI analytics service. No people. A glowing line rises diagonally like an upward trend arrow, linking a few pulsing data-point nodes, brightest at the top. Soft particles, lens flare, glossy tech style. Color: teal to bright emerald-lime gradient. Centered in the middle band, blurred bokeh above/below. No text, letters, logos, UI screens, chat bubbles, watermarks, people. Photorealistic, vibrant, premium.
```

**Вариант v2b — мультяшный (2026-08-24, пробуем ради интереса):** та же
концепция (диагональная линия тренда с узлами), но не фотореалистичный
glossy-стиль, а плоская мультяшная векторная иллюстрация — если понравится
больше, можно в этом же стиле пересобрать и остальные 8. Тоже 480 символов.
```
Ultra-wide banner (2.5:1) in flat cartoon vector style for an AI analytics service. No people. A bold cheerful diagonal trend line rises across the frame, linking a few round glowing dot nodes, biggest dot brightest at the top. Bright flat shapes, soft cel-shading, bouncy energy. Color: teal to bright emerald-lime gradient background. Centered in the middle band. No text, letters, logos, UI screens, chat bubbles, watermarks, people. Vibrant, playful, premium.
```

Все 9 направлений теперь имеют промпт. Дальше — только ждём картинки и
подключаем через `banner-manifest.ts`, тем же способом, что и раньше.

Отдельно на будущее: AI-агенты, No-code оркестрация и Чат-боты у нас все
трое в сине-голубой гамме (как и на обложках карточек услуг — та же
проблема уже отмечена в `COVER_ART_PROMPTS.md`). На баннерах это может
быть заметнее, т.к. они крупнее и мелькают в одной карусели подряд — если
после генерации все три будут визуально сливаться, возможно, стоит сменить
оттенок оркестрации или чат-ботов на что-то более контрастное, отступив от
точного совпадения с обложками карточек.
