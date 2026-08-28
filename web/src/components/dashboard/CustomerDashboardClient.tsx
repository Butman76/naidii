"use client";

import { useEffect, useState } from "react";
import { pbClient } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";
import { fetchOwnCustomerDashboard, type CustomerDashboardData } from "@/lib/dashboard";
import CustomerDashboard from "./CustomerDashboard";

// Тонкая обёртка, чтобы взять настоящее имя и реальные заявки/отзывы
// вошедшего заказчика — сам CustomerDashboard остаётся "глупым"
// презентационным компонентом.
export default function CustomerDashboardClient() {
  const { user } = useAuth();
  const [data, setData] = useState<CustomerDashboardData | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchOwnCustomerDashboard(pbClient, user.id).then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-sm text-zinc-500">
        Загружаем ваш кабинет…
      </div>
    );
  }

  return (
    <CustomerDashboard
      customerName={user?.name || user?.email || "Заказчик"}
      userId={user!.id}
      leads={data.leads}
      reviews={data.reviews}
    />
  );
}
