import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/api/profile-guard";
import { fromZodError, internalError } from "@/lib/api/errors";
import {
  ORDERS_PAGE_SIZE_DEFAULT,
  listOrdersQuerySchema,
} from "@/lib/validation/profile";
import { serializeOrderSummary } from "@/lib/api/profile-serialize";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const guard = await requireSessionUser();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const parsed = listOrdersQuerySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) return fromZodError(parsed.error);

  const page = parsed.data.page ?? 1;
  const limit = parsed.data.limit ?? ORDERS_PAGE_SIZE_DEFAULT;

  try {
    const where = { userId: guard.user.id };
    const [total, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { items: { select: { id: true } } },
      }),
    ]);

    return NextResponse.json({
      orders: orders.map(serializeOrderSummary),
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("GET /api/profile/orders failed", err);
    return internalError();
  }
}
