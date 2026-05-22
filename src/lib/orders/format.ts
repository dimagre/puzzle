import { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_VALUES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
];

export function statusBadgeVariant(
  status: OrderStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "DELIVERED":
    case "RETURNED":
      return "default";
    case "CONFIRMED":
    case "SHIPPED":
      return "secondary";
    case "CANCELLED":
      return "destructive";
    case "PENDING":
    default:
      return "outline";
  }
}

const PRICE_FORMATTERS: Record<string, Intl.NumberFormat> = {};

export function formatPrice(value: number, locale: string): string {
  if (!PRICE_FORMATTERS[locale]) {
    PRICE_FORMATTERS[locale] = new Intl.NumberFormat(
      locale === "uk" ? "uk-UA" : "en-US",
      { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    );
  }
  return `${PRICE_FORMATTERS[locale].format(value)} ₴`;
}

const DATE_FORMATTERS: Record<string, Intl.DateTimeFormat> = {};

export function formatDate(iso: string, locale: string): string {
  if (!DATE_FORMATTERS[locale]) {
    DATE_FORMATTERS[locale] = new Intl.DateTimeFormat(
      locale === "uk" ? "uk-UA" : "en-US",
      { year: "numeric", month: "short", day: "numeric" },
    );
  }
  return DATE_FORMATTERS[locale].format(new Date(iso));
}
