import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/api/profile-guard";
import {
  badRequest,
  conflict,
  fromZodError,
  internalError,
} from "@/lib/api/errors";
import { createOrderSchema } from "@/lib/validation/checkout";
import { notifyAdminOfNewOrder } from "@/lib/email/notify";

export const dynamic = "force-dynamic";

function buildAddressLine(input: {
  deliveryMethod: string;
  deliveryRegion: string | null;
  deliveryCity: string | null;
  deliveryWarehouse: string | null;
  deliveryStreet: string | null;
  deliveryPostalCode: string | null;
}): string | null {
  switch (input.deliveryMethod) {
    case "NOVA_POSHTA": {
      const parts = [
        input.deliveryRegion,
        input.deliveryCity,
        input.deliveryWarehouse,
      ].filter(Boolean);
      return parts.length ? parts.join(", ") : null;
    }
    case "UKRPOSHTA": {
      const parts = [
        input.deliveryRegion,
        input.deliveryCity,
        input.deliveryStreet,
        input.deliveryPostalCode,
      ].filter(Boolean);
      return parts.length ? parts.join(", ") : null;
    }
    case "SELF_PICKUP_WAREHOUSE":
    case "SELF_PICKUP_SELLER":
    default:
      return null;
  }
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

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  const data = parsed.data;
  const puzzleIds = Array.from(new Set(data.items.map((i) => i.puzzleId)));
  if (puzzleIds.length !== data.items.length) {
    return badRequest("Duplicate puzzles in cart");
  }

  try {
    const puzzles = await prisma.puzzle.findMany({
      where: { id: { in: puzzleIds } },
      select: {
        id: true,
        rentalPricePerDay: true,
        depositAmount: true,
        isAvailable: true,
        isVisible: true,
      },
    });

    const byId = new Map(puzzles.map((p) => [p.id, p]));
    const unavailable: string[] = [];
    for (const item of data.items) {
      const puzzle = byId.get(item.puzzleId);
      if (!puzzle || !puzzle.isAvailable || !puzzle.isVisible) {
        unavailable.push(item.puzzleId);
      }
    }
    if (unavailable.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "PUZZLES_UNAVAILABLE",
            message: "Some puzzles are no longer available",
            unavailablePuzzleIds: unavailable,
          },
        },
        { status: 409 },
      );
    }

    let totalAmount = new Prisma.Decimal(0);
    let depositTotal = new Prisma.Decimal(0);
    const itemRows = data.items.map((item) => {
      const puzzle = byId.get(item.puzzleId)!;
      const days = new Prisma.Decimal(item.rentalDays);
      const lineRental = puzzle.rentalPricePerDay.mul(days);
      totalAmount = totalAmount.add(lineRental);
      depositTotal = depositTotal.add(puzzle.depositAmount);
      return {
        puzzleId: item.puzzleId,
        rentalDays: item.rentalDays,
        pricePerDay: puzzle.rentalPricePerDay,
        depositAmount: puzzle.depositAmount,
      };
    });

    const grandTotal = totalAmount.add(depositTotal);

    const addressLine = buildAddressLine({
      deliveryMethod: data.deliveryMethod,
      deliveryRegion: data.deliveryRegion,
      deliveryCity: data.deliveryCity,
      deliveryWarehouse: data.deliveryWarehouse,
      deliveryStreet: data.deliveryStreet,
      deliveryPostalCode: data.deliveryPostalCode,
    });

    const adminNotes = JSON.stringify({
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      address: addressLine,
      method: data.deliveryMethod,
    });

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: guard.user.id,
          status: "PENDING",
          deliveryMethod: data.deliveryMethod,
          totalAmount: grandTotal,
          depositAmount: depositTotal,
          adminNotes,
          items: { create: itemRows },
        },
        select: { id: true },
      });

      if (data.deliveryMethod === "NOVA_POSHTA") {
        await tx.user.update({
          where: { id: guard.user.id },
          data: {
            deliveryRegion: data.deliveryRegion,
            deliveryCity: data.deliveryCity,
            deliveryNovaPoshtaWarehouse: data.deliveryWarehouse,
          },
        });
      }

      return created;
    });

    notifyAdminOfNewOrder({
      orderId: order.id,
      customerName: data.contactName,
      customerEmail: guard.user.email,
      totalAmount: Number(grandTotal),
      itemCount: data.items.length,
    });

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "name" in err &&
      (err as { name?: string }).name === "PUZZLES_UNAVAILABLE"
    ) {
      return conflict("Some puzzles are no longer available");
    }
    console.error("POST /api/orders failed", err);
    return internalError();
  }
}
