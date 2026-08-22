import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpecialistDashboard from "@/components/dashboard/SpecialistDashboard";
import { mockSpecialists } from "@/data/mock-specialists";

export const metadata: Metadata = {
  title: "Личный кабинет специалиста — НайдИИ",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  const specialist = mockSpecialists[0];

  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <SpecialistDashboard specialist={specialist} />
      </main>
      <Footer />
    </>
  );
}
