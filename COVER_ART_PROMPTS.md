# Промпты для обложек карточек услуг

Один готовый промпт на каждый из 42 «Типов результата» из [`PIVOT_SERVICE_CARDS.md`](PIVOT_SERVICE_CARDS.md)
(раздел 7). Каждый промпт — полный, ничего дописывать не нужно: сюжет и фирменный стиль уже объединены в
одну строку, копируйте как есть.

## Почему не «геймерский» стиль как у Playerok

Пользователь ориентировался на скриншот Playerok (аниме-девушка со звёздами, яркая игровая графика) —
это работает у них, потому что аудитория Playerok — геймеры. Наша аудитория — владельцы бизнеса, которые
покупают автоматизацию для компании. Прямое копирование игровой аниме-эстетики на карточке «AI-скоринг
лидов в amoCRM» будет читаться несерьёзно и подорвёт доверие B2B-покупателя. Ниже — стиль, который
держит тот же принцип (ярко, красочно, притягательно, единообразно) в аккуратной для бизнеса подаче:
современная флэт-иллюстрация, не корпоративный минимализм и не игровая мультипликация.

## Куда сохранять картинки и как называть файлы

**Папка:** `web/public/covers/`

**Имя файла:** ровно тот слаг, что указан у каждого промпта ниже, плюс расширение — например
`ai-agents-prodazhi-i-zayavki-prodayuschiy-ai-agent-dlya-sayt.png`. Слаг совпадает с адресом страницы
этого типа результата на сайте (`/services/{слаг}`) — он вычисляется кодом автоматически
(`web/src/data/mock-services.ts`, функция `slugify`), поэтому называть файл нужно **точно так, как
написано**, без своих сокращений — так я сразу пойму, к какой карточке какая картинка относится, и смогу
подключить её без путаницы.

Формат файла — PNG или JPG, без разницы. Расширение можно не указывать при сохранении, просто скажите
мне после того, как накидаете картинок в папку, и я подключу их сам.

## Как использовать

1. Генератор — любой (Midjourney, DALL·E, Stable Diffusion/Flux). Промпты на английском — так надёжнее
   работают все инструменты.
2. Формат — 4:3, в промпт уже включено (`--ar 4:3` — синтаксис Midjourney; для других инструментов эту
   часть можно опустить или заменить на их способ задать соотношение сторон).
3. Не обязательно генерировать все 42 сразу — начните с 5-6 самых заметных (у них ниже пометка
   **[продвигается]** — они первыми показываются на главной), посмотрите на консистентность стиля между
   собой, и только потом делайте остальные.
4. Проверка результата на глаз: по краям изображения должно оставаться свободное место — поверх обложки
   в интерфейсе накладываются бейджи (цена, срок, «Продвигается»), задний план не должен быть
   перегружен деталями в углах.

## Известная проблема: цвета направлений пересекаются (открыто, 2026-08-23)

Замечено при генерации 4-й группы: **AI-агенты** («vibrant blue to cyan»), **No-code оркестрация**
(«indigo to blue») и **Чат-боты** («sky blue to blue») — все три в синей гамме, на витрине рядом друг с
другом плохо различимы на глаз. Картинки уже сгенерированы и подключены (см. `cover-manifest.ts`), но
возможно понадобится переделать промпты для одного-двух из этих трёх направлений на более контрастный
цвет, когда все 42 будут готовы и станет видно всю сетку целиком — не бросать генерацию сейчас, но не
забыть свериться на глаз в конце.

## 42 промпта

### AI-агенты (vibrant blue to cyan gradient)

**Продающий AI-агент для сайта/Telegram** **[продвигается]**
Файл: `ai-agents-prodazhi-i-zayavki-prodayuschiy-ai-agent-dlya-sayt.png`
```
a friendly rounded robot character reaching out through a glowing chat bubble on a laptop screen, handshake gesture, sparkle accents. Style: modern flat vector illustration, bold simple rounded shapes, smooth vibrant blue to cyan gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**AI-агент квалификации лидов для CRM**
Файл: `ai-agents-prodazhi-i-zayavki-ai-agent-kvalifikacii-lidov-dly.png`
```
a robot character sorting glowing contact cards into a priority stack, an upward arrow above the top card. Style: modern flat vector illustration, bold simple rounded shapes, smooth vibrant blue to cyan gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**AI-агент поддержки 24/7 с эскалацией на человека**
Файл: `ai-agents-podderzhka-klientov-ai-agent-podderzhki-247-s-eska.png`
```
a robot character wearing a headset beside a glowing 24/7 clock icon, passing a chat bubble to a simple human silhouette. Style: modern flat vector illustration, bold simple rounded shapes, smooth vibrant blue to cyan gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Аудит существующего AI-агента с планом доработки**
Файл: `ai-agents-podderzhka-klientov-audit-suschestvuyuschego-ai-ag.png`
```
a robot character holding a magnifying glass over a glowing chat flowchart, a small checklist floating beside it. Style: modern flat vector illustration, bold simple rounded shapes, smooth vibrant blue to cyan gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**AI-агент для HR (первичный скрининг кандидатов)**
Файл: `ai-agents-hr-i-rekruting-ai-agent-dlya-hr-pervichnyy-skrinin.png`
```
a robot character reviewing a stack of floating resume cards, one card highlighted with a checkmark. Style: modern flat vector illustration, bold simple rounded shapes, smooth vibrant blue to cyan gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**AI-агент онбординга новых сотрудников**
Файл: `ai-agents-hr-i-rekruting-ai-agent-onbordinga-novyh-sotrudnik.png`
```
a robot character guiding a small human silhouette past floating glowing signposts, a welcoming gesture. Style: modern flat vector illustration, bold simple rounded shapes, smooth vibrant blue to cyan gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

### RAG / базы знаний (emerald green to teal gradient)

**База знаний с RAG-поиском по документам компании** **[продвигается]**
Файл: `rag-korporativnye-bazy-znaniy-baza-znaniy-s-rag-poiskom-po-d.png`
```
a glowing open book with a search beam scanning a stack of documents, connecting lines to a magnifying glass. Style: modern flat vector illustration, bold simple rounded shapes, smooth emerald green to teal gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Обновление и переиндексация существующей RAG-базы**
Файл: `rag-korporativnye-bazy-znaniy-obnovlenie-i-pereindeksaciya-s.png`
```
a glowing stack of documents being refreshed by a circular arrow, sparkle particles around it. Style: modern flat vector illustration, bold simple rounded shapes, smooth emerald green to teal gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Интеграция RAG в существующего бота поддержки**
Файл: `rag-rag-dlya-botov-podderzhki-integraciya-rag-v-suschestvuyu.png`
```
a chat bubble connected by glowing lines to an open book, a simple bot face inside the chat bubble. Style: modern flat vector illustration, bold simple rounded shapes, smooth emerald green to teal gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**RAG поверх базы FAQ и тикетов поддержки**
Файл: `rag-rag-dlya-botov-podderzhki-rag-poverh-bazy-faq-i-tiketov-.png`
```
a stack of ticket cards flowing into a glowing open book with a question mark above it. Style: modern flat vector illustration, bold simple rounded shapes, smooth emerald green to teal gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**RAG-консультант для юридической проверки договоров**
Файл: `rag-yuridicheskiy-ai-analiz-rag-konsultant-dlya-yuridichesko.png`
```
a glowing document with a magnifying glass highlighting one flagged line, a subtle scales-of-justice icon nearby. Style: modern flat vector illustration, bold simple rounded shapes, smooth emerald green to teal gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

### No-code оркестрация (indigo to blue gradient)

**Сценарий автоматизации под конкретную задачу**
Файл: `orchestration-avtomatizaciya-processov-scenariy-avtomatizaci.png`
```
interconnected glowing nodes forming a flowchart around a central gear, arrows flowing left to right. Style: modern flat vector illustration, bold simple rounded shapes, smooth indigo to blue gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Автоматизация приёма и обработки заявок между сервисами**
Файл: `orchestration-avtomatizaciya-processov-avtomatizaciya-priema.png`
```
a glowing inbox icon feeding into several connected app icons via flowing arrows. Style: modern flat vector illustration, bold simple rounded shapes, smooth indigo to blue gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Перенос workflow с Zapier на n8n (self-hosted)**
Файл: `orchestration-migraciya-mezhdu-platformami-perenos-workflow-.png`
```
two connected node-diagrams side by side, one fading out and one glowing brighter, an arrow between them. Style: modern flat vector illustration, bold simple rounded shapes, smooth indigo to blue gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Аудит и оптимизация существующих сценариев**
Файл: `orchestration-migraciya-mezhdu-platformami-audit-i-optimizac.png`
```
a flowchart diagram with a magnifying glass and a small wrench icon, one broken connection highlighted in a warning color. Style: modern flat vector illustration, bold simple rounded shapes, smooth indigo to blue gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Автоматизация отчётности в Google Sheets/таблицы**
Файл: `orchestration-otchetnost-i-tablicy-avtomatizaciya-otchetnost.png`
```
a glowing spreadsheet grid with a small robotic arm filling cells automatically, a few checkmark rows. Style: modern flat vector illustration, bold simple rounded shapes, smooth indigo to blue gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Ежемесячное сопровождение и доработка сценариев**
Файл: `orchestration-otchetnost-i-tablicy-ezhemesyachnoe-soprovozhd.png`
```
a flowchart diagram with a small gear and a repeating circular arrow, a subtle calendar icon nearby. Style: modern flat vector illustration, bold simple rounded shapes, smooth indigo to blue gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

### Чат-боты (sky blue to blue gradient)

**Telegram-бот с AI-консультантом и оплатой** **[продвигается]**
Файл: `chatbots-prodayuschie-boty-telegram-bot-s-ai-konsultantom-i-.png`
```
a speech bubble with a friendly bot face inside, a glowing payment card icon floating beside it. Style: modern flat vector illustration, bold simple rounded shapes, smooth sky blue to blue gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Аудит конверсии существующего бота**
Файл: `chatbots-prodayuschie-boty-audit-konversii-suschestvuyuscheg.png`
```
a chat bubble flowchart with one drop-off point highlighted in a warning color, a magnifying glass over it. Style: modern flat vector illustration, bold simple rounded shapes, smooth sky blue to blue gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Бот записи на услуги с напоминаниями**
Файл: `chatbots-zapis-i-bronirovanie-bot-zapisi-na-uslugi-s-napomin.png`
```
a speech bubble with a bot face next to a glowing calendar and a small bell icon. Style: modern flat vector illustration, bold simple rounded shapes, smooth sky blue to blue gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Перенос Telegram-бота на WhatsApp**
Файл: `chatbots-podderzhka-v-messendzherah-perenos-telegram-bota-na.png`
```
two speech bubbles connected by an arrow, one fading and one glowing brighter, a simple bot face inside. Style: modern flat vector illustration, bold simple rounded shapes, smooth sky blue to blue gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Бот поддержки клиентов с эскалацией на оператора**
Файл: `chatbots-podderzhka-v-messendzherah-bot-podderzhki-klientov-.png`
```
a speech bubble bot face handing off a small chat icon to a human silhouette wearing a headset. Style: modern flat vector illustration, bold simple rounded shapes, smooth sky blue to blue gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

### Голосовые AI-агенты (rose pink to orange gradient)

**Голосовой агент для приёма входящих заявок** **[продвигается]**
Файл: `voice-ai-priem-zvonkov-golosovoy-agent-dlya-priema-vhodyasch.png`
```
a glowing phone handset surrounded by soundwave rings, a headset icon beside it. Style: modern flat vector illustration, bold simple rounded shapes, smooth rose pink to orange gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Замена IVR-меню на голосового агента**
Файл: `voice-ai-priem-zvonkov-zamena-ivr-menyu-na-golosovogo-agenta.png`
```
a phone dial pad dissolving into glowing soundwave lines. Style: modern flat vector illustration, bold simple rounded shapes, smooth rose pink to orange gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Обзвон базы с AI-скриптом (подтверждение записи)**
Файл: `voice-ai-ishodyaschiy-obzvon-obzvon-bazy-s-ai-skriptom-podtv.png`
```
a glowing phone with outward soundwave rings connected to a small list of contact cards. Style: modern flat vector illustration, bold simple rounded shapes, smooth rose pink to orange gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Голосовой агент-ресепшн (переадресация по отделам)**
Файл: `voice-ai-ivr-i-resepshn-golosovoy-agent-resepshn-pereadresac.png`
```
a phone handset with soundwave rings branching into several small department icons. Style: modern flat vector illustration, bold simple rounded shapes, smooth rose pink to orange gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

### AI-видео и контент (fuchsia to pink gradient)

**Рекламный ролик с AI-аватаром**
Файл: `ai-video-reklamnye-roliki-reklamnyy-rolik-s-ai-avatarom.png`
```
a glowing film clapperboard with a simple friendly avatar face on a screen behind it, a play button nearby. Style: modern flat vector illustration, bold simple rounded shapes, smooth fuchsia to pink gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Пакет из 10 Shorts/Reels с AI-монтажом** **[продвигается]**
Файл: `ai-video-shortsreels-paket-iz-10-shortsreels-s-ai-montazhom.png`
```
a vertical phone screen with a play button, small stacked video thumbnail cards beside it. Style: modern flat vector illustration, bold simple rounded shapes, smooth fuchsia to pink gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Озвучка и локализация видео на 3 языка**
Файл: `ai-video-ozvuchka-i-lokalizaciya-ozvuchka-i-lokalizaciya-vid.png`
```
a soundwave icon with three small flag-shaped speech bubbles arranged around it. Style: modern flat vector illustration, bold simple rounded shapes, smooth fuchsia to pink gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Обучающее видео с AI-диктором из текста сценария**
Файл: `ai-video-obuchayuschee-video-obuchayuschee-video-s-ai-diktor.png`
```
a play button on a glowing screen with a simple avatar face and a subtitle line beneath it. Style: modern flat vector illustration, bold simple rounded shapes, smooth fuchsia to pink gradient background with soft ambient glow, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, subtle glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), vibrant saturated colors, soft drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

### AI над CRM / учётными системами (vivid amber-orange to golden-yellow gradient — переписано 2026-08-23, ярче)

**AI-скоринг лидов в amoCRM/Битрикс24** **[продвигается]**
Файл: `crm-ai-skoring-lidov-ai-skoring-lidov-v-amocrmbitriks24.png`
```
a stack of glowing contact cards with a ranking arrow and a star on the top card. Style: modern flat vector illustration, bold simple rounded shapes, highly saturated vivid amber-orange to golden-yellow gradient background, punchy poster-bright colors, strong vibrant contrast, glowing neon-bright accents, energetic and eye-catching, NOT muted, NOT pastel, NOT washed-out, NOT dull, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, bright glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), bold saturated colors, strong drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Автозаполнение карточек сделок из переписки**
Файл: `crm-ai-avtozapolnenie-dannyh-avtozapolnenie-kartochek-sdelok.png`
```
a chat bubble flowing into a glowing contact card, fields filling in automatically with sparkle accents. Style: modern flat vector illustration, bold simple rounded shapes, highly saturated vivid amber-orange to golden-yellow gradient background, punchy poster-bright colors, strong vibrant contrast, glowing neon-bright accents, energetic and eye-catching, NOT muted, NOT pastel, NOT washed-out, NOT dull, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, bright glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), bold saturated colors, strong drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Интеграция AI-суммаризации звонков в CRM**
Файл: `crm-ai-avtozapolnenie-dannyh-integraciya-ai-summarizacii-zvo.png`
```
a phone icon with a soundwave flowing into a glowing summary card with a few text lines. Style: modern flat vector illustration, bold simple rounded shapes, highly saturated vivid amber-orange to golden-yellow gradient background, punchy poster-bright colors, strong vibrant contrast, glowing neon-bright accents, energetic and eye-catching, NOT muted, NOT pastel, NOT washed-out, NOT dull, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, bright glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), bold saturated colors, strong drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**AI-напоминания менеджерам о просроченных задачах**
Файл: `crm-ai-napominaniya-i-uvedomleniya-ai-napominaniya-menedzher.png`
```
a glowing bell icon beside a small overdue task card and a clock. Style: modern flat vector illustration, bold simple rounded shapes, highly saturated vivid amber-orange to golden-yellow gradient background, punchy poster-bright colors, strong vibrant contrast, glowing neon-bright accents, energetic and eye-catching, NOT muted, NOT pastel, NOT washed-out, NOT dull, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, bright glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), bold saturated colors, strong drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

### Промпт-инжиниринг / файнтюнинг (vivid deep purple to electric magenta gradient — переписано 2026-08-23, ярче)

**Оптимизация промптов существующего AI-продукта**
Файл: `prompt-engineering-prompt-inzhiniring-optimizaciya-promptov-.png`
```
glowing text lines being refined by a small sparkle wand, a before/after arrow. Style: modern flat vector illustration, bold simple rounded shapes, highly saturated vivid deep purple to electric magenta gradient background, punchy poster-bright colors, strong vibrant contrast, glowing neon-bright accents, energetic and eye-catching, NOT muted, NOT pastel, NOT washed-out, NOT dull, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, bright glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), bold saturated colors, strong drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Файнтюнинг модели под узкую задачу** **[продвигается]**
Файл: `prompt-engineering-fayntyuning-fayntyuning-modeli-pod-uzkuyu.png`
```
a neural network node diagram glowing brighter, small sliders being adjusted beside it. Style: modern flat vector illustration, bold simple rounded shapes, highly saturated vivid deep purple to electric magenta gradient background, punchy poster-bright colors, strong vibrant contrast, glowing neon-bright accents, energetic and eye-catching, NOT muted, NOT pastel, NOT washed-out, NOT dull, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, bright glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), bold saturated colors, strong drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Сбор и разметка датасета для файнтюнинга**
Файл: `prompt-engineering-fayntyuning-sbor-i-razmetka-dataseta-dlya.png`
```
a stack of small data cards being tagged with glowing labels, a few checkmarks. Style: modern flat vector illustration, bold simple rounded shapes, highly saturated vivid deep purple to electric magenta gradient background, punchy poster-bright colors, strong vibrant contrast, glowing neon-bright accents, energetic and eye-catching, NOT muted, NOT pastel, NOT washed-out, NOT dull, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, bright glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), bold saturated colors, strong drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Снижение стоимости AI-продукта (переход на меньшую модель)**
Файл: `prompt-engineering-optimizaciya-rashodov-na-ai-snizhenie-sto.png`
```
a glowing coin icon shrinking with a downward arrow, next to a small neural network diagram. Style: modern flat vector illustration, bold simple rounded shapes, highly saturated vivid deep purple to electric magenta gradient background, punchy poster-bright colors, strong vibrant contrast, glowing neon-bright accents, energetic and eye-catching, NOT muted, NOT pastel, NOT washed-out, NOT dull, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, bright glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), bold saturated colors, strong drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

### AI-аналитика и отчётность (vivid teal to bright emerald-lime gradient — переписано 2026-08-23, ярче)

**Дашборд с AI-инсайтами по продажам** **[продвигается]**
Файл: `ai-analytics-ai-dashbordy-dashbord-s-ai-insaytami-po-prodazh.png`
```
a glowing bar chart dashboard with a sparkle highlighting one rising bar. Style: modern flat vector illustration, bold simple rounded shapes, highly saturated vivid teal to bright emerald-lime gradient background, punchy poster-bright colors, strong vibrant contrast, glowing neon-bright accents, energetic and eye-catching, NOT muted, NOT pastel, NOT washed-out, NOT dull, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, bright glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), bold saturated colors, strong drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**AI-отчёт «спроси на языке» поверх существующих таблиц**
Файл: `ai-analytics-otchety-na-estestvennom-yazyke-ai-otchet-sprosi.png`
```
a chat bubble with a question mark connected to a glowing bar chart. Style: modern flat vector illustration, bold simple rounded shapes, highly saturated vivid teal to bright emerald-lime gradient background, punchy poster-bright colors, strong vibrant contrast, glowing neon-bright accents, energetic and eye-catching, NOT muted, NOT pastel, NOT washed-out, NOT dull, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, bright glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), bold saturated colors, strong drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Автоматический еженедельный AI-отчёт руководителю**
Файл: `ai-analytics-otchety-na-estestvennom-yazyke-avtomaticheskiy-.png`
```
a glowing calendar icon with a document sliding out of it, a checkmark nearby. Style: modern flat vector illustration, bold simple rounded shapes, highly saturated vivid teal to bright emerald-lime gradient background, punchy poster-bright colors, strong vibrant contrast, glowing neon-bright accents, energetic and eye-catching, NOT muted, NOT pastel, NOT washed-out, NOT dull, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, bright glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), bold saturated colors, strong drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

**Поиск аномалий в данных с AI-алертами**
Файл: `ai-analytics-monitoring-i-alerty-poisk-anomaliy-v-dannyh-s-a.png`
```
a glowing line chart with one spike highlighted in a warning color, a small bell alert icon. Style: modern flat vector illustration, bold simple rounded shapes, highly saturated vivid teal to bright emerald-lime gradient background, punchy poster-bright colors, strong vibrant contrast, glowing neon-bright accents, energetic and eye-catching, NOT muted, NOT pastel, NOT washed-out, NOT dull, minimal clean composition, generous empty margin on all sides for UI overlay text, single clear central subject, bright glowing particle accents, no text, no letters, no logos, no watermarks, no photorealistic rendering, simple friendly silhouettes only (no detailed human faces), bold saturated colors, strong drop shadow, consistent icon-style illustration for a tech marketplace brand, square-ish composition. --ar 4:3 --style raw
```

