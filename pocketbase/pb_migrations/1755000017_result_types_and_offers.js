/// <reference path="../pb_data/types.d.ts" />

// Разъединяет модель под пивот на карточки услуг (PIVOT_SERVICE_CARDS.md,
// раздел 6): "Тип результата" — новая коллекция result_types (плашка,
// общая для всех продавцов), "services" остаётся коллекцией конкретных
// предложений специалистов, но теперь ссылается на result_type_id вместо
// собственных category/title/description — заголовок и категория
// наследуются от типа результата, специалист определяет только
// коммерческие условия (цена/срок/метки/УТП), см.
// web/src/components/dashboard/ServiceCreationForm.tsx — поля миграции
// подобраны так, чтобы совпадать с тем, что реально собирает форма.
migrate((app) => {
  const categories = app.findCollectionByNameOrId("categories")

  const resultTypes = new Collection({
    type: "base",
    name: "result_types",
    indexes: [
      "CREATE UNIQUE INDEX idx_result_types_slug ON result_types (slug)",
      "CREATE INDEX idx_result_types_category ON result_types (category_id)",
    ],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = \"admin\" || @request.auth.role = \"moderator\"",
    updateRule: "@request.auth.role = \"admin\" || @request.auth.role = \"moderator\"",
    deleteRule: "@request.auth.role = \"admin\"",
  })

  resultTypes.fields.add(new Field({
    name: "category_id",
    type: "relation",
    required: true,
    collectionId: categories.id,
    cascadeDelete: false,
    maxSelect: 1,
  }))
  resultTypes.fields.add(new Field({ name: "subcategory", type: "text", required: true, max: 150 }))
  resultTypes.fields.add(new Field({ name: "title", type: "text", required: true, max: 200 }))
  resultTypes.fields.add(new Field({ name: "slug", type: "text", required: true, max: 150 }))
  resultTypes.fields.add(new Field({ name: "scope_label", type: "text", max: 100 }))
  resultTypes.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  resultTypes.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))

  app.save(resultTypes)

  // --- services: убираем поля, которые теперь наследуются от типа
  // результата (category/category_id/title/description — форма создания
  // карточки их не собирает, см. ServiceCreationForm.tsx), добавляем
  // обязательную ссылку на result_type_id.
  const services = app.findCollectionByNameOrId("services")

  services.fields.add(new Field({
    name: "result_type_id",
    type: "relation",
    required: true,
    collectionId: resultTypes.id,
    cascadeDelete: false,
    maxSelect: 1,
  }))

  for (const name of ["category", "category_id", "title", "description"]) {
    const field = services.fields.getByName(name)
    if (field) services.fields.removeByName(name)
  }

  return app.save(services)
}, (app) => {
  const services = app.findCollectionByNameOrId("services")
  services.fields.removeByName("result_type_id")
  services.fields.add(new Field({ name: "title", type: "text", required: true, max: 200 }))
  services.fields.add(new Field({ name: "description", type: "editor" }))
  services.fields.add(new Field({ name: "category", type: "text", max: 150 }))
  app.save(services)

  const resultTypes = app.findCollectionByNameOrId("result_types")
  return app.delete(resultTypes)
})
