/// <reference path="../pb_data/types.d.ts" />

// Исправляет скрытый баг в исходном уникальном индексе на top_position
// (1755000010_promotions.js): числовое поле без явного значения хранится
// как 0, а не NULL, поэтому условие "WHERE top_position IS NOT NULL"
// пропускает такие записи — как только появляется больше одного активного
// продвижения без фиксированной позиции (обычная ситуация: продвижение
// "в ротации", top_position вообще не задаётся), индекс падает с
// "Value must be unique". Правильное условие — исключать ещё и 0/меньше
// минимально допустимого (поле само объявлено с min:1).
migrate((app) => {
  const promotions = app.findCollectionByNameOrId("promotions")
  promotions.indexes = promotions.indexes.map((idx) =>
    idx.includes("idx_promotions_position")
      ? "CREATE UNIQUE INDEX idx_promotions_position ON promotions (top_position) WHERE top_position IS NOT NULL AND top_position >= 1 AND status = 'active'"
      : idx
  )
  return app.save(promotions)
}, (app) => {
  const promotions = app.findCollectionByNameOrId("promotions")
  promotions.indexes = promotions.indexes.map((idx) =>
    idx.includes("idx_promotions_position")
      ? "CREATE UNIQUE INDEX idx_promotions_position ON promotions (top_position) WHERE top_position IS NOT NULL AND status = 'active'"
      : idx
  )
  return app.save(promotions)
})
