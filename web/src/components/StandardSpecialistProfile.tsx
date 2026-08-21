import type { Specialist } from "@/types/specialist";
import { CATEGORIES } from "@/data/categories";

const BADGE_LABELS: Record<string, string> = {
  top: "Топ",
  promoted: "Продвигается",
  popular: "Популярный",
  founder: "Первые участники",
};

const BADGE_STYLES: Record<string, string> = {
  top: "bg-amber-100 text-amber-800",
  promoted: "bg-violet-100 text-violet-800",
  popular: "bg-zinc-100 text-zinc-700",
  founder: "bg-emerald-100 text-emerald-800",
};

export default function StandardSpecialistProfile({
  specialist,
}: {
  specialist: Specialist;
}) {
  const categoryName =
    CATEGORIES.find((c) => c.slug === specialist.category)?.name ??
    specialist.category;

  return (
    <>
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xl font-semibold text-white">
              {specialist.avatarInitials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
                  {specialist.name}
                </h1>
                {specialist.badges.map((badge) => (
                  <span
                    key={badge}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${BADGE_STYLES[badge]}`}
                  >
                    {BADGE_LABELS[badge]}
                  </span>
                ))}
              </div>

              <p className="mt-1 text-base text-zinc-600">
                {specialist.title}
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                {categoryName} · {specialist.location}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
                <span>
                  ★ {specialist.rating.toFixed(1)} · {specialist.reviewsCount}{" "}
                  отзывов
                </span>
                <span>Опыт {specialist.experienceYears} лет</span>
                <span>{specialist.responseTime}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1">
                {specialist.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-zinc-50 px-2 py-0.5 text-xs text-zinc-500 ring-1 ring-inset ring-zinc-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
              <p className="text-lg font-semibold text-zinc-900">
                {specialist.priceFrom}
              </p>
              <button className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700">
                Написать
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section>
          <h2 className="text-lg font-semibold text-zinc-900">
            О специалисте
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            {specialist.fullDescription}
          </p>
        </section>

        {specialist.services.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-zinc-900">Услуги</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {specialist.services.map((service) => (
                <div
                  key={service.title}
                  className="rounded-2xl border border-zinc-200 bg-white p-4"
                >
                  <p className="text-sm font-medium text-zinc-900">
                    {service.title}
                  </p>
                  <p className="mt-2 text-sm text-zinc-600">
                    {service.priceFrom}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Срок: {service.durationFrom}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {specialist.reviews.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-zinc-900">Отзывы</h2>
            <div className="mt-4 flex flex-col gap-4">
              {specialist.reviews.map((review) => (
                <div
                  key={review.author}
                  className="rounded-2xl border border-zinc-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-900">
                      {review.author}
                    </p>
                    <p className="text-sm text-amber-600">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">{review.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
