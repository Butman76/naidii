/// <reference path="../pb_data/types.d.ts" />

// Наполняет пустую коллекцию skills (1755000003) — без этого редактор
// навыков в кабинете специалиста (ProfileEditForm.tsx) показывал бы пустой
// список на выбор. category — название направления из data/categories.ts
// (для группировки в интерфейсе, само поле свободный текст, не связь —
// см. комментарий в 1755000003_skills.js). Список стартовый, админ может
// дополнить его вручную через /_/ (createRule коллекции — только admin).
const SKILLS = [
  ["ai-agenty-langchain", "LangChain", "AI-агенты"],
  ["ai-agenty-langgraph", "LangGraph", "AI-агенты"],
  ["ai-agenty-crewai", "CrewAI", "AI-агенты"],
  ["ai-agenty-multiagentnye-sistemy", "Мультиагентные системы", "AI-агенты"],
  ["ai-agenty-mcp", "MCP (Model Context Protocol)", "AI-агенты"],

  ["rag-osnova", "RAG", "RAG / базы знаний"],
  ["rag-vektornye-bazy", "Векторные базы (Qdrant/Pinecone)", "RAG / базы знаний"],
  ["rag-embeddings", "Embeddings", "RAG / базы знаний"],
  ["rag-graphrag", "GraphRAG", "RAG / базы знаний"],
  ["rag-semanticheskiy-poisk", "Семантический поиск", "RAG / базы знаний"],

  ["orch-n8n", "n8n", "No-code оркестрация"],
  ["orch-make", "Make", "No-code оркестрация"],
  ["orch-zapier", "Zapier", "No-code оркестрация"],
  ["orch-albato", "Albato", "No-code оркестрация"],
  ["orch-nocode-avtomatizaciya", "No-code автоматизация процессов", "No-code оркестрация"],

  ["chatbot-telegram-api", "Telegram Bot API", "Чат-боты / мессенджеры"],
  ["chatbot-whatsapp-api", "WhatsApp Business API", "Чат-боты / мессенджеры"],
  ["chatbot-vk-api", "VK Bot API", "Чат-боты / мессенджеры"],
  ["chatbot-max", "MAX", "Чат-боты / мессенджеры"],
  ["chatbot-omnichannel", "Омниканальные интеграции", "Чат-боты / мессенджеры"],

  ["voice-stt", "Распознавание речи (STT)", "Голосовые AI-агенты"],
  ["voice-tts", "Синтез речи (TTS)", "Голосовые AI-агенты"],
  ["voice-ivr", "IVR / телефония", "Голосовые AI-агенты"],
  ["voice-analytics", "Речевая аналитика", "Голосовые AI-агенты"],
  ["voice-agenty", "Голосовые AI-агенты", "Голосовые AI-агенты"],

  ["video-generaciya", "Генерация AI-видео", "AI-видео и контент"],
  ["video-runway", "Runway", "AI-видео и контент"],
  ["video-heygen", "HeyGen", "AI-видео и контент"],
  ["video-avatary", "Цифровые аватары", "AI-видео и контент"],
  ["video-image-gen", "Генерация изображений (Midjourney/SD)", "AI-видео и контент"],

  ["crm-bitrix24", "Битрикс24", "AI над CRM / учётными системами"],
  ["crm-amocrm", "amoCRM", "AI над CRM / учётными системами"],
  ["crm-1c", "1С", "AI над CRM / учётными системами"],
  ["crm-retailcrm", "retailCRM", "AI над CRM / учётными системами"],
  ["crm-integracii", "CRM-интеграции", "AI над CRM / учётными системами"],

  ["prompt-engineering", "Prompt Engineering", "Промпт-инжиниринг / файнтюнинг"],
  ["prompt-finetuning", "Fine-tuning", "Промпт-инжиниринг / файнтюнинг"],
  ["prompt-lora", "LoRA / QLoRA", "Промпт-инжиниринг / файнтюнинг"],
  ["prompt-rlhf", "RLHF", "Промпт-инжиниринг / файнтюнинг"],
  ["prompt-data-labeling", "Разметка данных", "Промпт-инжиниринг / файнтюнинг"],

  ["analytics-powerbi", "Power BI", "AI-аналитика и отчётность"],
  ["analytics-datalens", "Yandex DataLens", "AI-аналитика и отчётность"],
  ["analytics-sql", "SQL", "AI-аналитика и отчётность"],
  ["analytics-python-ds", "Python (Data Science)", "AI-аналитика и отчётность"],
  ["analytics-predictive", "Предиктивная аналитика", "AI-аналитика и отчётность"],

  ["common-python", "Python", "Общие технологии"],
  ["common-js-ts", "JavaScript / TypeScript", "Общие технологии"],
  ["common-openai-api", "OpenAI API", "Общие технологии"],
  ["common-gigachat", "GigaChat", "Общие технологии"],
  ["common-yandexgpt", "YandexGPT", "Общие технологии"],
  ["common-postgresql", "PostgreSQL", "Общие технологии"],
]

migrate((app) => {
  const collection = app.findCollectionByNameOrId("skills")
  for (const [slug, name, category] of SKILLS) {
    let exists = true
    try {
      app.findFirstRecordByData("skills", "slug", slug)
    } catch (err) {
      exists = false
    }
    if (exists) continue
    const record = new Record(collection)
    record.set("slug", slug)
    record.set("name", name)
    record.set("category", category)
    record.set("status", "active")
    app.save(record)
  }
}, (app) => {
  for (const [slug] of SKILLS) {
    try {
      app.delete(app.findFirstRecordByData("skills", "slug", slug))
    } catch (err) {
      // уже удалён
    }
  }
})
