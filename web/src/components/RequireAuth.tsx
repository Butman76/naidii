"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type AuthUser } from "@/lib/use-auth";
import { pbClient } from "@/lib/auth-client";

// Реальная защита кабинетов через PocketBase-сессию в браузере — раньше
// /dashboard открывался вообще без проверки. Содержимое кабинетов пока
// всё ещё на моках (см. STATUS.md) — этот компонент только решает,
// пускать ли на страницу и правильная ли роль у вошедшего.
export default function RequireAuth({
  role,
  children,
}: {
  role: AuthUser["role"];
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user && user.role !== role) {
      router.replace("/");
    }
  }, [isAuthenticated, user, role, router]);

  if (!isAuthenticated || !user || user.role !== role) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-sm text-zinc-500">
        Проверяем авторизацию…
      </div>
    );
  }

  if (!user.verified) {
    return <VerifyEmailGate email={user.email} />;
  }

  return <>{children}</>;
}

function VerifyEmailGate({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function resend() {
    setState("sending");
    try {
      await pbClient.collection("users").requestVerification(email);
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 text-center">
        <h1 className="text-lg font-bold text-zinc-900">Подтвердите почту</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Мы отправили письмо со ссылкой активации на <b>{email}</b>. Перейдите
          по ней, чтобы открыть кабинет.
        </p>
        <button
          type="button"
          onClick={resend}
          disabled={state === "sending"}
          className="mt-5 w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {state === "sending" ? "Отправляем…" : "Отправить письмо ещё раз"}
        </button>
        {state === "sent" && (
          <p className="mt-3 text-sm text-emerald-600">Письмо отправлено.</p>
        )}
        {state === "error" && (
          <p className="mt-3 text-sm text-red-600">
            Не получилось отправить письмо — попробуйте позже.
          </p>
        )}
      </div>
    </div>
  );
}
