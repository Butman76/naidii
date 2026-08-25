"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { pbClient } from "@/lib/auth-client";

type Status = "checking" | "success" | "error";

// Ссылка из письма ведёт на /verify?token=... (не /verify/{token}) — так
// страница остаётся статическим путём без динамического сегмента, что
// нужно для STATIC_EXPORT-сборки на GitHub Pages (см. next.config.ts):
// сгенерировать заранее все возможные токены невозможно.
export default function VerifyStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    pbClient
      .collection("users")
      .confirmVerification(token)
      .then(async () => {
        if (pbClient.authStore.isValid) {
          try {
            // Обновляем запись в authStore, чтобы RequireAuth сразу увидел
            // verified: true, если письмо открыли в той же сессии/вкладке.
            await pbClient.collection("users").authRefresh();
          } catch {
            // сессия могла протухнуть - не критично, ниже всё равно есть
            // ссылка на /login
          }
        }
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  if (status === "checking") {
    return <p className="text-sm text-zinc-500">Подтверждаем почту…</p>;
  }

  if (status === "success") {
    return (
      <>
        <h1 className="text-lg font-bold text-zinc-900">Почта подтверждена</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Аккаунт активирован, можно пользоваться кабинетом.
        </p>
        <button
          type="button"
          onClick={() =>
            router.push(pbClient.authStore.isValid ? "/dashboard" : "/login")
          }
          className="mt-5 w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          {pbClient.authStore.isValid ? "В кабинет" : "Войти"}
        </button>
      </>
    );
  }

  return (
    <>
      <h1 className="text-lg font-bold text-zinc-900">Ссылка не сработала</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Возможно, она уже использована или устарела. Запросите новое письмо
        со страницы входа в кабинет.
      </p>
      <Link
        href="/login"
        className="mt-5 inline-block text-sm font-medium text-zinc-900 underline"
      >
        Перейти ко входу
      </Link>
    </>
  );
}
