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

## Размер и ориентация (правка 2026-08-23 — первая попытка вышла недостаточно
широкой)

Первые пробные генерации в двух разных инструментах дали обычный
прямоугольник (~3:2 / 16:9) — этого мало, баннер на сайте гораздо более
вытянутый, **шире и ниже** (ориентир — примерно втрое шире, чем выше,
как полоса, а не как обычное фото). В промптах ниже это учтено словами
"cinematic ultra-wide", но модели не всегда честно держат пропорцию —
если инструмент выдаёт максимум 3:2 или 16:9 несмотря на промпт:

1. Сначала попробуйте выбрать самую широкую из доступных пресетов
   ориентации (обычно называется "widescreen" / "16:9" / "landscape") —
   не 1:1 и не портретную.
2. Если инструмент всё равно не даёт растянуть шире — обрежьте картинку
   сверху и снизу сами перед сохранением (в любом редакторе, хоть в
   Paint) до пропорции примерно 3:1. В промпте главная сцена уже
   специально держится в центре по вертикали с запасом пустого
   пространства сверху/снизу — обрезка не должна задеть лицо/главный
   объект.

Финальный файл может быть любого разрешения — сайт сам подгонит под
блок на странице (`object-cover`), важна именно **пропорция**, а не
конкретные пиксели.

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

## Куда ведут баннеры

Каждый слайд кликабелен и ведёт на `/category/{слаг}` — то есть на страницу
направления. Текст на самой картинке не нужен — заголовок и подзаголовок
рендерятся сайтом поверх картинки (см. `hero-banners.ts`), картинка — только
фон/сцена.

## Промпты

Оба промта ниже переписаны (2026-08-23, v2) после первой пробной генерации:
убраны «чат-пузыри» и «UI-панели с сообщениями» — именно из-за таких
формулировок генератор сам дорисовывал слова в них, хотя промпт прямо
просил без текста. Теперь вместо этого — только абстрактные светящиеся
формы без намёка на текст, и требование «no text» повторено несколько
раз разными словами.

### 1. AI-агенты
Файл: `banner-ai-agents.png`
```
An extremely wide panoramic advertising banner for an AI business automation service, cinematic ultra-wide composition — about three times wider than it is tall, like a horizontal banner strip, not a normal photo. A confident business professional stands in a modern bright office, smiling, looking toward a glowing friendly robot-like AI orb floating beside them — soft rounded shape made of light, simple friendly face, no screens, no panels, no readable content anywhere on it. Abstract glowing particles, soft light streaks, and simple icon-only shapes (a plain checkmark, a plain upward arrow) float around the robot purely as glowing symbols with no accompanying words or labels of any kind. Dynamic composition, dramatic professional lighting with lens flare, glossy modern tech-corporate photography style. Color grading: vivid saturated blue to cyan gradient lighting throughout the scene. Keep the subject and the robot compact within the middle horizontal band of the frame, with open window light or soft blurred bokeh filling the space above and below them — compose it as an already-wide banner strip, not a square or portrait photo. Absolutely no text, no letters, no words, no numbers, no chat bubbles, no UI mockups, no screens with content, no logos, no watermarks. Ultra vibrant, punchy, premium advertising quality, photorealistic, highly detailed.
```

### 2. RAG / базы знаний
Файл: `banner-rag.png`
```
An extremely wide panoramic advertising banner for an AI knowledge-search service, cinematic ultra-wide composition — about three times wider than it is tall, like a horizontal banner strip, not a normal photo. A confident professional in a modern office reaches toward a glowing abstract stack of holographic panel shapes hovering in the air in front of them — plain glowing rectangular shapes with soft blank light lines suggesting a document silhouette, no readable content on them, one panel glows brighter with a beam of light pinpointing it like a search highlight. Abstract glowing particles and light streaks float around the scene with no accompanying words or labels of any kind. Dynamic composition, dramatic professional lighting with lens flare, glossy modern tech-corporate photography style. Color grading: vivid saturated emerald green to teal gradient lighting throughout the scene. Keep the subject and the glowing panels compact within the middle horizontal band of the frame, with open space or soft blurred bokeh filling the area above and below — compose it as an already-wide banner strip, not a square or portrait photo. Absolutely no text, no letters, no words, no numbers, no chat bubbles, no UI mockups, no screens with content, no logos, no watermarks. Ultra vibrant, punchy, premium advertising quality, photorealistic, highly detailed.
```

## Остальные 7 направлений

Сделаем следующим шагом, тем же способом — по паре этих двух посмотрим,
насколько стиль ложится на карусель (яркость, читаемость текста поверх
картинки, обрезка сверху/снизу), и если нужно — подправим формулировку
стиля перед тем как писать оставшиеся промпты.
