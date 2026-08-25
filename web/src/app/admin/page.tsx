import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RequireAuth from "@/components/RequireAuth";
import AdminPanel from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Админ-панель — НайдИИ",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <RequireAuth role={["admin", "moderator"]}>
          <AdminPanel />
        </RequireAuth>
      </main>
      <Footer />
    </>
  );
}
