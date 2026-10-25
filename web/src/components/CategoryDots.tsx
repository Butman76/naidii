import { CATEGORIES } from "@/data/categories";
import { getCategoryStyle } from "@/data/category-style";

// Точки-направления карточки — общий вид для карточек специалистов
// (SpecialistCard.tsx) и неподтверждённых карточек (UnclaimedCard.tsx), по
// просьбе пользователя 2026-09-28: раньше у вторых категории были
// текстовыми цветными плашками, а не такими же точками, как у всех
// остальных. Своя строка на всю ширину карточки, а не угол рядом с именем —
// при 8-9 категориях у одного специалиста туда бы просто не влезло.
export default function CategoryDots({ categories }: { categories: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {categories.map((slug) => {
        const style = getCategoryStyle(slug);
        const name = CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
        return (
          <div key={slug} className="group/dot relative flex">
            <span
              className="block h-4 w-4 rounded-full ring-2 ring-white"
              style={{
                background: `radial-gradient(circle at 32% 28%, ${style.hexLight}, ${style.hex} 65%)`,
                boxShadow:
                  "inset -1.5px -1.5px 3px rgba(0,0,0,0.30), inset 1px 1px 1.5px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.20)",
              }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/dot:opacity-100">
              {name}
              <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
