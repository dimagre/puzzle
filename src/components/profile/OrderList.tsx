import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import type { OrderSummaryDto } from "@/lib/api/profile-serialize";
import {
  formatDate,
  formatPrice,
  statusBadgeVariant,
} from "@/lib/orders/format";

interface OrderListProps {
  orders: OrderSummaryDto[];
  locale: string;
}

export async function OrderList({ orders, locale }: OrderListProps) {
  const t = await getTranslations("profile.orders");
  const tStatus = await getTranslations("orderStatus");

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center">
        <p className="text-base font-semibold">{t("empty.title")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("empty.description")}
        </p>
        <Link
          href="/catalog"
          className="mt-4 inline-flex text-sm font-medium text-sage hover:underline"
        >
          {t("empty.cta")}
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-white">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/profile/orders/${order.id}`}
            className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  #{order.id.slice(-8)}
                </span>
                <Badge variant={statusBadgeVariant(order.status)}>
                  {tStatus(order.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.createdAt, locale)}
                {" · "}
                {t("itemCount", { count: order.itemCount })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-base font-semibold tabular-nums">
                {formatPrice(order.totalAmount, locale)}
              </p>
              <p className="text-xs text-muted-foreground">{t("total")}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
