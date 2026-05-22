import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { AdminOrderFilters } from "@/components/admin/AdminOrderFilters";
import { AdminOrderList } from "@/components/admin/AdminOrderList";
import {
  ADMIN_ORDERS_PAGE_SIZE,
  ORDER_STATUS_VALUES,
} from "@/lib/validation/admin-orders";
import { serializeAdminOrderRow } from "@/lib/api/admin-orders-serialize";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: {
    customer?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: string;
  };
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const t = await getTranslations("admin.orders");
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "uk";

  const customer = searchParams?.customer?.trim() ?? "";
  const statusParam = searchParams?.status ?? "";
  const status = ORDER_STATUS_VALUES.find((s) => s === statusParam);
  const from = parseDate(searchParams?.from);
  const to = parseDate(searchParams?.to);
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status;
  if (customer) {
    where.user = {
      OR: [
        { name: { contains: customer, mode: "insensitive" } },
        { email: { contains: customer, mode: "insensitive" } },
      ],
    };
  }
  if (from || to) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (from) createdAt.gte = from;
    if (to) createdAt.lte = to;
    where.createdAt = createdAt;
  }

  const [total, orders] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_ORDERS_PAGE_SIZE,
      take: ADMIN_ORDERS_PAGE_SIZE,
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / ADMIN_ORDERS_PAGE_SIZE);
  const rows = orders.map(serializeAdminOrderRow);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("subtitle", { total })}
        </p>
      </div>

      <AdminOrderFilters
        defaults={{
          search: customer,
          status: status ?? "all",
          from: searchParams?.from ?? "",
          to: searchParams?.to ?? "",
        }}
      />

      <div className="mt-4 rounded-lg border border-border bg-white">
        <AdminOrderList
          rows={rows}
          locale={locale}
          page={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
