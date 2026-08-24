"use client";

import CustomerDashboard from "./CustomerDashboard";
import { useAuth } from "@/lib/use-auth";
import type { Specialist } from "@/types/specialist";

// Тонкая обёртка, чтобы взять настоящее имя вошедшего заказчика — сам
// CustomerDashboard остаётся "глупым" презентационным компонентом.
export default function CustomerDashboardClient({
  favorites,
}: {
  favorites: Specialist[];
}) {
  const { user } = useAuth();
  return (
    <CustomerDashboard
      customerName={user?.name || user?.email || "Заказчик"}
      favorites={favorites}
    />
  );
}
