import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getInvoiceStatus, type MonoInvoiceStatus } from "@/lib/payments/monobank";
import { monoWebhookBodySchema } from "@/lib/validation/payments";

export const dynamic = "force-dynamic";

const SUCCESS_STATUSES = new Set(["success"]);
const FAILURE_STATUSES = new Set(["failure", "expired", "reversed"]);

function mapStatus(status: MonoInvoiceStatus["status"]):
  | "PENDING"
  | "SUCCESS"
  | "FAILURE"
  | "REVERSED" {
  if (SUCCESS_STATUSES.has(status)) return "SUCCESS";
  if (status === "reversed") return "REVERSED";
  if (FAILURE_STATUSES.has(status)) return "FAILURE";
  return "PENDING";
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const parsed = monoWebhookBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const { invoiceId } = parsed.data;

  try {
    const invoice = await getInvoiceStatus(invoiceId);
    const mapped = mapStatus(invoice.status);

    const payment = await prisma.payment.findUnique({
      where: { monoInvoiceId: invoiceId },
      select: { id: true, orderId: true, type: true, status: true },
    });

    if (!payment) {
      console.warn(`Webhook for unknown invoice ${invoiceId}`);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (payment.status === "SUCCESS" && mapped !== "REVERSED") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: mapped,
          monoPaymentRef: invoice.paymentInfo?.rrn ?? null,
        },
      });

      if (mapped === "SUCCESS" && payment.type === "RENTAL") {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: "CONFIRMED" },
        });
      }
    });
  } catch (err) {
    console.error("Webhook processing failed", err);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
