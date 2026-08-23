// Слаги типов результата, для которых уже загружена настоящая обложка в
// web/public/covers/{slug}.png (см. COVER_ART_PROMPTS.md). Список ведётся
// вручную по мере добавления картинок — файлы в web/public/covers/ не
// сканируются на лету, потому что mock-services.ts (через ResultTypePlate)
// подключается и в клиентские компоненты ("use client" в ServicesCatalog),
// а там нет доступа к fs.
export const COVER_MANIFEST: ReadonlySet<string> = new Set([
  "ai-agents-prodazhi-i-zayavki-prodayuschiy-ai-agent-dlya-sayt",
  "ai-agents-prodazhi-i-zayavki-ai-agent-kvalifikacii-lidov-dly",
  "ai-agents-podderzhka-klientov-ai-agent-podderzhki-247-s-eska",
  "ai-agents-podderzhka-klientov-audit-suschestvuyuschego-ai-ag",
  "ai-agents-hr-i-rekruting-ai-agent-dlya-hr-pervichnyy-skrinin",
  "ai-agents-hr-i-rekruting-ai-agent-onbordinga-novyh-sotrudnik",
  "rag-korporativnye-bazy-znaniy-baza-znaniy-s-rag-poiskom-po-d",
  "rag-korporativnye-bazy-znaniy-obnovlenie-i-pereindeksaciya-s",
  "rag-rag-dlya-botov-podderzhki-integraciya-rag-v-suschestvuyu",
  "rag-rag-dlya-botov-podderzhki-rag-poverh-bazy-faq-i-tiketov-",
  "rag-yuridicheskiy-ai-analiz-rag-konsultant-dlya-yuridichesko",
  "orchestration-avtomatizaciya-processov-scenariy-avtomatizaci",
  "orchestration-avtomatizaciya-processov-avtomatizaciya-priema",
  "orchestration-migraciya-mezhdu-platformami-perenos-workflow-",
  "orchestration-migraciya-mezhdu-platformami-audit-i-optimizac",
  "orchestration-otchetnost-i-tablicy-avtomatizaciya-otchetnost",
  "orchestration-otchetnost-i-tablicy-ezhemesyachnoe-soprovozhd",
  "chatbots-prodayuschie-boty-telegram-bot-s-ai-konsultantom-i-",
  "chatbots-prodayuschie-boty-audit-konversii-suschestvuyuscheg",
  "chatbots-zapis-i-bronirovanie-bot-zapisi-na-uslugi-s-napomin",
  "chatbots-podderzhka-v-messendzherah-perenos-telegram-bota-na",
  "chatbots-podderzhka-v-messendzherah-bot-podderzhki-klientov-",
  "voice-ai-priem-zvonkov-golosovoy-agent-dlya-priema-vhodyasch",
  "voice-ai-priem-zvonkov-zamena-ivr-menyu-na-golosovogo-agenta",
  "voice-ai-ishodyaschiy-obzvon-obzvon-bazy-s-ai-skriptom-podtv",
  "voice-ai-ivr-i-resepshn-golosovoy-agent-resepshn-pereadresac",
  "ai-video-reklamnye-roliki-reklamnyy-rolik-s-ai-avatarom",
  "ai-video-shortsreels-paket-iz-10-shortsreels-s-ai-montazhom",
  "ai-video-ozvuchka-i-lokalizaciya-ozvuchka-i-lokalizaciya-vid",
  "ai-video-obuchayuschee-video-obuchayuschee-video-s-ai-diktor",
  "crm-ai-skoring-lidov-ai-skoring-lidov-v-amocrmbitriks24",
  "crm-ai-avtozapolnenie-dannyh-avtozapolnenie-kartochek-sdelok",
  "crm-ai-avtozapolnenie-dannyh-integraciya-ai-summarizacii-zvo",
  "crm-ai-napominaniya-i-uvedomleniya-ai-napominaniya-menedzher",
  "prompt-engineering-prompt-inzhiniring-optimizaciya-promptov-",
  "prompt-engineering-fayntyuning-fayntyuning-modeli-pod-uzkuyu",
  "prompt-engineering-fayntyuning-sbor-i-razmetka-dataseta-dlya",
  "prompt-engineering-optimizaciya-rashodov-na-ai-snizhenie-sto",
  "ai-analytics-ai-dashbordy-dashbord-s-ai-insaytami-po-prodazh",
  "ai-analytics-otchety-na-estestvennom-yazyke-ai-otchet-sprosi",
  "ai-analytics-otchety-na-estestvennom-yazyke-avtomaticheskiy-",
  "ai-analytics-monitoring-i-alerty-poisk-anomaliy-v-dannyh-s-a",
]);

export function getCoverImagePath(slug: string): string | undefined {
  return COVER_MANIFEST.has(slug) ? `/covers/${slug}.png` : undefined;
}
