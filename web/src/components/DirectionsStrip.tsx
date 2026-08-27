import Link from "next/link";
import { CATEGORIES } from "@/data/categories";
import { getCategory3D } from "@/data/category-style";

export default function DirectionsStrip() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-zinc-500">
          Выберите направление
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((category) => {
            const classes = getCategory3D(category.slug);
            return (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className={`rounded-2xl border-b-4 bg-gradient-to-br px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0.5 active:border-b-2 ${classes}`}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
