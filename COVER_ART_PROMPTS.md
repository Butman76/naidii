# Промпты для обложек карточек услуг

Один промпт на каждый из 42 «Типов результата» из [`PIVOT_SERVICE_CARDS.md`](PIVOT_SERVICE_CARDS.md)
(раздел 7). Цель — заменить текущую CSS-заглушку (градиент направления + эмодзи-иконка,
`web/src/data/category-style.ts` + `ResultTypePlate.tsx`) на настоящие иллюстрации, но в едином фирменном
стиле, без обращения к дизайнеру на каждую позицию.

## Почему не «геймерский» стиль как у Playerok

Пользователь ориентировался на скриншот Playerok (аниме-девушка со звёздами, яркая игровая графика) —
это работает у них, потому что аудитория Playerok — геймеры. Наша аудитория — владельцы бизнеса, которые
покупают автоматизацию для компании. Прямое копирование игровой аниме-эстетики на карточке «AI-скоринг
лидов в amoCRM» будет читаться несерьёзно и подорвёт доверие B2B-покупателя. Ниже — стиль, который
держит тот же принцип (ярко, красочно, притягательно, единообразно) в аккуратной для бизнеса подаче:
современная флэт-иллюстрация, не корпоративный минимализм и не игровая мультипликация.

## Как использовать

1. Генератор: любой (Midjourney, DALL·E, Stable Diffusion/Flux). Промпты написаны по-английски — так
   современные генераторы понимают точнее, независимо от инструмента.
2. К **каждому** промпту из раздела «42 промпта» ниже нужно **добавить в конец** блок «Единый стиль» —
   он один и тот же для всех, задаёт узнаваемость бренда. Палитра ([PALETTE]) берётся из таблицы по
   направлению.
3. Формат: 4:3 (совпадает с `aspect-[4/3]` обложки карточки в коде). Для Midjourney — дописать `--ar 4:3`.
4. Проверка результата на глаз: за пределами центрального сюжета должно оставаться свободное место по
   краям — поверх обложки в интерфейсе накладываются бейджи (цена, срок, «Продвигается»), задний план не
   должен быть перегружен деталями в углах.
5. Готовые файлы — заливать в поле `preview_images` карточки услуги (уже есть в схеме, миграция
   `pocketbase/pb_migrations/1755000016_service_cards_pivot.js`), либо как временная мера — в
   `web/public/covers/{slug-типа-результата}.png` и подключить как заглушку в `ResultTypePlate.tsx` до
   переноса на бэкенд.
6. Не обязательно генерировать все 42 сразу — начать разумно с 5-6 самых заметных (те, что сейчас с
   `promoted: true` в `web/src/data/mock-services.ts`, они первыми показываются на главной), посмотреть на
   консистентность стиля между собой, и только потом делать остальные.

## Единый стиль (добавлять в конец каждого промпта)

```
Style: modern flat vector illustration, bold simple rounded shapes, smooth [PALETTE] gradient
background with soft ambient glow, minimal clean composition, generous empty margin on all sides
for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no
letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only
(no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style
illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

## Палитра по направлениям ([PALETTE] в блоке выше)

Совпадает с `web/src/data/category-style.ts`, чтобы сгенерированная обложка не спорила по цвету с
остальным интерфейсом карточки (метка направления, текст).

| Направление | [PALETTE] |
|---|---|
| AI-агенты | vibrant blue to cyan gradient |
| RAG / базы знаний | emerald green to teal gradient |
| No-code оркестрация | indigo to blue gradient |
| Чат-боты | sky blue to blue gradient |
| Голосовые AI-агенты | rose pink to orange gradient |
| AI-видео и контент | fuchsia to pink gradient |
| AI над CRM | amber to yellow gradient |
| Промпт-инжиниринг | purple to violet gradient |
| AI-аналитика | teal to emerald gradient |

## 42 промпта

Формат: **Название типа результата** — `сюжетная часть промпта` (дописать блок «Единый стиль» с нужной
палитрой из таблицы выше).

### AI-агенты (vibrant blue to cyan gradient)

- **Продающий AI-агент для сайта/Telegram** — `a friendly rounded robot character reaching out through a glowing chat bubble on a laptop screen, handshake gesture, sparkle accents`
- **AI-агент квалификации лидов для CRM** — `a robot character sorting glowing contact cards into a priority stack, an upward arrow above the top card`
- **AI-агент поддержки 24/7 с эскалацией на человека** — `a robot character wearing a headset beside a glowing 24/7 clock icon, passing a chat bubble to a simple human silhouette`
- **Аудит существующего AI-агента с планом доработки** — `a robot character holding a magnifying glass over a glowing chat flowchart, a small checklist floating beside it`
- **AI-агент для HR (скрининг кандидатов)** — `a robot character reviewing a stack of floating resume cards, one card highlighted with a checkmark`
- **AI-агент онбординга новых сотрудников** — `a robot character guiding a small human silhouette past floating glowing signposts, a welcoming gesture`

### RAG / базы знаний (emerald green to teal gradient)

- **База знаний с RAG-поиском по документам компании** — `a glowing open book with a search beam scanning a stack of documents, connecting lines to a magnifying glass`
- **Обновление и переиндексация существующей RAG-базы** — `a glowing stack of documents being refreshed by a circular arrow, sparkle particles around it`
- **Интеграция RAG в существующего бота поддержки** — `a chat bubble connected by glowing lines to an open book, a simple bot face inside the chat bubble`
- **RAG поверх базы FAQ и тикетов поддержки** — `a stack of ticket cards flowing into a glowing open book with a question mark above it`
- **RAG-консультант для юридической проверки договоров** — `a glowing document with a magnifying glass highlighting one flagged line, a subtle scales-of-justice icon nearby`

### No-code оркестрация (indigo to blue gradient)

- **Сценарий автоматизации под конкретную задачу** — `interconnected glowing nodes forming a flowchart around a central gear, arrows flowing left to right`
- **Автоматизация приёма и обработки заявок между сервисами** — `a glowing inbox icon feeding into several connected app icons via flowing arrows`
- **Перенос workflow с Zapier на n8n (self-hosted)** — `two connected node-diagrams side by side, one fading out and one glowing brighter, an arrow between them`
- **Аудит и оптимизация существующих сценариев** — `a flowchart diagram with a magnifying glass and a small wrench icon, one broken connection highlighted in a warning color`
- **Автоматизация отчётности в Google Sheets/таблицы** — `a glowing spreadsheet grid with a small robotic arm filling cells automatically, a few checkmark rows`
- **Ежемесячное сопровождение и доработка сценариев** — `a flowchart diagram with a small gear and a repeating circular arrow, a subtle calendar icon nearby`

### Чат-боты (sky blue to blue gradient)

- **Telegram-бот с AI-консультантом и оплатой** — `a speech bubble with a friendly bot face inside, a glowing payment card icon floating beside it`
- **Аудит конверсии существующего бота** — `a chat bubble flowchart with one drop-off point highlighted in a warning color, a magnifying glass over it`
- **Бот записи на услуги с напоминаниями** — `a speech bubble with a bot face next to a glowing calendar and a small bell icon`
- **Перенос Telegram-бота на WhatsApp** — `two speech bubbles connected by an arrow, one fading and one glowing brighter, a simple bot face inside`
- **Бот поддержки клиентов с эскалацией на оператора** — `a speech bubble bot face handing off a small chat icon to a human silhouette wearing a headset`

### Голосовые AI-агенты (rose pink to orange gradient)

- **Голосовой агент для приёма входящих заявок** — `a glowing phone handset surrounded by soundwave rings, a headset icon beside it`
- **Замена IVR-меню на голосового агента** — `a phone dial pad dissolving into glowing soundwave lines`
- **Обзвон базы с AI-скриптом (подтверждение записи)** — `a glowing phone with outward soundwave rings connected to a small list of contact cards`
- **Голосовой агент-ресепшн (переадресация по отделам)** — `a phone handset with soundwave rings branching into several small department icons`

### AI-видео и контент (fuchsia to pink gradient)

- **Рекламный ролик с AI-аватаром** — `a glowing film clapperboard with a simple friendly avatar face on a screen behind it, a play button nearby`
- **Пакет из 10 Shorts/Reels с AI-монтажом** — `a vertical phone screen with a play button, small stacked video thumbnail cards beside it`
- **Озвучка и локализация видео на 3 языка** — `a soundwave icon with three small flag-shaped speech bubbles arranged around it`
- **Обучающее видео с AI-диктором из текста сценария** — `a play button on a glowing screen with a simple avatar face and a subtitle line beneath it`

### AI над CRM / учётными системами (amber to yellow gradient)

- **AI-скоринг лидов в amoCRM/Битрикс24** — `a stack of glowing contact cards with a ranking arrow and a star on the top card`
- **Автозаполнение карточек сделок из переписки** — `a chat bubble flowing into a glowing contact card, fields filling in automatically with sparkle accents`
- **Интеграция AI-суммаризации звонков в CRM** — `a phone icon with a soundwave flowing into a glowing summary card with a few text lines`
- **AI-напоминания менеджерам о просроченных задачах** — `a glowing bell icon beside a small overdue task card and a clock`

### Промпт-инжиниринг / файнтюнинг (purple to violet gradient)

- **Оптимизация промптов существующего AI-продукта** — `glowing text lines being refined by a small sparkle wand, a before/after arrow`
- **Файнтюнинг модели под узкую задачу** — `a neural network node diagram glowing brighter, small sliders being adjusted beside it`
- **Сбор и разметка датасета для файнтюнинга** — `a stack of small data cards being tagged with glowing labels, a few checkmarks`
- **Снижение стоимости AI-продукта (переход на меньшую модель)** — `a glowing coin icon shrinking with a downward arrow, next to a small neural network diagram`

### AI-аналитика и отчётность (teal to emerald gradient)

- **Дашборд с AI-инсайтами по продажам** — `a glowing bar chart dashboard with a sparkle highlighting one rising bar`
- **AI-отчёт «спроси на языке» поверх существующих таблиц** — `a chat bubble with a question mark connected to a glowing bar chart`
- **Автоматический еженедельный AI-отчёт руководителю** — `a glowing calendar icon with a document sliding out of it, a checkmark nearby`
- **Поиск аномалий в данных с AI-алертами** — `a glowing line chart with one spike highlighted in a warning color, a small bell alert icon`
