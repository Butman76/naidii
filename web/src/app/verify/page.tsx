import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VerifyStatus from "./VerifyStatus";

export default function VerifyEmailPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-24">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 text-center">
          <Suspense
            fallback={<p className="text-sm text-zinc-500">Подтверждаем почту…</p>}
          >
            <VerifyStatus />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
