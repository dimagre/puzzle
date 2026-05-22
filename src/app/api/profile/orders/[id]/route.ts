import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/api/profile-guard";
import { internalError, notFound } from "@/lib/api/errors";
import { serializeOrderDetail } from "@/lib/api/profile-serialize";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const guard = await requireSessionUser();
  if (!guard.ok) return guard.response;

  const { id } = params;
  try {
    const order = await prisma.order.findFirst({
      where: { id, userId: guard.user.id },
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
    if (!order) return notFound("Order not found");
    return NextResponse.json(serializeOrderDetail(order));
  } catch (err) {
    console.error(`GET /api/profile/orders/${id} failed`, err);
    return internalError();
  }
}
