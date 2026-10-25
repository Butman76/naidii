import { NextRequest, NextResponse } from "next/server";

// Серверная проверка токена Яндекс SmartCaptcha (см. RegisterPage.tsx) —
// секретный ключ живёт только тут (process.env, не NEXT_PUBLIC_), клиенту
// он никогда не отправляется. Без этого шага капчу на форме можно было бы
// просто не проходить и звать pb.collection("users").create() напрямую.
export async function POST(request: NextRequest) {
  let token: string | undefined;
  try {
    const body = await request.json();
    token = body.token;
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }
  if (!token || typeof token !== "string") {
    return NextResponse.json({ ok: false, error: "token required" }, { status: 400 });
  }

  const secret = process.env.YANDEX_CAPTCHA_SERVER_KEY;
  if (!secret) {
    console.error("YANDEX_CAPTCHA_SERVER_KEY is not set");
    return NextResponse.json({ ok: false, error: "captcha not configured" }, { status: 500 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  const params = new URLSearchParams({ secret, token });
  if (ip) params.set("ip", ip);

  try {
    const res = await fetch("https://smartcaptcha.yandexcloud.net/validate", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const data = await res.json();
    return NextResponse.json({ ok: data?.status === "ok" });
  } catch {
    return NextResponse.json({ ok: false, error: "validation request failed" }, { status: 502 });
  }
}
