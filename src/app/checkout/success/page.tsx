import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  serializeOrderDetail,
  type OrderDetailDto,
} from "@/lib/api/profile-serialize";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatPrice,
  formatDate,
  statusBadgeVariant,
} from "@/lib/orders/format";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: { orderId?: string };
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const orderId = searchParams.orderId;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const t = await getTranslations("checkout.success");
  const tStatus = await getTranslations("orderStatus");
  const tDelivery = await getTranslations("deliveryMethod");
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "uk";

  let order: OrderDetailDto | null = null;
  if (orderId) {
    const record = await prisma.order.findFirst({
      where: { id: orderId, userId: session.user.id },
      include: {
        items: {
          include: {
            puzzle: {
              include: {
                images: { orderBy: { order: "asc" }, take: 1 },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (record) order = serializeOrderDetail(record);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
      <div className="rounded-lg border border-border bg-white p-6 sm:p-8">
        <div className="text-center">
          <p className="text-3xl">✅</p>
          <h1 className="mt-2 text-2xl font-bold text-sage sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>

        {order ? (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-muted/30 p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("orderNumber")}
                </p>
                <p className="font-mono text-sm font-semibold">
                  #{order.id.slice(-8)}
                </p>
              </div>
              <Badge variant={statusBadgeVariant(order.status)}>
                {tStatus(order.status)}
              </Badge>
            </div>

            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t("placedAt")}
                </dt>
                <dd>{formatDate(order.createdAt, locale)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t("delivery")}
                </dt>
                <dd>{tDelivery(order.deliveryMethod)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t("rentalSubtotal")}
                </dt>
                <dd className="tabular-nums">
                  {formatPrice(
                    order.totalAmount - order.depositAmount,
                    locale,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t("deposit")}
                </dt>
                <dd className="tabular-nums">
                  {formatPrice(order.depositAmount, locale)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">
                  {t("grandTotal")}
                </dt>
                <dd className="text-lg font-bold text-sage tabular-nums">
                  {formatPrice(order.totalAmount, locale)}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("orderNotFound")}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/profile">{t("viewOrders")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/catalog">{t("continueBrowsing")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
