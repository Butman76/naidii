"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HERO_BANNER_SLIDES } from "@/data/hero-banners";
import { getBannerImagePath } from "@/data/banner-manifest";
import { getCategoryStyle } from "@/data/category-style";
import { CATEGORIES } from "@/data/categories";
import { withBasePath } from "@/lib/base-path";

const AUTO_ADVANCE_MS = 5500;

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current) {
        setActive((i) => (i + 1) % HERO_BANNER_SLIDES.length);
      }
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, []);

  function goTo(index: number) {
    setActive((index + HERO_BANNER_SLIDES.length) % HERO_BANNER_SLIDES.length);
  }

  return (
    <section className="border-b border-zinc-200 bg-white py-6">
      <div
        className="group relative mx-auto max-w-7xl overflow-hidden rounded-2xl px-0 sm:px-6 lg:px-8"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
      >
        {/* Фиксированная высота, заметно ниже прежней (2:1 от полной ширины
            контейнера на десктопе — это ~640px, реально пол-экрана).
            Сейчас — тонкая полоса-баннер на любом экране. Возросшая при
            этом ширина-к-высоте (на десктопе больше исходных 2:1 у части
            баннеров) компенсируется object-top ниже — обрезка идёт снизу,
            не сверху, так что голова не должна теряться, даже когда кадр
            обрезается сильнее, чем раньше. */}
        <div className="relative h-40 overflow-hidden rounded-2xl sm:h-48 md:h-56 lg:h-64">
          {HERO_BANNER_SLIDES.map((slide, i) => {
            const style = getCategoryStyle(slide.categorySlug);
            const bannerUrl = getBannerImagePath(slide.categorySlug);
            const categoryName =
              CATEGORIES.find((c) => c.slug === slide.categorySlug)?.name ??
              slide.eyebrow;

            return (
              <div
                key={slide.categorySlug}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  i === active
                    ? "z-10 opacity-100"
                    : "pointer-events-none z-0 opacity-0"
                }`}
              >
                <Link
                  href={`/category/${slide.categorySlug}`}
                  className={`relative flex h-full w-full items-end overflow-hidden text-white ${
                    bannerUrl ? "bg-zinc-900" : `bg-gradient-to-br ${style.gradient}`
                  }`}
                >
                  {bannerUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer
                    <img
                      src={withBasePath(bannerUrl)}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover object-top"
                    />
                  ) : (
                    <>
                      <div className="pointer-events-none absolute -right-10 -top-14 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
                      <span className="pointer-events-none absolute right-6 top-6 text-7xl opacity-30 drop-shadow-md sm:text-8xl">
                        {style.icon}
                      </span>
                    </>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  <div className="relative flex flex-col gap-1 p-3 sm:gap-1.5 sm:p-5 md:p-6">
                    <span className="w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm sm:text-xs">
                      {categoryName}
                    </span>
                    <h2 className="font-[family-name:var(--font-display)] max-w-lg text-base font-bold leading-tight sm:text-xl md:text-2xl">
                      {slide.title}
                    </h2>
                    <p className="hidden max-w-md text-xs text-white/85 sm:block sm:text-sm">
                      {slide.subtitle}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => goTo(active - 1)}
          aria-label="Предыдущий слайд"
          className="absolute left-2 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-md transition-opacity hover:bg-white group-hover:flex sm:left-8"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          aria-label="Следующий слайд"
          className="absolute right-2 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-md transition-opacity hover:bg-white group-hover:flex sm:right-8"
        >
          ›
        </button>

        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
          {HERO_BANNER_SLIDES.map((slide, i) => (
            <button
              key={slide.categorySlug}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Слайд «${slide.eyebrow}»`}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
