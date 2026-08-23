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

## Размер и ориентация (правка 2026-08-23 v2)

Первая пара баннеров (AI-агенты, RAG) вышла 2172×724 (ровно 3:1, как
просили). Вторая пара (оркестрация, чат-боты) вышла у́же — 1664×928
(1.79:1), несмотря на тот же текст промпта. На сайте блок карусели раньше
подстраивал высоту под ширину экрана и на широких мониторах становился
шире 3:1 — из-за этого на менее широком исходнике (1.79:1) `object-cover`
обрезал верх кадра целиком вместе с головой человека. **Это было починено
на стороне сайта** (`HeroCarousel.tsx` теперь держит жёсткое соотношение
2:1 на любом экране, а не «плавает»), поэтому дальше не обязательно
гнаться именно за 3:1 — **ориентир теперь 2:1–2.5:1** (в 2–2.5 раза шире,
чем выше), этого достаточно и такое соотношение генераторы держат
охотнее. Промпты ниже обновлены под эту цифру.

1. Выбирайте самую широкую из доступных пресетов ориентации (обычно
   называется "widescreen" / "16:9" / "landscape") — не 1:1 и не
   портретную.
2. Если инструмент всё равно даёт что-то совсем не то (квадрат,
   портрет) — обрежьте картинку сверху и снизу сами перед сохранением
   до пропорции примерно 2:1. В промпте главная сцена уже специально
   держится в центре по вертикали с запасом пустого пространства
   сверху/снизу — обрезка не должна задеть лицо/главный объект.

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
