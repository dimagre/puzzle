import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const {
  orderFindFirst,
  paymentCreate,
  paymentFindFirst,
  paymentFindUnique,
  paymentUpdate,
  orderUpdate,
  transaction,
  authMock,
  monoCreateInvoice,
  monoGetInvoiceStatus,
} = vi.hoisted(() => ({
  orderFindFirst: vi.fn(),
  paymentCreate: vi.fn(),
  paymentFindFirst: vi.fn(),
  paymentFindUnique: vi.fn(),
  paymentUpdate: vi.fn(),
  orderUpdate: vi.fn(),
  transaction: vi.fn(),
  authMock: vi.fn(),
  monoCreateInvoice: vi.fn(),
  monoGetInvoiceStatus: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findFirst: orderFindFirst, update: orderUpdate },
    payment: {
      create: paymentCreate,
      findFirst: paymentFindFirst,
      findUnique: paymentFindUnique,
      update: paymentUpdate,
    },
    $transaction: transaction,
  },
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/payments/monobank", async () => {
  const actual = await vi.importActual<typeof import("@/lib/payments/monobank")>(
    "@/lib/payments/monobank",
  );
  return {
    ...actual,
    createInvoice: monoCreateInvoice,
    getInvoiceStatus: monoGetInvoiceStatus,
  };
});

import { POST as createPayment } from "@/app/api/payments/create/route";
import { GET as getPaymentStatus } from "@/app/api/payments/status/route";
import { POST as webhook } from "@/app/api/payments/webhook/route";

function postJson(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
  process.env.MONOBANK_TOKEN = "test-token";
  authMock.mockResolvedValue({ user: { id: "user_1", email: "u@x.com" } });
  paymentFindFirst.mockResolvedValue(null);
  transaction.mockImplementation(async (cb: (tx: unknown) => unknown) => {
    const tx = {
      payment: {
        create: paymentCreate,
        findFirst: paymentFindFirst,
        update: paymentUpdate,
      },
      order: { update: orderUpdate },
    };
    return cb(tx);
  });
});

afterEach(() => {
  orderFindFirst.mockReset();
  paymentCreate.mockReset();
  paymentFindFirst.mockReset();
  paymentFindUnique.mockReset();
  paymentUpdate.mockReset();
  orderUpdate.mockReset();
  transaction.mockReset();
  authMock.mockReset();
  monoCreateInvoice.mockReset();
  monoGetInvoiceStatus.mockReset();
});

describe("POST /api/payments/create", () => {
  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null);
    const res = await createPayment(
      postJson("http://localhost/api/payments/create", { orderId: "o_1" }) as never,
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 on invalid body", async () => {
    const res = await createPayment(
      postJson("http://localhost/api/payments/create", {}) as never,
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when order not found or not owned", async () => {
    orderFindFirst.mockResolvedValue(null);
    const res = await createPayment(
      postJson("http://localhost/api/payments/create", { orderId: "o_1" }) as never,
    );
    expect(res.status).toBe(404);
  });

  it("returns 409 when order is not pending", async () => {
    orderFindFirst.mockResolvedValue({
      id: "o_1",
      status: "CONFIRMED",
      totalAmount: new Prisma.Decimal("250.00"),
      payments: [],
    });
    const res = await createPayment(
      postJson("http://localhost/api/payments/create", { orderId: "o_1" }) as never,
    );
    expect(res.status).toBe(409);
  });

  it("returns 409 when an existing rental payment already succeeded", async () => {
    orderFindFirst.mockResolvedValue({
      id: "o_1",
      status: "PENDING",
      totalAmount: new Prisma.Decimal("250.00"),
      payments: [{ id: "p_1", status: "SUCCESS", type: "RENTAL" }],
    });
    const res = await createPayment(
      postJson("http://localhost/api/payments/create", { orderId: "o_1" }) as never,
    );
    expect(res.status).toBe(409);
  });

  it("returns 409 when an existing rental payment is still PENDING", async () => {
    orderFindFirst.mockResolvedValue({
      id: "o_1",
      status: "PENDING",
      totalAmount: new Prisma.Decimal("250.00"),
      payments: [{ id: "p_1", status: "PENDING", type: "RENTAL" }],
    });
    const res = await createPayment(
      postJson("http://localhost/api/payments/create", { orderId: "o_1" }) as never,
    );
    expect(res.status).toBe(409);
    expect(monoCreateInvoice).not.toHaveBeenCalled();
  });

  it("returns 409 when a concurrent request creates a PENDING payment between the read and write", async () => {
    orderFindFirst.mockResolvedValue({
      id: "o_1",
      status: "PENDING",
      totalAmount: new Prisma.Decimal("250.00"),
      payments: [],
    });
    monoCreateInvoice.mockResolvedValue({
      invoiceId: "inv_race",
      pageUrl: "https://pay.mono/inv_race",
    });
    paymentFindFirst.mockResolvedValue({ id: "p_concurrent" });

    const res = await createPayment(
      postJson("http://localhost/api/payments/create", { orderId: "o_1" }) as never,
    );
    expect(res.status).toBe(409);
    expect(paymentCreate).not.toHaveBeenCalled();
  });

  it("creates an invoice and stores the payment record", async () => {
    orderFindFirst.mockResolvedValue({
      id: "o_1",
      status: "PENDING",
      totalAmount: new Prisma.Decimal("250.00"),
      payments: [],
    });
    monoCreateInvoice.mockResolvedValue({
      invoiceId: "inv_123",
      pageUrl: "https://pay.mono/inv_123",
    });

    const res = await createPayment(
      postJson("http://localhost/api/payments/create", { orderId: "o_1" }) as never,
    );
    expect(res.status).toBe(200);

    const body = (await res.json()) as { paymentUrl: string };
    expect(body.paymentUrl).toBe("https://pay.mono/inv_123");

    expect(monoCreateInvoice).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 25000,
        reference: "o_1",
        redirectUrl: "https://app.example.com/checkout/payment-result?orderId=o_1",
        webHookUrl: "https://app.example.com/api/payments/webhook",
      }),
    );
    expect(paymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: "o_1",
          type: "RENTAL",
          status: "PENDING",
          monoInvoiceId: "inv_123",
        }),
      }),
    );
  });
});

describe("GET /api/payments/status", () => {
  function getRequest(orderId?: string) {
    const url = orderId
      ? `http://localhost/api/payments/status?orderId=${orderId}`
      : "http://localhost/api/payments/status";
    return new Request(url, { method: "GET" }) as never;
  }

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null);
    const res = await getPaymentStatus(getRequest("o_1"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when orderId is missing", async () => {
    const res = await getPaymentStatus(getRequest());
    expect(res.status).toBe(400);
  });

  it("returns 404 when order is not found", async () => {
    orderFindFirst.mockResolvedValue(null);
    const res = await getPaymentStatus(getRequest("o_1"));
    expect(res.status).toBe(404);
  });

  it("reports success when order is CONFIRMED", async () => {
    orderFindFirst.mockResolvedValue({
      id: "o_1",
      status: "CONFIRMED",
      payments: [{ status: "SUCCESS", createdAt: new Date() }],
    });
    const res = await getPaymentStatus(getRequest("o_1"));
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("success");
  });

  it("reports failure when no payment succeeded", async () => {
    orderFindFirst.mockResolvedValue({
      id: "o_1",
      status: "PENDING",
      payments: [{ status: "FAILURE", createdAt: new Date() }],
    });
    const res = await getPaymentStatus(getRequest("o_1"));
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("failure");
  });

  it("reports pending when no payments exist yet", async () => {
    orderFindFirst.mockResolvedValue({
      id: "o_1",
      status: "PENDING",
      payments: [],
    });
    const res = await getPaymentStatus(getRequest("o_1"));
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("pending");
  });
});

describe("POST /api/payments/webhook", () => {
  function webhookRequest(body: unknown) {
    return postJson("http://localhost/api/payments/webhook", body) as never;
  }

  it("returns 200 even when invoice is unknown", async () => {
    monoGetInvoiceStatus.mockResolvedValue({ invoiceId: "inv_x", status: "success" });
    paymentFindUnique.mockResolvedValue(null);
    const res = await webhook(webhookRequest({ invoiceId: "inv_x", status: "success" }));
    expect(res.status).toBe(200);
    expect(paymentUpdate).not.toHaveBeenCalled();
  });

  it("marks payment SUCCESS and order CONFIRMED on success", async () => {
    monoGetInvoiceStatus.mockResolvedValue({
      invoiceId: "inv_1",
      status: "success",
      paymentInfo: { rrn: "rrn_1" },
    });
    paymentFindUnique.mockResolvedValue({
      id: "p_1",
      orderId: "o_1",
      type: "RENTAL",
      status: "PENDING",
    });

    const res = await webhook(webhookRequest({ invoiceId: "inv_1", status: "success" }));
    expect(res.status).toBe(200);

    expect(paymentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "p_1" },
        data: expect.objectContaining({
          status: "SUCCESS",
          monoPaymentRef: "rrn_1",
        }),
      }),
    );
    expect(orderUpdate).toHaveBeenCalledWith({
      where: { id: "o_1" },
      data: { status: "CONFIRMED" },
    });
  });

  it("marks payment FAILURE on expired and leaves order untouched", async () => {
    monoGetInvoiceStatus.mockResolvedValue({ invoiceId: "inv_2", status: "expired" });
    paymentFindUnique.mockResolvedValue({
      id: "p_2",
      orderId: "o_2",
      type: "RENTAL",
      status: "PENDING",
    });

    const res = await webhook(webhookRequest({ invoiceId: "inv_2", status: "expired" }));
    expect(res.status).toBe(200);
    expect(paymentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "FAILURE" }),
      }),
    );
    expect(orderUpdate).not.toHaveBeenCalled();
  });

  it("verifies status via the Monobank API regardless of body status", async () => {
    monoGetInvoiceStatus.mockResolvedValue({ invoiceId: "inv_3", status: "failure" });
    paymentFindUnique.mockResolvedValue({
      id: "p_3",
      orderId: "o_3",
      type: "RENTAL",
      status: "PENDING",
    });

    // Body claims success but server-side check says failure — server-side wins.
    await webhook(webhookRequest({ invoiceId: "inv_3", status: "success" }));
    expect(monoGetInvoiceStatus).toHaveBeenCalledWith("inv_3");
    expect(paymentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "FAILURE" }),
      }),
    );
    expect(orderUpdate).not.toHaveBeenCalled();
  });
});
