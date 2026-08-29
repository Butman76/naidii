import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PLANS, PLAN_FEATURE_ROWS, type Plan } from "@/data/plans";

export const metadata: Metadata = {
  title: "Тарифы для специалистов — НайдИИ",
  description:
    "Тарифы размещения на НайдИИ: вход или подписка плюс процент с подтверждённой сделки — от Базового до Enterprise с выделенным менеджером.",
};

function formatMoney(value: number) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

// Главная цифра карточки — то, что платится регулярно/при входе. Комиссия
// с сделки показывается отдельной строкой, т.к. она есть у всех тарифов и
// не укладывается в "цена за период".
function primaryPrice(plan: Plan) {
  if (plan.monthlyFee > 0) return `${formatMoney(plan.monthlyFee)}/мес`;
  if (plan.entryFee > 0) return `${formatMoney(plan.entryFee)} вход`;
  return "Бесплатно";
}

export default function TariffsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
              Тарифы для специалистов
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Вход или подписка — и процент с каждой подтверждённой сделки
              через безопасную сделку. Чем выше тариф, тем ниже комиссия.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Оплата на площадке ещё не подключена — это витрина тарифов,
            оформление заказа появится позже.
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.code}
                className={`flex flex-col rounded-2xl border bg-white p-5 ${
                  plan.recommended
                    ? "border-zinc-900 ring-1 ring-zinc-900"
                    : "border-zinc-200"
                }`}
              >
                {plan.recommended && (
                  <span className="mb-2 w-fit rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-white">
                    Рекомендуем
                  </span>
                )}
                <p className="text-base font-semibold text-zinc-900">
                  {plan.title}
                </p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">
                  {primaryPrice(plan)}
                </p>
                <p className="text-sm font-medium text-zinc-600">
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
                <button
                  className={`mt-5 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                    plan.recommended
                      ? "bg-zinc-900 text-white hover:bg-zinc-700"
                      : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  Выбрать тариф
                </button>
              </div>
            ))}
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
