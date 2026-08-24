"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pbClient } from "@/lib/auth-client";

type Role = "customer" | "specialist";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("specialist");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Пароль должен быть не короче 8 символов.");
      return;
    }

    setLoading(true);
    try {
      await pbClient.collection("users").create({
        email,
        password,
        passwordConfirm: password,
        name,
        role,
        status: "active",
      });

      const authData = await pbClient
        .collection("users")
        .authWithPassword(email, password);

      if (role === "specialist") {
        // Черновой профиль сразу на модерацию (ТЗ §7.4) — специалист
        // дозаполняет карточку в кабинете, но сама запись должна
        // существовать сразу, чтобы можно было создавать карточки услуг.
        await pbClient.collection("specialist_profiles").create({
          user_id: authData.record.id,
          profile_type: "individual",
          public_name: name,
          slug: authData.record.id,
          profile_status: "pending",
          verified_status: false,
          rating: 0,
          reviews_count: 0,
          views_count: 0,
          leads_count: 0,
          completed_orders_count: 0,
        });
        router.push("/dashboard");
      } else {
        router.push("/dashboard/customer");
      }
    } catch {
      setError(
        "Не удалось зарегистрироваться — возможно, такой email уже занят."
      );
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
          <h1 className="text-xl font-bold text-zinc-900">Регистрация</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-medium text-zinc-900 underline">
              Войти
            </Link>
          </p>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setRole("specialist")}
              className={`flex-1 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                role === "specialist"
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              Я специалист
            </button>
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`flex-1 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                role === "customer"
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              Я заказчик
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-500">
                Имя {role === "specialist" && "/ название студии"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              />
            </div>
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
              <label className="text-xs font-medium text-zinc-500">
                Пароль (минимум 8 символов)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          {role === "specialist" && (
            <p className="mt-3 text-xs text-zinc-400">
              После регистрации профиль отправится на модерацию — дозаполнить
              его и добавить услуги можно будет сразу в кабинете.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {loading ? "Регистрируем…" : "Зарегистрироваться"}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
