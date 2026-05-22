import { afterEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const { prismaUserCreate, prismaUserFindUnique } = vi.hoisted(() => ({
  prismaUserCreate: vi.fn(),
  prismaUserFindUnique: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      create: prismaUserCreate,
      findUnique: prismaUserFindUnique,
    },
  },
}));

import { POST as registerPost } from "@/app/api/auth/register/route";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  afterEach(() => {
    prismaUserCreate.mockReset();
    prismaUserFindUnique.mockReset();
  });

  it("creates a user and returns 201 (happy path)", async () => {
    prismaUserCreate.mockResolvedValue({
      id: "user_1",
      email: "new@example.com",
      name: "New User",
      role: "USER",
    });

    const res = await registerPost(
      jsonRequest({
        email: "New@Example.com",
        password: "supersecret",
        name: "New User",
      }),
    );

    expect(res.status).toBe(201);
    const payload = (await res.json()) as {
      user: { email: string; role: string; passwordHash?: unknown };
    };
    expect(payload.user.email).toBe("new@example.com");
    expect(payload.user.role).toBe("USER");
    expect(payload.user.passwordHash).toBeUndefined();

    expect(prismaUserCreate).toHaveBeenCalledOnce();
    const createArgs = prismaUserCreate.mock.calls[0][0];
    expect(createArgs.data.email).toBe("new@example.com");
    expect(createArgs.data.name).toBe("New User");
    expect(typeof createArgs.data.passwordHash).toBe("string");
    expect(createArgs.data.passwordHash).not.toBe("supersecret");
    expect(createArgs.data.passwordHash.length).toBeGreaterThan(20);
    expect(createArgs.select).toMatchObject({
      id: true,
      email: true,
      name: true,
      role: true,
    });
    expect(createArgs.select.passwordHash).toBeUndefined();
  });

  it("returns 409 on duplicate email (Prisma P2002)", async () => {
    prismaUserCreate.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("unique violation", {
        code: "P2002",
        clientVersion: "test",
      }),
    );

    const res = await registerPost(
      jsonRequest({
        email: "dup@example.com",
        password: "supersecret",
        name: "Dup",
      }),
    );

    expect(res.status).toBe(409);
    const payload = (await res.json()) as { error: string };
    expect(payload.error).toMatch(/already in use/i);
  });

  it("returns 400 on invalid input (short password)", async () => {
    const res = await registerPost(
      jsonRequest({
        email: "ok@example.com",
        password: "short",
        name: "Bad",
      }),
    );

    expect(res.status).toBe(400);
    expect(prismaUserCreate).not.toHaveBeenCalled();
  });

  it("returns 400 on invalid email", async () => {
    const res = await registerPost(
      jsonRequest({
        email: "not-an-email",
        password: "supersecret",
        name: "Bad",
      }),
    );

    expect(res.status).toBe(400);
    expect(prismaUserCreate).not.toHaveBeenCalled();
  });

  it("returns 400 on malformed JSON", async () => {
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not valid json",
    });

    const res = await registerPost(req);
    expect(res.status).toBe(400);
  });
});
