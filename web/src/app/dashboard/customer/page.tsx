import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RequireAuth from "@/components/RequireAuth";
import CustomerDashboardClient from "@/components/dashboard/CustomerDashboardClient";

export const metadata: Metadata = {
  title: "Личный кабинет заказчика — НайдИИ",
  robots: { index: false, follow: false },
};

export default function CustomerDashboardPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <RequireAuth role="customer">
          <CustomerDashboardClient />
        </RequireAuth>
      </main>
      <Footer />
    </>
  );
}
