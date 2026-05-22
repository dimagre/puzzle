const MONOBANK_API_BASE = "https://api.monobank.ua";

export interface MonoCreateInvoiceParams {
  amount: number;
  reference: string;
  redirectUrl: string;
  webHookUrl: string;
  destination?: string;
}

export interface MonoCreateInvoiceResult {
  invoiceId: string;
  pageUrl: string;
}

export interface MonoInvoiceStatus {
  invoiceId: string;
  status: "created" | "processing" | "hold" | "success" | "failure" | "reversed" | "expired";
  failureReason?: string;
  errCode?: string;
  amount?: number;
  modifiedDate?: string;
  reference?: string;
  paymentInfo?: {
    rrn?: string;
    paymentSystem?: string;
  };
}

function getToken(): string {
  const token = process.env.MONOBANK_TOKEN;
  if (!token) {
    throw new Error("MONOBANK_TOKEN is not configured");
  }
  return token;
}

async function monoFetch<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${MONOBANK_API_BASE}${path}`, {
    ...init,
    headers: {
      "X-Token": getToken(),
      "content-type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      const parsed = JSON.parse(text) as { errText?: string; errCode?: string };
      detail = parsed.errText ?? parsed.errCode ?? text;
    } catch {
      // keep raw text
    }
    throw new Error(`Monobank request failed (${res.status}): ${detail}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Monobank returned invalid JSON");
  }
}

export async function createInvoice(
  params: MonoCreateInvoiceParams,
): Promise<MonoCreateInvoiceResult> {
  return monoFetch<MonoCreateInvoiceResult>("/api/merchant/invoice/create", {
    method: "POST",
    body: JSON.stringify({
      amount: params.amount,
      ccy: 980,
      merchantPaymInfo: {
        reference: params.reference,
        destination: params.destination ?? `Order ${params.reference}`,
      },
      redirectUrl: params.redirectUrl,
      webHookUrl: params.webHookUrl,
    }),
  });
}

export async function getInvoiceStatus(
  invoiceId: string,
): Promise<MonoInvoiceStatus> {
  const url = `/api/merchant/invoice/status?invoiceId=${encodeURIComponent(invoiceId)}`;
  return monoFetch<MonoInvoiceStatus>(url, { method: "GET" });
}

export function uahToKopecks(amount: { toString(): string }): number {
  const str = amount.toString();
  const [whole, fraction = ""] = str.split(".");
  const padded = (fraction + "00").slice(0, 2);
  const wholeNum = Number.parseInt(whole, 10);
  const fracNum = Number.parseInt(padded, 10);
  if (Number.isNaN(wholeNum) || Number.isNaN(fracNum)) {
    throw new Error(`Invalid amount: ${str}`);
  }
  const sign = wholeNum < 0 || str.startsWith("-") ? -1 : 1;
  return sign * (Math.abs(wholeNum) * 100 + fracNum);
}
