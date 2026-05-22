import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/auth-guard";
import { fromZodError, internalError } from "@/lib/api/errors";
import {
  ADMIN_ORDERS_PAGE_SIZE,
  listAdminOrdersQuerySchema,
} from "@/lib/validation/admin-orders";
import { serializeAdminOrderRow } from "@/lib/api/admin-orders-serialize";
import type { AdminOrderListResponse } from "@/lib/api/admin-orders-types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const parsed = listAdminOrdersQuerySchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    customer: url.searchParams.get("customer") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) return fromZodError(parsed.error);

  const page = parsed.data.page ?? 1;
  const limit = parsed.data.limit ?? ADMIN_ORDERS_PAGE_SIZE;

  const where: Prisma.OrderWhereInput = {};
  if (parsed.data.status) where.status = parsed.data.status;

  if (parsed.data.from || parsed.data.to) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (parsed.data.from) createdAt.gte = new Date(parsed.data.from);
    if (parsed.data.to) createdAt.lte = new Date(parsed.data.to);
    where.createdAt = createdAt;
  }

  if (parsed.data.customer) {
    const term = parsed.data.customer;
    where.user = {
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
      ],
    };
  }

  try {
    const [total, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);

    const response: AdminOrderListResponse = {
      orders: orders.map(serializeAdminOrderRow),
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error("GET /api/admin/orders failed", err);
    return internalError();
  }
}
