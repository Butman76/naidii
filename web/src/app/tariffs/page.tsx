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
              const showPromo = plan.code === "basic" && basicPromo;
              // Вариант В (выбран пользователем вместо изначально сделанного Б):
              // крупная цена вместо мелкого заголовка, комиссия — отдельным
              // блоком-метрикой, а не строкой текста, у Pro вместо цветной
              // рамки — инвертированная тёмная карточка.
              const inverted = Boolean(plan.recommended);
              return (
                <div
                  key={plan.code}
                  className={`flex flex-col rounded-2xl p-5 ${
                    inverted ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white"
                  }`}
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                    {plan.title}
                    {plan.recommended ? " · Рекомендуем" : ""}
                  </p>

                  {showPromo ? (
                    <>
                      <p className="mt-1.5 text-[26px] font-semibold leading-none text-inherit">
                        {formatMoney(plan.monthlyFee)}
                        <span className={`ml-1 text-sm font-medium ${inverted ? "text-zinc-400" : "text-zinc-500"}`}>
                          за 3 месяца
                        </span>
                      </p>
                      <p className="mt-1.5 text-xs font-medium text-amber-500">
                        по акции — вместо {formatMoney(plan.monthlyFee * 3)}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1.5 text-[26px] font-semibold leading-none text-inherit">
                      {formatMoney(plan.monthlyFee)}
                      <span className={`ml-1 text-sm font-medium ${inverted ? "text-zinc-400" : "text-zinc-500"}`}>
                        в месяц
                      </span>
                    </p>
                  )}

                  <div
                    className={`mt-3 rounded-xl px-3 py-2 text-xs ${
                      inverted ? "bg-white/10 text-zinc-300" : "bg-zinc-50 text-zinc-500"
                    }`}
                  >
                    Комиссия{" "}
                    <b className={inverted ? "text-white" : "text-zinc-900"}>{plan.commissionPercent}%</b>
                    {" "}со сделки
                    {plan.volumeDiscount && (
                      <>
                        , от {plan.volumeDiscount.minDeals} сделок —{" "}
                        <b className={inverted ? "text-white" : "text-zinc-900"}>
                          {plan.volumeDiscount.commissionPercent}%
                        </b>
                      </>
                    )}
                  </div>

                  <p className={`mt-3 text-sm ${inverted ? "text-zinc-300" : "text-zinc-600"}`}>
                    {plan.description}
                  </p>

                  <PlanChooseButton recommended={plan.recommended} inverted={inverted} />
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
