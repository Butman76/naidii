import { NextResponse, type NextRequest } from "next/server";
import { PB_URL } from "@/lib/pocketbase";

// Персональные поддомены специалистов (например,
// visiontechnolabs.naidii.ru) — назначаются вручную в /admin, см.
// AdminPanel.tsx ("Тарифы") и pocketbase/pb_migrations/1755000043_...
// Ничего не делает для основного домена/www/локальной разработки — только
// когда хост реально является поддоменом *.naidii.ru с известным
// специалистом, прозрачно подменяет путь на /specialist/{slug}, оставляя
// адрес в браузере как есть.
const ROOT_HOSTS = new Set(["naidii.ru", "www.naidii.ru"]);

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";

  if (!host.endsWith(".naidii.ru") || ROOT_HOSTS.has(host)) {
    return NextResponse.next();
  }

  const subdomain = host.slice(0, -".naidii.ru".length);
  // Host — заголовок запроса, ему нельзя доверять напрямую: без этой
  // проверки значение ушло бы в фильтр PocketBase как есть, открывая
  // инъекцию в filter-выражение. Реальные поддомены и так проходят через
  // ту же нормализацию при записи (AdminPanel.tsx: updateSubdomain).
  if (!subdomain || subdomain === "pb" || !/^[a-z0-9-]{1,63}$/.test(subdomain)) {
    return NextResponse.next();
  }

  try {
    const res = await fetch(
      `${PB_URL}/api/collections/specialist_profiles/records?` +
        new URLSearchParams({
          filter: `subdomain = "${subdomain}" && profile_status = "published"`,
          fields: "slug",
          perPage: "1",
        }),
      { cache: "no-store" }
    );
    const data = await res.json();
    const slug = data?.items?.[0]?.slug;
    if (slug) {
      const url = request.nextUrl.clone();
      url.pathname = `/specialist/${slug}`;
      return NextResponse.rewrite(url);
    }
  } catch {
    // PocketBase недоступен или запрос не удался — отдаём обычную
    // маршрутизацию вместо падения всего сайта на этом поддомене.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
