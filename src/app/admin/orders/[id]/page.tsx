import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { serializeAdminOrderDetail } from "@/lib/api/admin-orders-serialize";
import { AdminOrderDetailClient } from "@/components/admin/AdminOrderDetailClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const t = await getTranslations("admin.orders.detail");
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "uk";

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          deliveryRegion: true,
          deliveryCity: true,
          deliveryNovaPoshtaWarehouse: true,
        },
      },
      items: {
        include: {
          puzzle: { select: { id: true, title: true, titleEn: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      payments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) {
    notFound();
  }

  const dto = serializeAdminOrderDetail(order);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm font-medium text-sage hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("back")}
      </Link>
      <AdminOrderDetailClient order={dto} locale={locale} />
    </div>
  );
}
