import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PLANS, PLAN_FEATURE_ROWS, isBasicPromoActive } from "@/data/plans";
import { PlanChooseButton, PromoCountdown } from "@/components/TariffsActions";

export const metadata: Metadata = {
  title: "Тарифы для специалистов — НайдИИ",
  description:
    "Тарифы размещения на НайдИИ: подписка на карточку в каталоге — от Базового до Enterprise с выделенным менеджером.",
};

function formatMoney(value: number) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

// Подсветка колонок в таблице возможностей — иначе три одинаковые по цвету
// колонки сливаются в один серый прямоугольник. Цвета повторяют смысловые
// акценты тарифов на карточках выше (Pro — синий, Enterprise — фиолетовый).
const COLUMN_TINT: Record<string, string> = {
  basic: "bg-zinc-100/70",
  pro: "bg-blue-50",
  enterprise: "bg-violet-100/70",
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
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          {basicPromo && <PromoCountdown />}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PLANS.map((plan) => {
              const showPromo = plan.code === "basic" && basicPromo;
              // Вариант В (выбран пользователем вместо изначально сделанного Б):
              // крупная цена вместо мелкого заголовка, у Pro вместо цветной
              // рамки — инвертированная тёмная карточка.
              const inverted = Boolean(plan.recommended);
              return (
                <div
                  key={plan.code}
                  className={`flex flex-col rounded-2xl p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
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

                  <p className={`mt-3 text-sm ${inverted ? "text-zinc-300" : "text-zinc-600"}`}>
                    {plan.description}
                  </p>

                  <PlanChooseButton recommended={plan.recommended} inverted={inverted} />
                </div>
              );
            })}
          </div>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-md">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="px-4 py-3 font-medium text-zinc-500">
                    Возможность
                  </th>
                  {PLANS.map((plan) => (
                    <th
                      key={plan.code}
                      className={`px-4 py-3 font-medium text-zinc-900 ${COLUMN_TINT[plan.code] ?? ""}`}
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
                      <td key={plan.code} className={`px-4 py-3 text-zinc-900 ${COLUMN_TINT[plan.code] ?? ""}`}>
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
