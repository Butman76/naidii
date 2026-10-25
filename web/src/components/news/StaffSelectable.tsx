"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/use-auth";

// Сайт глобально запрещает выделять текст (globals.css, `* { user-select:
// none }`). Для текста новостей и статей — исключение: копировать его могут
// только администраторы (роли "суперадмин" в системе нет, это тот же
// "admin"). Остальным, включая модератора и гостей, текст остаётся
// невыделяемым. Это защита от случайного копирования, не от
// целенаправленного: текст всё равно отдаётся в HTML страницы.
export default function StaffSelectable({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return <div className={user?.role === "admin" ? "staff-selectable" : undefined}>{children}</div>;
}
