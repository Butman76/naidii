export interface Category {
  slug: string;
  name: string;
}

// Направления площадки. Список сознательно не пытается покрыть вообще всё —
// на случай ниши, которую мы не предугадали, есть catch-all "other": туда
// попадают специалисты со своим направлением, и если оно наберёт критическую
// массу — станет отдельной категорией (категории редактируются админом без
// правки кода, см. pocketbase/README.md).
export const CATEGORIES: Category[] = [
  { slug: "ai-agents", name: "AI-агенты" },
  { slug: "rag", name: "RAG / базы знаний" },
  { slug: "orchestration", name: "No-code оркестрация" },
  { slug: "chatbots", name: "Чат-боты / мессенджеры" },
  { slug: "voice-ai", name: "Голосовые AI-агенты" },
  { slug: "ai-video", name: "AI-видео и контент" },
  { slug: "crm-ai", name: "AI над CRM / учётными системами" },
  { slug: "prompt-engineering", name: "Промпт-инжиниринг / файнтюнинг" },
  { slug: "ai-analytics", name: "AI-аналитика и отчётность" },
  { slug: "other", name: "Другое" },
];
