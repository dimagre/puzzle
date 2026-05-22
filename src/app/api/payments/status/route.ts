import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/api/profile-guard";
import {
  fromZodError,
  internalError,
  notFound,
} from "@/lib/api/errors";
import { paymentStatusQuerySchema } from "@/lib/validation/payments";

export const dynamic = "force-dynamic";

type PublicPaymentStatus = "pending" | "success" | "failure";

function derive(
  paymentStatuses: ReadonlyArray<"PENDING" | "SUCCESS" | "FAILURE" | "REVERSED">,
  orderStatus: string,
): PublicPaymentStatus {
  if (orderStatus === "CONFIRMED") return "success";
  if (paymentStatuses.includes("SUCCESS")) return "success";
  if (paymentStatuses.length === 0) return "pending";
  if (paymentStatuses.every((s) => s === "FAILURE" || s === "REVERSED")) {
    return "failure";
  }
  return "pending";
}

export async function GET(req: NextRequest) {
  const guard = await requireSessionUser();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const parsed = paymentStatusQuerySchema.safeParse({
    orderId: url.searchParams.get("orderId"),
  });
  if (!parsed.success) return fromZodError(parsed.error);

  try {
    const order = await prisma.order.findFirst({
      where: { id: parsed.data.orderId, userId: guard.user.id },
      select: {
        id: true,
        status: true,
        payments: {
          where: { type: "RENTAL" },
          select: { status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) return notFound("Order not found");

    const status = derive(
      order.payments.map((p) => p.status),
      order.status,
    );

    return NextResponse.json({ orderId: order.id, status });
  } catch (err) {
    console.error("GET /api/payments/status failed", err);
    return internalError();
  }
}
