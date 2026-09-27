import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PLANS, PLAN_FEATURE_ROWS, isBasicPromoActive } from "@/data/plans";
import { PaymentsNotice, PlanChooseButton, PromoCountdown } from "@/components/TariffsActions";

export const metadata: Metadata = {
  title: "Тарифы для специалистов — НайдИИ",
  description:
    "Тарифы размещения на НайдИИ: подписка плюс процент с подтверждённой сделки — от Базового до Enterprise с выделенным менеджером.",
};

function formatMoney(value: number) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

// Оформление по коду тарифа — здесь, не в data/plans.ts: там модель цен,
// тут только визуал (та же логика разделения, что у data/categories.ts и
// data/category-style.ts). accent — цветная полоса слева карточки, card —
// фон самой карточки (у рекомендуемого он ощутимо ярче остальных).
const PLAN_STYLE: Record<string, { icon: string; accent: string; card: string }> = {
  basic: { icon: "🚀", accent: "bg-zinc-300", card: "border-zinc-200 bg-white" },
  pro: { icon: "⭐", accent: "bg-gradient-to-b from-blue-600 to-cyan-500", card: "border-blue-200 bg-blue-50/60" },
  enterprise: { icon: "🏢", accent: "bg-violet-600", card: "border-zinc-200 bg-white" },
};

export default function TariffsPage() {
  const basicPromo = isBasicPromoActive();

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
              Тарифы для специалистов
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Подписка — и процент с каждой подтверждённой сделки через
              безопасную сделку. Чем выше тариф, тем ниже комиссия.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            <PaymentsNotice />
            {basicPromo && <PromoCountdown />}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PLANS.map((plan) => {
              const style = PLAN_STYLE[plan.code] ?? PLAN_STYLE.basic;
              const showPromo = plan.code === "basic" && basicPromo;
              return (
                <div
                  key={plan.code}
                  className={`relative flex flex-col overflow-hidden rounded-2xl border pl-5 pr-5 py-5 ${style.card} ${
                    plan.recommended ? "ring-1 ring-blue-300" : ""
                  }`}
                >
                  <span className={`absolute inset-y-0 left-0 w-1.5 ${style.accent}`} aria-hidden="true" />
                  <div className="flex items-center justify-between">
                    <span className="text-xl" aria-hidden="true">{style.icon}</span>
                    {plan.recommended && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-medium text-white">
                        Рекомендуем
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-base font-semibold text-zinc-900">
                    {plan.title}
                  </p>

                  {showPromo ? (
                    <>
                      <p className="mt-1 text-2xl font-bold text-zinc-900">
                        {formatMoney(plan.monthlyFee)}
                        <span className="text-sm font-medium text-zinc-500"> за 3 месяца</span>
                      </p>
                      <p className="text-xs font-medium text-amber-700">
                        по акции — вместо {formatMoney(plan.monthlyFee * 3)}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-2xl font-bold text-zinc-900">
                      {formatMoney(plan.monthlyFee)}
                      <span className="text-sm font-medium text-zinc-500">/мес</span>
                    </p>
                  )}

                  <p className="mt-1 text-sm font-medium text-zinc-600">
                    + {plan.commissionPercent}% с подтверждённой сделки
                  </p>
                  <p className="mt-2 text-sm text-zinc-600">
                    {plan.description}
                  </p>
                  {plan.volumeDiscount && (
                    <p className="mt-2 text-xs text-emerald-600">
                      Комиссия снижается до {plan.volumeDiscount.commissionPercent}% при{" "}
                      {plan.volumeDiscount.minDeals}+ сделках
                    </p>
                  )}
                  <PlanChooseButton recommended={plan.recommended} />
                </div>
              );
            })}
          </div>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="px-4 py-3 font-medium text-zinc-500">
                    Возможность
                  </th>
                  {PLANS.map((plan) => (
                    <th
                      key={plan.code}
                      className="px-4 py-3 font-medium text-zinc-900"
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
                    {PLANS.map((plan) => (
                      <td key={plan.code} className="px-4 py-3 text-zinc-900">
                        {row.getValue(plan)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
