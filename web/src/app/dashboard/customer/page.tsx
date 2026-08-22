import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";
import { mockSpecialists } from "@/data/mock-specialists";
import { mockCustomerFavoriteSlugs } from "@/data/customer-dashboard-mock";

export const metadata: Metadata = {
  title: "Личный кабинет заказчика — НайдИИ",
  robots: { index: false, follow: false },
};

export default function CustomerDashboardPage() {
  const favorites = mockCustomerFavoriteSlugs
    .map((slug) => mockSpecialists.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <CustomerDashboard customerName="Мария Кузнецова" favorites={favorites} />
      </main>
      <Footer />
    </>
  );
}
