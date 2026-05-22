import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  formatPrice,
  statusBadgeVariant,
} from "@/lib/orders/format";
import { serializeOrderDetail } from "@/lib/api/profile-serialize";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function OrderDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const t = await getTranslations("profile.orderDetail");
  const tStatus = await getTranslations("orderStatus");
  const tDelivery = await getTranslations("deliveryMethod");
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "uk";

  const orderRecord = await prisma.order.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      items: {
        include: {
          puzzle: {
            include: { images: { orderBy: { order: "asc" }, take: 1 } },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!orderRecord) {
    notFound();
  }

  const order = serializeOrderDetail(orderRecord);
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.pricePerDay * item.rentalDays,
    0,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
      <Link
        href="/profile#orders"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-sage hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("back")}
      </Link>

      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("title", { id: order.id.slice(-8) })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(order.createdAt, locale)}
          </p>
        </div>
        <Badge variant={statusBadgeVariant(order.status)} className="self-start">
          {tStatus(order.status)}
        </Badge>
      </header>

      <section className="space-y-3 rounded-lg border border-border bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold">{t("itemsHeading")}</h2>
        <ul className="divide-y divide-border">
          {order.items.map((item) => {
            const title = locale === "en" ? item.puzzle.titleEn : item.puzzle.title;
            const lineTotal = item.pricePerDay * item.rentalDays;
            return (
              <li
                key={item.id}
                className="flex items-start gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-cream">
                  {item.puzzle.imageUrl ? (
                    <Image
                      src={item.puzzle.imageUrl}
                      alt={title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/catalog/${item.puzzle.id}`}
                    className="block truncate text-sm font-medium text-foreground hover:underline"
                  >
                    {title}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("itemMeta", {
                      days: item.rentalDays,
                      price: formatPrice(item.pricePerDay, locale),
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatPrice(lineTotal, locale)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6 grid gap-4 rounded-lg border border-border bg-white p-5 sm:grid-cols-2 sm:p-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("delivery")}
          </p>
          <p className="mt-1 text-sm font-medium">
            {tDelivery(order.deliveryMethod)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("trackingNumber")}
          </p>
          <p className="mt-1 text-sm font-medium">
            {order.trackingNumber ?? t("trackingNotSet")}
          </p>
        </div>
      </section>

      <section className="mt-6 space-y-2 rounded-lg border border-border bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold">{t("summaryHeading")}</h2>
        <SummaryRow label={t("itemsTotal")} value={formatPrice(itemsTotal, locale)} />
        <SummaryRow
          label={t("deposit")}
          value={formatPrice(order.depositAmount, locale)}
        />
        <div className="my-2 border-t border-border" />
        <SummaryRow
          label={t("total")}
          value={formatPrice(order.totalAmount, locale)}
          emphasize
        />
      </section>
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
      className={`flex items-center justify-between ${
        emphasize ? "text-base font-semibold" : "text-sm"
      }`}
    >
      <span className={emphasize ? "" : "text-muted-foreground"}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
