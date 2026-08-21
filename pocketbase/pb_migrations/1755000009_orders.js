/// <reference path="../pb_data/types.d.ts" />

// ТЗ §11.9 / §10 — orders cover both plan purchases and promotion
// purchases (product_type). Status transitions and the manual-payment
// "Я оплатил" flow are driven by Next.js API routes using a service
// account, not raw client writes — see updateRule note below.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users")
  const plans = app.findCollectionByNameOrId("plans")
  const profiles = app.findCollectionByNameOrId("specialist_profiles")

  const collection = new Collection({
    type: "base",
    name: "orders",
    indexes: [
      "CREATE UNIQUE INDEX idx_orders_number ON orders (order_number)",
      "CREATE INDEX idx_orders_user ON orders (user_id)",
      "CREATE INDEX idx_orders_status ON orders (status)",
    ],
    listRule: "user_id = @request.auth.id || @request.auth.role = \"admin\"",
    viewRule: "user_id = @request.auth.id || @request.auth.role = \"admin\"",
    createRule: "@request.body.user_id = @request.auth.id",
    // Amount/status fields must never be client-writable (that's how a
    // buyer could mark their own order "paid"). Only admins — or the
    // Alfa-Bank callback route running under a service account — may
    // update an order after creation.
    updateRule: "@request.auth.role = \"admin\"",
    deleteRule: "@request.auth.role = \"admin\"",
  })

  collection.fields.add(new Field({
    name: "user_id",
    type: "relation",
    required: true,
    collectionId: users.id,
    cascadeDelete: false,
    minSelect: 1,
    maxSelect: 1,
  }))
  collection.fields.add(new Field({ name: "order_number", type: "text", required: true, max: 50 }))
  collection.fields.add(new Field({
    name: "product_type",
    type: "select",
    required: true,
    values: ["plan", "promotion"],
    maxSelect: 1,
  }))
  collection.fields.add(new Field({
    name: "plan_id",
    type: "relation",
    collectionId: plans.id,
    maxSelect: 1,
  }))
  collection.fields.add(new Field({
    name: "specialist_profile_id",
    type: "relation",
    required: true,
    collectionId: profiles.id,
    cascadeDelete: false,
    minSelect: 1,
    maxSelect: 1,
  }))
  collection.fields.add(new Field({ name: "price_original", type: "number", required: true, min: 0 }))
  collection.fields.add(new Field({ name: "discount_percent", type: "number", min: 0, max: 100, onlyInt: true }))
  collection.fields.add(new Field({ name: "discount_amount", type: "number", min: 0 }))
  collection.fields.add(new Field({ name: "total_amount", type: "number", required: true, min: 0 }))
  collection.fields.add(new Field({ name: "currency", type: "text", required: true, max: 10 }))
  collection.fields.add(new Field({
    name: "payment_provider",
    type: "select",
    required: true,
    values: ["manual", "alfa", "yookassa", "cloudpayments", "tbank", "vtb"],
    maxSelect: 1,
  }))
  collection.fields.add(new Field({ name: "external_payment_id", type: "text", max: 200 }))
  collection.fields.add(new Field({ name: "payment_url", type: "url" }))
  collection.fields.add(new Field({
    name: "status",
    type: "select",
    required: true,
    values: [
      "awaiting_payment", "receipt_uploaded", "under_review",
      "paid", "cancelled", "refunded", "expired",
    ],
    maxSelect: 1,
  }))
  collection.fields.add(new Field({
    name: "manual_receipt",
    type: "file",
    maxSelect: 1,
    maxSize: 10485760,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  }))
  collection.fields.add(new Field({ name: "paid_at", type: "date" }))
  collection.fields.add(new Field({ name: "service_start_at", type: "date" }))
  collection.fields.add(new Field({ name: "service_end_at", type: "date" }))
  collection.fields.add(new Field({ name: "created", type: "autodate", onCreate: true }))
  collection.fields.add(new Field({ name: "updated", type: "autodate", onCreate: true, onUpdate: true }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("orders")
  return app.delete(collection)
})
