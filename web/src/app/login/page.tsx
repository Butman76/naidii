"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pbClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const authData = await pbClient
        .collection("users")
        .authWithPassword(email, password);
      const role = authData.record.role;
      router.push(role === "specialist" ? "/dashboard" : "/dashboard/customer");
    } catch {
      setError("Не удалось войти — проверьте email и пароль.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <h1 className="text-xl font-bold text-zinc-900">Войти</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Нет аккаунта?{" "}
            <Link href="/register" className="font-medium text-zinc-900 underline">
              Зарегистрироваться
            </Link>
          </p>

          <div className="mt-5 flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-500">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500">Пароль</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {loading ? "Входим…" : "Войти"}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
