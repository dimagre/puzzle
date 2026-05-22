"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  formatDate,
  formatPrice,
  statusBadgeVariant,
} from "@/lib/orders/format";
import { ALLOWED_ORDER_TRANSITIONS } from "@/lib/validation/admin-orders";
import type {
  AdminOrderDetail,
  AdminOrderPayment,
} from "@/lib/api/admin-orders-types";
import type { OrderStatus } from "@prisma/client";

interface AdminOrderDetailClientProps {
  order: AdminOrderDetail;
  locale: string;
}

export function AdminOrderDetailClient({
  order,
  locale,
}: AdminOrderDetailClientProps) {
  const t = useTranslations("admin.orders.detail");
  const tStatus = useTranslations("orderStatus");
  const tDelivery = useTranslations("deliveryMethod");
  const tPaymentType = useTranslations("admin.orders.paymentType");
  const tPaymentStatus = useTranslations("admin.orders.paymentStatus");
  const router = useRouter();
  const { toast } = useToast();

  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [notes, setNotes] = useState(order.adminNotes ?? "");
  const [savingTracking, setSavingTracking] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [pendingTransition, setPendingTransition] =
    useState<OrderStatus | null>(null);

  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.pricePerDay * item.rentalDays,
    0,
  );

  async function patch(body: Record<string, unknown>): Promise<{
    ok: boolean;
    message?: string;
  }> {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let message: string | undefined;
        try {
          const data = (await res.json()) as {
            error?: { message?: string };
          };
          message = data?.error?.message;
        } catch {
          message = `HTTP ${res.status}`;
        }
        return { ok: false, message };
      }
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "Request failed",
      };
    }
  }

  async function handleSaveTracking() {
    setSavingTracking(true);
    const trimmed = tracking.trim();
    const res = await patch({ trackingNumber: trimmed.length > 0 ? trimmed : null });
    setSavingTracking(false);
    if (!res.ok) {
      toast({
        title: t("savedTrackingFailed"),
        description: res.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: t("savedTracking") });
    router.refresh();
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    const trimmed = notes.trim();
    const res = await patch({ adminNotes: trimmed.length > 0 ? trimmed : null });
    setSavingNotes(false);
    if (!res.ok) {
      toast({
        title: t("savedNotesFailed"),
        description: res.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: t("savedNotes") });
    router.refresh();
  }

  async function handleTransition(next: OrderStatus) {
    setPendingTransition(next);
    const res = await patch({ status: next });
    setPendingTransition(null);
    if (!res.ok) {
      toast({
        title: t("transitionFailed"),
        description: res.message,
        variant: "destructive",
      });
      return;
    }
    router.refresh();
  }

  const allowedTransitions = ALLOWED_ORDER_TRANSITIONS[order.status];
  const trackingTrimmed = tracking.trim();
  const trackingDirty = trackingTrimmed !== (order.trackingNumber ?? "");
  const notesDirty = notes.trim() !== (order.adminNotes ?? "");

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("title", { id: order.id.slice(-8) })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("createdAt")}: {formatDate(order.createdAt, locale)}
            {" · "}
            {t("updatedAt")}: {formatDate(order.updatedAt, locale)}
          </p>
        </div>
        <Badge variant={statusBadgeVariant(order.status)} className="self-start">
          {tStatus(order.status)}
        </Badge>
      </header>

      <section className="rounded-lg border border-border bg-white p-5 sm:p-6">
        <h2 className="mb-3 text-lg font-semibold">{t("transitionsHeading")}</h2>
        {allowedTransitions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("transitionsEmpty")}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allowedTransitions.map((next) => {
              const needsTracking =
                next === "SHIPPED" && trackingTrimmed.length === 0;
              const isPending = pendingTransition === next;
              return (
                <div key={next} className="flex flex-col gap-1">
                  <Button
                    type="button"
                    onClick={() => handleTransition(next)}
                    disabled={
                      pendingTransition !== null || needsTracking
                    }
                    variant={next === "CANCELLED" ? "outline" : "default"}
                  >
                    {isPending
                      ? t("transitionApplying")
                      : t("transitionConfirm", { status: tStatus(next) })}
                  </Button>
                  {needsTracking ? (
                    <span className="text-xs text-muted-foreground">
                      {t("transitionShippedNeedsTracking")}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">{t("customerHeading")}</h2>
          <dl className="space-y-2 text-sm">
            <Field label={t("customerName")} value={order.customer.name} />
            <Field label={t("customerEmail")} value={order.customer.email} />
            <Field
              label={t("customerPhone")}
              value={
                order.delivery.contactPhone ??
                order.customer.phone ??
                t("phoneNotSet")
              }
            />
          </dl>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">{t("deliveryHeading")}</h2>
          <dl className="space-y-2 text-sm">
            <Field
              label={t("deliveryMethod")}
              value={tDelivery(order.deliveryMethod)}
            />
            <Field
              label={t("deliveryAddress")}
              value={order.delivery.address ?? t("deliveryAddressNotSet")}
            />
          </dl>

          <div className="mt-4 space-y-2">
            <Label htmlFor="tracking-number">{t("trackingNumber")}</Label>
            <Input
              id="tracking-number"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder={t("trackingPlaceholder")}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={handleSaveTracking}
                disabled={savingTracking || !trackingDirty}
              >
                {savingTracking ? t("savingTracking") : t("saveTracking")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-5 sm:p-6">
        <h2 className="mb-3 text-lg font-semibold">{t("itemsHeading")}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("itemsHeading")}</TableHead>
              <TableHead className="text-right">
                {t("itemRentalDays", { days: "—" })}
              </TableHead>
              <TableHead className="text-right">{t("itemPricePerDay")}</TableHead>
              <TableHead className="text-right">{t("itemDeposit")}</TableHead>
              <TableHead className="text-right">{t("itemSubtotal")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item) => {
              const title =
                locale === "en" ? item.puzzle.titleEn : item.puzzle.title;
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{title}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {t("itemRentalDays", { days: item.rentalDays })}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(item.pricePerDay, locale)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(item.depositAmount, locale)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(item.pricePerDay * item.rentalDays, locale)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="mt-4 flex flex-col items-end gap-1 text-sm">
          <SummaryRow
            label={t("rentalSubtotal")}
            value={formatPrice(itemsTotal, locale)}
          />
          <SummaryRow
            label={t("deposit")}
            value={formatPrice(order.depositAmount, locale)}
          />
          <SummaryRow
            label={t("total")}
            value={formatPrice(order.totalAmount, locale)}
            emphasize
          />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-5 sm:p-6">
        <h2 className="mb-3 text-lg font-semibold">{t("paymentsHeading")}</h2>
        {order.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("paymentsEmpty")}</p>
        ) : (
          <PaymentsTable
            payments={order.payments}
            locale={locale}
            tType={(value) => tPaymentType(value)}
            tStatus={(value) => tPaymentStatus(value)}
            labels={{
              type: t("paymentType"),
              status: t("paymentStatus"),
              amount: t("paymentAmount"),
              invoice: t("paymentInvoice"),
              ref: t("paymentRef"),
              date: t("paymentDate"),
            }}
          />
        )}
      </section>

      <section className="rounded-lg border border-border bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold">{t("notesHeading")}</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          {t("notesDescription")}
        </p>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder={t("notesPlaceholder")}
        />
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={handleSaveNotes}
            disabled={savingNotes || !notesDirty}
          >
            {savingNotes ? t("savingNotes") : t("saveNotes")}
          </Button>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`flex w-full max-w-xs items-center justify-between ${
        emphasize ? "text-base font-semibold" : "text-sm"
      }`}
    >
      <span className={emphasize ? "" : "text-muted-foreground"}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

interface PaymentsTableProps {
  payments: AdminOrderPayment[];
  locale: string;
  labels: {
    type: string;
    status: string;
    amount: string;
    invoice: string;
    ref: string;
    date: string;
  };
  tType: (value: AdminOrderPayment["type"]) => string;
  tStatus: (value: AdminOrderPayment["status"]) => string;
}

function PaymentsTable({
  payments,
  locale,
  labels,
  tType,
  tStatus,
}: PaymentsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{labels.type}</TableHead>
            <TableHead>{labels.status}</TableHead>
            <TableHead className="text-right">{labels.amount}</TableHead>
            <TableHead>{labels.invoice}</TableHead>
            <TableHead>{labels.ref}</TableHead>
            <TableHead>{labels.date}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{tType(payment.type)}</TableCell>
              <TableCell>{tStatus(payment.status)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatPrice(payment.amount, locale)}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {payment.monoInvoiceId.slice(-12)}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {payment.monoPaymentRef
                  ? payment.monoPaymentRef.slice(-12)
                  : "—"}
              </TableCell>
              <TableCell className="text-sm">
                {formatDate(payment.createdAt, locale)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
