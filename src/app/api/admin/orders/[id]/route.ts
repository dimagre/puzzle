import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/auth-guard";
import {
  badRequest,
  fromZodError,
  internalError,
  notFound,
} from "@/lib/api/errors";
import {
  isValidStatusTransition,
  updateAdminOrderSchema,
} from "@/lib/validation/admin-orders";
import {
  mergeAdminNotes,
  serializeAdminOrderDetail,
} from "@/lib/api/admin-orders-serialize";
import { notifyOrderStatusChange } from "@/lib/email/notify";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

const ORDER_FULL_INCLUDE = {
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
} satisfies Prisma.OrderInclude;

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: ORDER_FULL_INCLUDE,
    });
    if (!order) return notFound("Order not found");
    return NextResponse.json(serializeAdminOrderDetail(order));
  } catch (err) {
    console.error(`GET /api/admin/orders/${id} failed`, err);
    return internalError();
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Body must be valid JSON");
  }

  const parsed = updateAdminOrderSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);
  const input = parsed.data;

  try {
    const existing = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        trackingNumber: true,
        adminNotes: true,
      },
    });
    if (!existing) return notFound("Order not found");

    const data: Prisma.OrderUpdateInput = {};

    if (input.status !== undefined) {
      if (!isValidStatusTransition(existing.status, input.status)) {
        return badRequest(
          `Invalid status transition from ${existing.status} to ${input.status}`,
          {
            from: existing.status,
            to: input.status,
          },
        );
      }
      const targetTracking =
        input.trackingNumber !== undefined
          ? input.trackingNumber
          : existing.trackingNumber;
      if (
        input.status === "SHIPPED" &&
        (!targetTracking || targetTracking.trim().length === 0)
      ) {
        return badRequest("Tracking number is required to ship the order", {
          field: "trackingNumber",
        });
      }
      data.status = input.status;
    }

    if (input.trackingNumber !== undefined) {
      const trimmed =
        typeof input.trackingNumber === "string"
          ? input.trackingNumber.trim()
          : null;
      data.trackingNumber = trimmed && trimmed.length > 0 ? trimmed : null;
    }

    if (input.adminNotes !== undefined) {
      const trimmed =
        typeof input.adminNotes === "string" ? input.adminNotes.trim() : null;
      data.adminNotes = mergeAdminNotes({
        rawNotes: existing.adminNotes,
        newNotesField: trimmed && trimmed.length > 0 ? trimmed : null,
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data,
      include: ORDER_FULL_INCLUDE,
    });

    if (input.status !== undefined && input.status !== existing.status) {
      notifyOrderStatusChange({
        orderId: updated.id,
        status: updated.status,
        customerName: updated.user.name,
        customerEmail: updated.user.email,
        trackingNumber: updated.trackingNumber,
      });
    }

    return NextResponse.json(serializeAdminOrderDetail(updated));
  } catch (err) {
    console.error(`PATCH /api/admin/orders/${id} failed`, err);
    return internalError();
  }
}
