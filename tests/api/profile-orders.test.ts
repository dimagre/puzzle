import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { orderFindMany, orderCount, orderFindFirst, transaction, authMock } =
  vi.hoisted(() => ({
    orderFindMany: vi.fn(),
    orderCount: vi.fn(),
    orderFindFirst: vi.fn(),
    transaction: vi.fn(),
    authMock: vi.fn(),
  }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findMany: orderFindMany, count: orderCount, findFirst: orderFindFirst },
    $transaction: transaction,
  },
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

import { GET as ordersList } from "@/app/api/profile/orders/route";
import { GET as orderDetail } from "@/app/api/profile/orders/[id]/route";

function listRequest(url = "http://localhost/api/profile/orders") {
  return new Request(url);
}

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "order_1",
    status: "PENDING",
    deliveryMethod: "NOVA_POSHTA",
    trackingNumber: null,
    adminNotes: null,
    totalAmount: { toString: () => "100.00" } as unknown as number,
    depositAmount: { toString: () => "50.00" } as unknown as number,
    userId: "user_1",
    createdAt: new Date("2026-05-01T10:00:00Z"),
    updatedAt: new Date("2026-05-01T10:00:00Z"),
    items: [{ id: "item_1" }],
    ...overrides,
  };
}

describe("profile orders API", () => {
  beforeEach(() => {
    authMock.mockResolvedValue({ user: { id: "user_1", email: "alice@example.com" } });
    transaction.mockImplementation((ops) => Promise.all(ops));
  });

  afterEach(() => {
    orderFindMany.mockReset();
    orderCount.mockReset();
    orderFindFirst.mockReset();
    transaction.mockReset();
    authMock.mockReset();
  });

  describe("GET /api/profile/orders", () => {
    it("returns 401 when unauthenticated", async () => {
      authMock.mockResolvedValue(null);
      const res = await ordersList(listRequest());
      expect(res.status).toBe(401);
    });

    it("returns paginated orders for the current user", async () => {
      orderCount.mockResolvedValue(2);
      orderFindMany.mockResolvedValue([
        makeOrder({ id: "o2", createdAt: new Date("2026-05-02T10:00:00Z") }),
        makeOrder({ id: "o1" }),
      ]);

      const res = await ordersList(listRequest());
      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        orders: { id: string }[];
        total: number;
        totalPages: number;
      };
      expect(body.total).toBe(2);
      expect(body.totalPages).toBe(1);
      expect(body.orders.map((o) => o.id)).toEqual(["o2", "o1"]);

      expect(orderFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user_1" },
          orderBy: { createdAt: "desc" },
        }),
      );
    });

    it("returns empty list when there are no orders", async () => {
      orderCount.mockResolvedValue(0);
      orderFindMany.mockResolvedValue([]);

      const res = await ordersList(listRequest());
      expect(res.status).toBe(200);
      const body = (await res.json()) as { orders: unknown[]; total: number };
      expect(body.orders).toHaveLength(0);
      expect(body.total).toBe(0);
    });

    it("rejects an invalid limit", async () => {
      const res = await ordersList(
        listRequest("http://localhost/api/profile/orders?limit=999"),
      );
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/profile/orders/[id]", () => {
    it("returns 401 when unauthenticated", async () => {
      authMock.mockResolvedValue(null);
      const res = await orderDetail(new Request("http://localhost/x"), {
        params: { id: "order_1" },
      });
      expect(res.status).toBe(401);
    });

    it("returns the order when it belongs to the current user", async () => {
      orderFindFirst.mockResolvedValue({
        ...makeOrder(),
        items: [
          {
            id: "item_1",
            rentalDays: 5,
            pricePerDay: { toString: () => "20.00" } as unknown as number,
            depositAmount: { toString: () => "50.00" } as unknown as number,
            puzzle: {
              id: "puzzle_1",
              title: "Котики",
              titleEn: "Cats",
              images: [{ url: "https://example.com/img.jpg", order: 0 }],
            },
          },
        ],
      });

      const res = await orderDetail(new Request("http://localhost/x"), {
        params: { id: "order_1" },
      });
      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        id: string;
        items: { id: string; puzzle: { imageUrl: string | null } }[];
      };
      expect(body.id).toBe("order_1");
      expect(body.items[0]!.puzzle.imageUrl).toBe(
        "https://example.com/img.jpg",
      );

      expect(orderFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "order_1", userId: "user_1" },
        }),
      );
    });

    it("returns 404 when the order belongs to another user", async () => {
      orderFindFirst.mockResolvedValue(null);
      const res = await orderDetail(new Request("http://localhost/x"), {
        params: { id: "order_other_user" },
      });
      expect(res.status).toBe(404);
    });
  });
});
