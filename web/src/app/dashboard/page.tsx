import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RequireAuth from "@/components/RequireAuth";
import SpecialistDashboard from "@/components/dashboard/SpecialistDashboard";
import { mockSpecialists } from "@/data/mock-specialists";

export const metadata: Metadata = {
  title: "Личный кабинет специалиста — НайдИИ",
  robots: { index: false, follow: false },
};

// Кабинет теперь требует настоящего входа как специалист (RequireAuth),
// но содержимое внутри пока всё ещё демо-мокап (см. STATUS.md) — вход
// защищён по-настоящему, данные внутри ещё нет.
export default function DashboardPage() {
  const specialist = mockSpecialists[0];

  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <RequireAuth role="specialist">
          <SpecialistDashboard specialist={specialist} />
        </RequireAuth>
      </main>
      <Footer />
    </>
  );
}
