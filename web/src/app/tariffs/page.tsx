import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PLANS, PLAN_FEATURE_ROWS, BASIC_PROMO_MONTHS, isBasicPromoActive } from "@/data/plans";
import { PlanChooseButton, PromoCountdown } from "@/components/TariffsActions";

export const metadata: Metadata = {
  title: "Тарифы для специалистов — НайдИИ",
  description:
    "Тарифы размещения на НайдИИ: подписка на карточку в каталоге — от Базового до Enterprise с выделенным менеджером.",
};

function formatMoney(value: number) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M5 10.5l3 3 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Три компактных плюса под заголовком — правда о том, что уже умеет
// площадка (карточка+кейсы, приём заявок — lib/dashboard.ts; AI-события —
// /events), без обещания комиссии/эскроу, которых пока нет технически
// (см. STATUS.md, 2026-09-27).
const HERO_HIGHLIGHTS = ["Карточка специалиста и кейсы", "Прямые обращения от бизнеса", "AI-сообщество и события"];

// Визуал тарифов — здесь, не в data/plans.ts (там модель цен). Оформление
// по брифу пользователя (2026-09-28, премиальный редизайн): Базовый —
// светлая карточка с голубым акцентом, Pro — тёмная с градиентной рамкой,
// Enterprise — светлая с фиолетово-золотым акцентом. features — не то же
// самое, что plan.description: тут отдельные пункты списком, а не одна
// фраза.
const PLAN_CONTENT: Record<
  string,
  { tagline: string; taglineColor: string; features: string[]; ctaLabel: string; ctaHint?: string; shell: string }
> = {
  basic: {
    tagline: "Чтобы начать и показать свою экспертизу",
    taglineColor: "text-blue-600",
    features: ["Карточка в каталоге НайдИИ", "Услуги и специализации", "Кейсы и портфолио", "Приём прямых заявок"],
    ctaLabel: "Выбрать Базовый",
    shell: "bg-gradient-to-b from-blue-400 via-blue-100 to-transparent",
  },
  pro: {
    tagline: "Для специалистов, которым нужна заметность",
    taglineColor: "text-zinc-400",
    features: [
      "Всё из тарифа «Базовый»",
      "Аналитика профиля",
      "Продвижение в топ-20 каталога",
      "Приоритет в тематических подборках",
    ],
    ctaLabel: "Выбрать PRO",
    ctaHint: "Лучший вариант для активного продвижения",
    shell: "bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-400",
  },
  enterprise: {
    tagline: "Для студий, агентств и команд с объёмом",
    taglineColor: "text-violet-600",
    features: [
      "Всё из тарифа PRO",
      "Выделенный менеджер",
      "Приоритетная поддержка",
      "Собственный мини-лендинг вместо карточки",
    ],
    ctaLabel: "Выбрать Enterprise",
    shell: "bg-gradient-to-br from-violet-300 via-zinc-200 to-amber-300",
  },
};

// Подсветка колонок в таблице возможностей — иначе три одинаковые по цвету
// колонки сливаются. Цвета повторяют акценты карточек выше.
const COLUMN_TINT: Record<string, string> = {
  basic: "bg-zinc-50",
  pro: "bg-violet-50",
  enterprise: "bg-amber-50/70",
};
const COLUMN_ACCENT: Record<string, string> = {
  basic: "text-blue-600",
  pro: "text-violet-600",
  enterprise: "text-amber-600",
};

const FAQ_ITEMS: Array<{ question: string; answer: string }> = [
  {
    question: "Можно ли изменить тариф позже?",
    answer:
      "Да, перейти на более высокий тариф можно в любой момент в личном кабинете. Если оплаченный период закончится без продления, тариф автоматически вернётся на Базовый.",
  },
  {
    question: "Что входит в карточку специалиста?",
    answer:
      "Описание услуг, специализации, кейсы, портфолио, рабочие контакты и приём заявок от заказчиков.",
  },
  {
    question: "Что означает стартовая цена 500 ₽?",
    answer:
      "Это специальная цена для первых участников НайдИИ: Базовый тариф на 3 месяца стоит 500 ₽ вместо 1 500 ₽.",
  },
  {
    question: "Когда изменится стоимость?",
    answer:
      "После формирования стартового пула специалистов условия и стоимость размещения могут быть пересмотрены. Уже оплаченный период не меняется задним числом.",
  },
  {
    question: "Можно ли разместить студию или агентство?",
    answer:
      "Да — для команд, студий и агентств есть тариф Enterprise с выделенным менеджером и расширенными возможностями.",
  },
];

export default function TariffsPage() {
  const basicPromo = isBasicPromoActive();

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
              Выберите формат присутствия в НайдИИ
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {HERO_HIGHLIGHTS.map((text) => (
                <span
                  key={text}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600"
                >
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          {basicPromo && <PromoCountdown />}

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {PLANS.map((plan) => {
              const showPromo = plan.code === "basic" && basicPromo;
              const inverted = Boolean(plan.recommended);
              const content = PLAN_CONTENT[plan.code];

              return (
                <div
                  key={plan.code}
                  className={`rounded-[20px] p-[1.5px] shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
                    inverted ? "shadow-violet-900/10 hover:shadow-violet-500/20" : "hover:shadow-zinc-300/60"
                  } ${content.shell}`}
                >
                  <div
                    className={`flex h-full flex-col rounded-[18.5px] p-6 ${
                      inverted ? "bg-zinc-900 text-white" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{plan.title}</p>
                      {plan.recommended && (
                        <span className="shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow shadow-violet-500/30">
                          Рекомендуем
                        </span>
                      )}
                      {showPromo && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                          Стартовая акция
                        </span>
                      )}
                    </div>

                    <p className={`mt-1.5 text-xs font-medium ${content.taglineColor}`}>{content.tagline}</p>

                    {showPromo ? (
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-4xl font-bold tracking-tight">{formatMoney(plan.monthlyFee)}</span>
                        <span className="text-sm text-zinc-400 line-through">
                          {formatMoney(plan.monthlyFee * 3)}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <span className="text-4xl font-bold tracking-tight">{formatMoney(plan.monthlyFee)}</span>
                      </div>
                    )}
                    <p className={`mt-1 text-xs font-medium ${inverted ? "text-zinc-400" : "text-zinc-500"}`}>
                      {showPromo ? `за ${BASIC_PROMO_MONTHS} месяца по акции` : "в месяц"}
                    </p>

                    <ul className="mt-5 flex flex-col gap-2.5 text-sm">
                      {content.features.map((feature) => (
                        <li
                          key={feature}
                          className={`flex items-start gap-2 ${inverted ? "text-zinc-300" : "text-zinc-600"}`}
                        >
                          <CheckIcon
                            className={`mt-0.5 h-4 w-4 shrink-0 ${inverted ? "text-cyan-400" : "text-blue-600"}`}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-6">
                      <PlanChooseButton recommended={plan.recommended} inverted={inverted} label={content.ctaLabel} />
                      {content.ctaHint && (
                        <p className={`mt-2 text-center text-[11px] ${inverted ? "text-zinc-500" : "text-zinc-400"}`}>
                          {content.ctaHint}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-14">
            <h2 className="text-lg font-semibold text-zinc-900">Сравните возможности тарифов</h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-md">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="px-4 py-3 font-medium text-zinc-500">Возможность</th>
                    {PLANS.map((plan) => (
                      <th
                        key={plan.code}
                        className={`px-4 py-3 text-center font-semibold text-zinc-900 ${COLUMN_TINT[plan.code] ?? ""}`}
                      >
                        {plan.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PLAN_FEATURE_ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-zinc-100 last:border-0">
                      <td className="px-4 py-3 text-zinc-600">{row.label}</td>
                      {PLANS.map((plan) => {
                        const value = row.getValue(plan);
                        return (
                          <td
                            key={plan.code}
                            className={`px-4 py-3 text-center ${COLUMN_TINT[plan.code] ?? ""}`}
                          >
                            {row.kind === "check" ? (
                              value === "Есть" ? (
                                <CheckIcon
                                  className={`mx-auto h-4 w-4 ${COLUMN_ACCENT[plan.code] ?? "text-emerald-600"}`}
                                />
                              ) : (
                                <span className="text-zinc-300" aria-label="Недоступно">
                                  –
                                </span>
                              )
                            ) : (
                              <span className="font-medium text-zinc-900">{value}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-zinc-900">НайдИИ растёт вместе с первыми участниками</h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Мы формируем профессиональное сообщество специалистов по AI, автоматизации и интеграциям. Резиденты
              НайдИИ получают ранний доступ к новым возможностям площадки.
            </p>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 text-sm text-zinc-600 sm:grid-cols-3">
              {[
                "Карточка и кейсы в профессиональном каталоге",
                "Доступ к будущим партнёрским программам и обучению",
                "Участие в тематических подборках и AI-событиях",
              ].map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-zinc-400">
              Условия для первых участников сохраняются на весь оплаченный период.
            </p>
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold text-zinc-900">Вопросы о тарифах</h2>
            <div className="mt-4 flex flex-col gap-2">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-zinc-200 bg-white px-5 py-4 open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-zinc-900 marker:content-none [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <span
                      className="shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                      aria-hidden="true"
                    >
                      ⌄
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-zinc-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
