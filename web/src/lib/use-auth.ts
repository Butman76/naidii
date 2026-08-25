"use client";

import { useEffect, useState } from "react";
import { pbClient } from "./auth-client";
import type { AuthRecord } from "pocketbase";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "customer" | "specialist" | "moderator" | "admin";
  verified: boolean;
}

function toAuthUser(record: AuthRecord): AuthUser | null {
  if (!record) return null;
  return {
    id: record.id,
    email: record.email,
    name: record.name ?? "",
    role: record.role ?? "customer",
    verified: record.verified ?? false,
  };
}

// Реактивное состояние авторизации для клиентских компонентов (шапка,
// защита кабинетов) — подписывается на изменения pbClient.authStore,
// который сам живёт в localStorage браузера.
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() =>
    toAuthUser(pbClient.authStore.record)
  );

  useEffect(() => {
    setUser(toAuthUser(pbClient.authStore.record));
    return pbClient.authStore.onChange(() => {
      setUser(toAuthUser(pbClient.authStore.record));
    });
  }, []);

  function logout() {
    pbClient.authStore.clear();
  }

  return { user, isAuthenticated: user !== null, logout };
}
