import type { Specialist } from "@/types/specialist";
import { CATEGORIES } from "@/data/categories";
import { withBasePath } from "@/lib/base-path";

const BADGE_LABELS: Record<string, string> = {
  top: "Топ",
  promoted: "Продвигается",
  popular: "Популярный",
  founder: "Первые участники",
};

const GALLERY_GRADIENTS = [
  "bg-gradient-to-br from-violet-500 to-fuchsia-500",
  "bg-gradient-to-br from-amber-500 to-orange-500",
  "bg-gradient-to-br from-sky-500 to-cyan-400",
  "bg-gradient-to-br from-emerald-500 to-teal-400",
];

// Расширенный "рекламный лендинг" вместо обычного профиля — открыт только
// на максимальном тарифе (см. Specialist["premium"]). Блоки одинаковые у
// всех, кто на этом тарифе, оформление (coverGradient) — разное.
export default function PremiumSpecialistProfile({
  specialist,
}: {
  specialist: Specialist;
}) {
  const premium = specialist.premium;
  if (!premium) return null;

  const categoryName =
    CATEGORIES.find((c) => c.slug === specialist.category)?.name ??
    specialist.category;

  return (
    <>
      <div
        className={`relative h-56 overflow-hidden sm:h-72 ${
          premium.coverImageUrl ? "" : premium.coverGradient
        }`}
      >
        {/* Static export with images.unoptimized: true - next/image adds
            nothing here besides basePath handling that withBasePath already
            covers, so plain <img> for both uploaded assets below. */}
        {premium.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={withBasePath(premium.coverImageUrl)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div className="absolute right-4 top-4 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm sm:right-8 sm:top-6">
          ★ Премиум-профиль
        </div>

        {/* Логотип лежит поверх обложки, а не наполовину съезжает на белый
            фон под ней, как обычный круглый аватар. */}
        {premium.logoImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={withBasePath(premium.logoImageUrl)}
            alt={specialist.name}
            className="absolute bottom-4 left-4 h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-xl sm:bottom-6 sm:left-8 sm:h-32 sm:w-32"
          />
        ) : (
          <div className="absolute bottom-4 left-4 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-zinc-900 text-2xl font-semibold text-white shadow-xl sm:bottom-6 sm:left-8 sm:h-32 sm:w-32">
            {specialist.avatarInitials}
          </div>
        )}
      </div>

      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 pb-8 pt-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
                  {specialist.name}
                </h1>
                {specialist.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700"
                  >
                    {BADGE_LABELS[badge]}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-base font-medium text-zinc-700">
                {premium.tagline}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {categoryName} · {specialist.location}
              </p>
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

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 py-6 sm:grid-cols-4">
            <div>
              <p className="text-xl font-bold text-zinc-900">
                ★ {specialist.rating.toFixed(1)}
              </p>
              <p className="text-xs text-zinc-500">
                {specialist.reviewsCount} отзывов
              </p>
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-900">
                {specialist.experienceYears}
              </p>
              <p className="text-xs text-zinc-500">лет на рынке</p>
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-900">
                {premium.team.length || 1}
              </p>
              <p className="text-xs text-zinc-500">человек в команде</p>
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-900">
                {specialist.responseTime.replace("Отвечает ", "")}
              </p>
              <p className="text-xs text-zinc-500">время ответа</p>
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
        </section>

        {premium.videoPitchLabel && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-zinc-900">
              Видео-презентация
            </h2>
            <div className="mt-4 flex aspect-video items-center justify-center rounded-2xl bg-zinc-900 text-white">
              <div className="flex flex-col items-center gap-2 px-4 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-2xl">
                  ▶
                </span>
                <p className="text-sm text-zinc-300">
                  {premium.videoPitchLabel}
                </p>
              </div>
            </div>
          </section>
        )}

        {premium.gallery.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-zinc-900">
              Скриншоты и работы
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {premium.gallery.map((item, i) => (
                <div
                  key={item}
                  className={`flex aspect-video items-end rounded-2xl p-4 text-sm font-medium text-white ${
                    GALLERY_GRADIENTS[i % GALLERY_GRADIENTS.length]
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        )}

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

        {premium.team.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-zinc-900">Команда</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {premium.team.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                    {member.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {member.name}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {premium.certificates.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-zinc-900">
              Сертификаты и партнёрства
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {premium.certificates.map((cert) => (
                <span
                  key={cert}
                  className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800"
                >
                  {cert}
                </span>
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

        <section className="mt-10 rounded-2xl bg-zinc-900 p-8 text-center">
          <p className="text-lg font-semibold text-white">
            Готовы обсудить проект?
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            {specialist.name} обычно {specialist.responseTime.toLowerCase()}
          </p>
          <button className="mt-4 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200">
            Написать
          </button>
        </section>
      </div>
    </>
  );
}
