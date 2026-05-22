"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  formatPrice,
  statusBadgeVariant,
} from "@/lib/orders/format";
import type { AdminOrderRow } from "@/lib/api/admin-orders-types";

interface AdminOrderListProps {
  rows: AdminOrderRow[];
  locale: string;
  page: number;
  totalPages: number;
}

export function AdminOrderList({
  rows,
  locale,
  page,
  totalPages,
}: AdminOrderListProps) {
  const t = useTranslations("admin.orders");
  const tStatus = useTranslations("orderStatus");
  const tDelivery = useTranslations("deliveryMethod");
  const router = useRouter();

  function gotoPage(next: number) {
    const url = new URL(window.location.href);
    if (next <= 1) {
      url.searchParams.delete("page");
    } else {
      url.searchParams.set("page", String(next));
    }
    router.replace(`${url.pathname}${url.search}`, { scroll: false });
  }

  function openOrder(id: string) {
    router.push(`/admin/orders/${id}`);
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-base font-semibold">{t("empty.title")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("empty.description")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.id")}</TableHead>
              <TableHead>{t("table.customer")}</TableHead>
              <TableHead>{t("table.status")}</TableHead>
              <TableHead>{t("table.delivery")}</TableHead>
              <TableHead className="text-right">{t("table.total")}</TableHead>
              <TableHead className="text-right">{t("table.items")}</TableHead>
              <TableHead>{t("table.date")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => openOrder(row.id)}
                className="cursor-pointer"
              >
                <TableCell className="font-mono text-xs">
                  #{row.id.slice(-8)}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{row.customer.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.customer.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(row.status)}>
                    {tStatus(row.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {tDelivery(row.deliveryMethod)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatPrice(row.totalAmount, locale)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.itemCount}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(row.createdAt, locale)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {rows.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => openOrder(row.id)}
              className="flex w-full flex-col gap-2 p-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  #{row.id.slice(-8)}
                </span>
                <Badge variant={statusBadgeVariant(row.status)}>
                  {tStatus(row.status)}
                </Badge>
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  {row.customer.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {row.customer.email}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{tDelivery(row.deliveryMethod)}</span>
                <span>{formatDate(row.createdAt, locale)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {row.itemCount} × {t("table.items").toLowerCase()}
                </span>
                <span className="font-semibold tabular-nums">
                  {formatPrice(row.totalAmount, locale)}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {totalPages > 1 ? (
        <nav
          aria-label={t("pagination.label")}
          className="flex items-center justify-between gap-2 border-t border-border px-4 py-3"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => gotoPage(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            {t("pagination.prev")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("pagination.of", { page, totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => gotoPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            {t("pagination.next")}
          </Button>
        </nav>
      ) : null}
    </>
  );
}
