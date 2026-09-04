import type { Metadata } from "next";
import { Suspense } from "react";
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
          {/* SpecialistDashboard reads ?tab= (see HeroDealsBadge deep link)
              via useSearchParams — Next.js requires a Suspense boundary
              around any client component that uses it, even outside
              static export. */}
          <Suspense fallback={null}>
            <SpecialistDashboardClient />
          </Suspense>
        </RequireAuth>
      </main>
      <Footer />
    </>
  );
}
