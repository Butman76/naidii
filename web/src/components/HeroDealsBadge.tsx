import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

// Круглая плашка "ТУТ НОВЫЕ ЗАКАЗЫ" поверх карусели на главной (2026-08-30).
// С 2026-10-17 ведёт всем на публичную страницу /orders — открытые заказы без
// данных заказчиков; специалист откликается оттуда (в свою "Доску объявлений"
// кабинета, SpecialistJobBoard.tsx), гости видят, что заказы есть.
const BADGE_CLASSES =
  "absolute -top-4 right-2 z-30 h-20 w-20 -rotate-6 drop-shadow-lg transition-transform duration-200 hover:-rotate-2 hover:scale-105 sm:-top-6 sm:right-4 sm:h-24 sm:w-24 md:-top-8 md:right-6 md:h-28 md:w-28 lg:h-32 lg:w-32";

export default function HeroDealsBadge() {
  return (
    <Link href="/orders" aria-label="Тут новые заказы — открыть список заказов" className={BADGE_CLASSES}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer */}
      <img src={withBasePath("/badges/tut-novye-zakazy.webp")} alt="Тут новые заказы" className="h-full w-full" />
    </Link>
  );
}
