import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/api/profile-guard";
import {
  badRequest,
  conflict,
  fromZodError,
  internalError,
  notFound,
} from "@/lib/api/errors";
import { createPaymentSchema } from "@/lib/validation/payments";
import { createInvoice, uahToKopecks } from "@/lib/payments/monobank";

export const dynamic = "force-dynamic";

class ConcurrentPaymentError extends Error {}

function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured");
  }
  return url.replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
  const guard = await requireSessionUser();
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = createPaymentSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const { orderId } = parsed.data;

  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: guard.user.id },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        payments: {
          select: { id: true, status: true, type: true },
        },
      },
    });

    if (!order) return notFound("Order not found");
    if (order.status !== "PENDING") {
      return conflict("Order is not pending payment");
    }

    const activeRental = order.payments.find(
      (p) =>
        p.type === "RENTAL" &&
        (p.status === "SUCCESS" || p.status === "PENDING"),
    );
    if (activeRental?.status === "SUCCESS") {
      return conflict("Order is already paid");
    }
    if (activeRental?.status === "PENDING") {
      return conflict("Order already has an active payment in progress");
    }

    const appUrl = getAppUrl();
    const amountKopecks = uahToKopecks(order.totalAmount);
    if (amountKopecks <= 0) {
      return badRequest("Order has no payable amount");
    }

    const invoice = await createInvoice({
      amount: amountKopecks,
      reference: order.id,
      redirectUrl: `${appUrl}/checkout/payment-result?orderId=${encodeURIComponent(order.id)}`,
      webHookUrl: `${appUrl}/api/payments/webhook`,
    });

    try {
      await prisma.$transaction(
        async (tx) => {
          const existing = await tx.payment.findFirst({
            where: {
              orderId: order.id,
              type: "RENTAL",
              status: { in: ["PENDING", "SUCCESS"] },
            },
            select: { id: true },
          });
          if (existing) {
            throw new ConcurrentPaymentError();
          }
          await tx.payment.create({
            data: {
              orderId: order.id,
              type: "RENTAL",
              status: "PENDING",
              amount: order.totalAmount,
              monoInvoiceId: invoice.invoiceId,
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (err) {
      if (err instanceof ConcurrentPaymentError) {
        return conflict("Order already has an active payment in progress");
      }
      throw err;
    }

    return NextResponse.json({ paymentUrl: invoice.pageUrl });
  } catch (err) {
    console.error("POST /api/payments/create failed", err);
    return internalError();
  }
}
