// Грубое определение региона по IP для журнала входов в /admin (см.
// api/log-login/route.ts, lib/admin.ts LoginLogEntry.region) — не для
// каких-либо решений в приложении, просто подсказка админу "откуда
// примерно зашли" вместо голого IP. ip-api.com — бесплатно, без ключа,
// лимит 45 запросов/мин с одного IP-сервера, что с большим запасом
// покрывает объём (несколько входов в день); своего города это не мешает,
// т.к. запрос идёт с сервера, а не с клиента.
export async function lookupRegion(ip: string): Promise<string> {
  if (!ip || isPrivateOrLocalIp(ip)) return "";
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) return "";
    const data = await res.json();
    if (data.status !== "success") return "";
    return [data.city, data.regionName, data.country].filter(Boolean).join(", ");
  } catch {
    return "";
  }
}

function isPrivateOrLocalIp(ip: string): boolean {
  return (
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}
