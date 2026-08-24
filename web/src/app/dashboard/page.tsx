import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RequireAuth from "@/components/RequireAuth";
import SpecialistDashboardClient from "@/components/dashboard/SpecialistDashboardClient";

export const metadata: Metadata = {
  title: "Личный кабинет специалиста — НайдИИ",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <RequireAuth role="specialist">
          <SpecialistDashboardClient />
        </RequireAuth>
      </main>
      <Footer />
    </>
  );
}
