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

## Размер и ориентация

Генератор — ChatGPT (GPT-image). В интерфейсе выберите **альбомную
(landscape)** ориентацию — обычно это исходник 1536×1024 (соотношение 3:2).
На сайте баннер шире и ниже (соотношение примерно 2:1) — картинка обрежется
сверху и снизу автоматически при показе (`object-cover`), подгонять размер
вручную не нужно. Просто держите главную сцену и текстовый фокус ближе к
центру по вертикали — верхние ~12% и нижние ~12% кадра могут не попасть в
финальный баннер.

## Стиль

В отличие от промптов для карточек услуг (там — сдержанная плоская
иконка-иллюстрация), здесь нужна **яркая, рекламная, глянцевая** картинка —
как настоящий промо-баннер сервиса, можно с человеком в кадре. Единый стиль
между баннерами: energetic composition, dramatic lighting with lens flare,
glossy modern tech-corporate photography mixed with glowing digital UI
elements, punchy saturated color grading по цвету направления (тот же
оттенок, что уже используется на обложках карточек этого направления —
для AI-агентов синий/бирюзовый, для RAG изумрудный/тил и т.д.).

## Куда ведут баннеры

Каждый слайд кликабелен и ведёт на `/category/{слаг}` — то есть на страницу
направления. Текст на самой картинке не нужен — заголовок и подзаголовок
рендерятся сайтом поверх картинки (см. `hero-banners.ts`), картинка — только
фон/сцена.

## Промпты

### 1. AI-агенты
Файл: `banner-ai-agents.png`
```
A vibrant, high-energy advertising banner for an AI business automation service. A confident young business professional stands in a modern bright office, smiling while looking at a glowing holographic AI assistant hovering beside them — a friendly rounded robot-like avatar made of soft light, with small floating UI panels showing incoming chat messages, checkmarks, and a rising graph automatically resolving themselves. Dynamic diagonal composition, dramatic professional lighting with lens flare, glossy modern tech-corporate photography style mixed with glowing digital UI elements. Color grading: vivid saturated blue to cyan gradient lighting throughout the scene. Wide landscape banner composition, keep the main subject and focal action centered in the middle of the frame vertically (top and bottom edges may be cropped for a wide banner format). No visible text, no logos, no watermarks. Ultra vibrant, punchy, premium advertising quality, photorealistic mixed with glowing UI graphics, highly detailed.
```

### 2. RAG / базы знаний
Файл: `banner-rag.png`
```
A vibrant, high-energy advertising banner for an AI knowledge-search service. A confident professional in a modern office reaches toward a glowing holographic stack of documents hovering in the air in front of them — one document instantly slides forward and lights up, a beam of light pinpointing the exact highlighted paragraph like a smart search effect. Dynamic diagonal composition, dramatic professional lighting with lens flare, glossy modern tech-corporate photography style mixed with glowing digital UI elements. Color grading: vivid saturated emerald green to teal gradient lighting throughout the scene. Wide landscape banner composition, keep the main subject and focal action centered in the middle of the frame vertically (top and bottom edges may be cropped for a wide banner format). No visible text, no logos, no watermarks. Ultra vibrant, punchy, premium advertising quality, photorealistic mixed with glowing UI graphics, highly detailed.
```

## Остальные 7 направлений

Сделаем следующим шагом, тем же способом — по паре этих двух посмотрим,
насколько стиль ложится на карусель (яркость, читаемость текста поверх
картинки, обрезка сверху/снизу), и если нужно — подправим формулировку
стиля перед тем как писать оставшиеся промпты.
