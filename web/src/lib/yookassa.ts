// Тонкий клиент HTTP API ЮKassa (https://yookassa.ru/developers/api) —
// только серверный код (Route Handlers), ключи берутся из окружения VPS и в
// репозиторий не попадают. Авторизация — HTTP Basic: shopId : секретный
// ключ. Повторная отправка создания платежа с тем же Idempotence-Key не
// создаёт второй платёж (защита от двойного клика/ретрая).

const API_URL = process.env.YOOKASSA_API_URL ?? "https://api.yookassa.ru/v3";

export interface YooPayment {
  id: string;
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
  paid: boolean;
  amount: { value: string; currency: string };
  confirmation?: { type: string; confirmation_url?: string };
  metadata?: Record<string, string>;
  cancellation_details?: { party: string; reason: string };
}

export function isYooKassaConfigured(): boolean {
  return Boolean(process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY);
}

function authHeader(): string {
  const raw = `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

async function request<T>(method: "GET" | "POST", path: string, body?: unknown, idempotenceKey?: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...(idempotenceKey ? { "Idempotence-Key": idempotenceKey } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`YooKassa ${method} ${path} -> ${res.status}: ${text.slice(0, 500)}`);
  }
  return JSON.parse(text) as T;
}

export function formatAmount(rub: number): string {
  return rub.toFixed(2);
}

export interface CreatePaymentParams {
  idempotenceKey: string;
  amountRub: number;
  description: string;
  returnUrl: string;
  metadata: Record<string, string>;
  customerEmail: string;
}

export async function createPayment(params: CreatePaymentParams): Promise<YooPayment> {
  const amount = { value: formatAmount(params.amountRub), currency: "RUB" };
  const body: Record<string, unknown> = {
    amount,
    capture: true,
    confirmation: { type: "redirect", return_url: params.returnUrl },
    description: params.description.slice(0, 128),
    metadata: params.metadata,
  };

  // Чек по 54-ФЗ — только если в кабинете ЮKassa подключены "Чеки от
  // ЮKassa": иначе API отклоняет платёж с полем receipt. Включается
  // переменной YOOKASSA_SEND_RECEIPT=true; код НДС (1 = без НДС) и система
  // налогообложения — из окружения, они зависят от организации.
  if (process.env.YOOKASSA_SEND_RECEIPT === "true") {
    body.receipt = {
      customer: { email: params.customerEmail },
      items: [
        {
          description: params.description.slice(0, 128),
          quantity: "1.00",
          amount,
          vat_code: Number(process.env.YOOKASSA_VAT_CODE ?? 1),
          payment_mode: "full_payment",
          payment_subject: "service",
        },
      ],
      ...(process.env.YOOKASSA_TAX_SYSTEM_CODE
        ? { tax_system_code: Number(process.env.YOOKASSA_TAX_SYSTEM_CODE) }
        : {}),
    };
  }

  return request<YooPayment>("POST", "/payments", body, params.idempotenceKey);
}

export function getPayment(id: string): Promise<YooPayment> {
  return request<YooPayment>("GET", `/payments/${encodeURIComponent(id)}`);
}
