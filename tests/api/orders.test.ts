import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const {
  puzzleFindMany,
  orderCreate,
  userUpdate,
  transaction,
  authMock,
} = vi.hoisted(() => ({
  puzzleFindMany: vi.fn(),
  orderCreate: vi.fn(),
  userUpdate: vi.fn(),
  transaction: vi.fn(),
  authMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    puzzle: { findMany: puzzleFindMany },
    order: { create: orderCreate },
    user: { update: userUpdate },
    $transaction: transaction,
  },
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

import { POST as createOrder } from "@/app/api/orders/route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof createOrder>[0];
}

function makePuzzle(overrides: Record<string, unknown> = {}) {
  return {
    id: "puzzle_1",
    rentalPricePerDay: new Prisma.Decimal("20.00"),
    depositAmount: new Prisma.Decimal("100.00"),
    isAvailable: true,
    isVisible: true,
    ...overrides,
  };
}

const validBody = {
  deliveryMethod: "NOVA_POSHTA" as const,
  contactName: "Олена Петренко",
  contactPhone: "+380501234567",
  deliveryRegion: "Київська",
  deliveryCity: "Київ",
  deliveryWarehouse: "Відділення №7",
  deliveryStreet: null,
  deliveryPostalCode: null,
  items: [{ puzzleId: "puzzle_1", rentalDays: 5 }],
};

describe("POST /api/orders", () => {
  beforeEach(() => {
    authMock.mockResolvedValue({ user: { id: "user_1", email: "alice@example.com" } });
    transaction.mockImplementation(async (cb: (tx: unknown) => unknown) => {
      const tx = {
        order: { create: orderCreate },
        user: { update: userUpdate },
      };
      return cb(tx);
    });
    orderCreate.mockResolvedValue({ id: "order_new" });
    userUpdate.mockResolvedValue({});
  });

  afterEach(() => {
    puzzleFindMany.mockReset();
    orderCreate.mockReset();
    userUpdate.mockReset();
    transaction.mockReset();
    authMock.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null);
    const res = await createOrder(jsonRequest(validBody));
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is invalid", async () => {
    const res = await createOrder(
      jsonRequest({ ...validBody, deliveryMethod: "BOGUS" }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when Nova Poshta address fields are missing", async () => {
    const res = await createOrder(
      jsonRequest({
        ...validBody,
        deliveryRegion: null,
        deliveryCity: null,
        deliveryWarehouse: null,
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 409 when a puzzle is no longer available", async () => {
    puzzleFindMany.mockResolvedValue([
      makePuzzle({ isAvailable: false }),
    ]);

    const res = await createOrder(jsonRequest(validBody));
    expect(res.status).toBe(409);
    const body = (await res.json()) as {
      error: { code: string; unavailablePuzzleIds: string[] };
    };
    expect(body.error.code).toBe("PUZZLES_UNAVAILABLE");
    expect(body.error.unavailablePuzzleIds).toEqual(["puzzle_1"]);
    expect(orderCreate).not.toHaveBeenCalled();
  });

  it("returns 409 when a puzzle is missing from the database", async () => {
    puzzleFindMany.mockResolvedValue([]);

    const res = await createOrder(jsonRequest(validBody));
    expect(res.status).toBe(409);
    const body = (await res.json()) as {
      error: { unavailablePuzzleIds: string[] };
    };
    expect(body.error.unavailablePuzzleIds).toEqual(["puzzle_1"]);
  });

  it("creates an order and returns the id on success", async () => {
    puzzleFindMany.mockResolvedValue([makePuzzle()]);

    const res = await createOrder(jsonRequest(validBody));
    expect(res.status).toBe(201);
    const body = (await res.json()) as { orderId: string };
    expect(body.orderId).toBe("order_new");

    expect(orderCreate).toHaveBeenCalledTimes(1);
    const callArg = orderCreate.mock.calls[0]![0] as {
      data: {
        userId: string;
        status: string;
        deliveryMethod: string;
        totalAmount: Prisma.Decimal;
        depositAmount: Prisma.Decimal;
        adminNotes: string;
        items: { create: Array<{ puzzleId: string; rentalDays: number }> };
      };
    };
    expect(callArg.data.userId).toBe("user_1");
    expect(callArg.data.status).toBe("PENDING");
    expect(callArg.data.deliveryMethod).toBe("NOVA_POSHTA");
    // 5 days * 20 + 100 deposit = 200
    expect(callArg.data.totalAmount.toString()).toBe("200");
    expect(callArg.data.depositAmount.toString()).toBe("100");
    expect(callArg.data.items.create).toEqual([
      expect.objectContaining({ puzzleId: "puzzle_1", rentalDays: 5 }),
    ]);

    const notes = JSON.parse(callArg.data.adminNotes) as {
      contactName: string;
      contactPhone: string;
      method: string;
      address: string;
    };
    expect(notes.contactName).toBe("Олена Петренко");
    expect(notes.method).toBe("NOVA_POSHTA");
    expect(notes.address).toContain("Відділення №7");

    expect(userUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user_1" },
        data: expect.objectContaining({
          deliveryRegion: "Київська",
          deliveryCity: "Київ",
          deliveryNovaPoshtaWarehouse: "Відділення №7",
        }),
      }),
    );
  });

  it("rejects duplicate puzzles in cart", async () => {
    const res = await createOrder(
      jsonRequest({
        ...validBody,
        items: [
          { puzzleId: "puzzle_1", rentalDays: 5 },
          { puzzleId: "puzzle_1", rentalDays: 7 },
        ],
      }),
    );
    expect(res.status).toBe(400);
    expect(orderCreate).not.toHaveBeenCalled();
  });

  it("does not update user delivery defaults for non-Nova-Poshta methods", async () => {
    puzzleFindMany.mockResolvedValue([makePuzzle()]);

    const res = await createOrder(
      jsonRequest({
        ...validBody,
        deliveryMethod: "SELF_PICKUP_WAREHOUSE",
        deliveryRegion: null,
        deliveryCity: null,
        deliveryWarehouse: null,
      }),
    );
    expect(res.status).toBe(201);
    expect(userUpdate).not.toHaveBeenCalled();
  });
});
