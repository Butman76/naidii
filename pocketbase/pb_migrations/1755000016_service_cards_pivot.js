/// <reference path="../pb_data/types.d.ts" />

// Пивот на карточки услуг как главный объект каталога — см.
// PIVOT_SERVICE_CARDS.md в корне репозитория для полного контекста.
// Ниша не меняется (те же категории), меняется структура карточки: она
// должна быть самодостаточной для решения о заказе, без обязательного
// перехода в профиль специалиста.
migrate((app) => {
  const categories = app.findCollectionByNameOrId("categories")
  const services = app.findCollectionByNameOrId("services")

  // --- services: поля из раздела 2 правки ТЗ (структура карточки услуги) ---
  services.fields.add(new Field({
    name: "category_id",
    type: "relation",
    // Пока необязательное — у существующих (моковых) карточек его нет, и
    // специалист может создать черновик до выбора направления. Сделать
    // required, когда форма создания карточки заставит выбрать категорию
    // на первом шаге.
    required: false,
    collectionId: categories.id,
    cascadeDelete: false,
    maxSelect: 1,
  }))
  services.fields.add(new Field({ name: "tagline", type: "text", max: 150 }))
  services.fields.add(new Field({
    name: "tags",
    type: "select",
    values: ["urgent", "online", "guaranteed", "has_examples", "verified", "top"],
    maxSelect: 6,
  }))
  services.fields.add(new Field({
    // "до 10 фото", "до 60 секунд видео", "до 5 страниц" и т.п. — см.
    // раздел 2 правки ТЗ. Свободный текст, а не число: единицы измерения
    // разные для каждого направления.
    name: "scope_label",
    type: "text",
    max: 100,
  }))
  services.fields.add(new Field({
    name: "revisions_included",
    type: "number",
    min: 0,
    onlyInt: true,
  }))
  services.fields.add(new Field({
    name: "price_type",
    type: "select",
    values: ["fixed", "from"],
    maxSelect: 1,
  }))
  services.fields.add(new Field({
    // Превью результата: примеры работ, скриншоты, макеты. Обложка
    // карточки в каталоге строится из первого файла + фирменного слоя
    // (градиент по направлению) на фронтенде — см. раздел 4 правки ТЗ и
    // разбор Playerok в PIVOT_SERVICE_CARDS.md; готового изображения
    // "обложки" отдельным полем не храним, чтобы не дублировать источник
    // правды.
    name: "preview_images",
    type: "file",
    maxSelect: 6,
    maxSize: 8388608,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  }))
  app.save(services)

  // --- specialist_profiles: нужно для "рейтинг + число заказов" на
  // карточке услуги (раздел 2 правки ТЗ) — заявок (leads) недостаточно,
  // так как не все заявки становятся завершёнными заказами.
  const profiles = app.findCollectionByNameOrId("specialist_profiles")
  profiles.fields.add(new Field({
    name: "completed_orders_count",
    type: "number",
    min: 0,
    onlyInt: true,
  }))
  app.save(profiles)

  // --- promotions: продвижение переезжает на уровень карточки услуги
  // (раздел 7 правки ТЗ), а не только профиля целиком. specialist_profile_id
  // остаётся (нужен для продвижения профиля как уровня доверия), service_id
  // — новый, необязательный: если заполнен, продвигается конкретная
  // карточка, а не весь профиль.
  const promotions = app.findCollectionByNameOrId("promotions")
  promotions.fields.add(new Field({
    name: "service_id",
    type: "relation",
    required: false,
    collectionId: services.id,
    cascadeDelete: true,
    maxSelect: 1,
  }))
  return app.save(promotions)
}, (app) => {
  const services = app.findCollectionByNameOrId("services")
  for (const name of ["category_id", "tagline", "tags", "scope_label", "revisions_included", "price_type", "preview_images"]) {
    services.fields.removeByName(name)
  }
  app.save(services)

  const profiles = app.findCollectionByNameOrId("specialist_profiles")
  profiles.fields.removeByName("completed_orders_count")
  app.save(profiles)

  const promotions = app.findCollectionByNameOrId("promotions")
  promotions.fields.removeByName("service_id")
  return app.save(promotions)
})
