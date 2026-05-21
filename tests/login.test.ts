import { afterEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

const { findUnique } = vi.hoisted(() => ({
  findUnique: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique,
    },
  },
}));

import { authorizeWithCredentials } from "@/lib/auth/credentials";

describe("authorizeWithCredentials", () => {
  afterEach(() => {
    findUnique.mockReset();
  });

  it("returns user without passwordHash on correct password", async () => {
    const hash = await bcrypt.hash("rightpassword", 10);
    findUnique.mockResolvedValue({
      id: "u1",
      email: "alice@example.com",
      name: "Alice",
      role: "USER",
      passwordHash: hash,
    });

    const result = await authorizeWithCredentials({
      email: "alice@example.com",
      password: "rightpassword",
    });

    expect(result).toEqual({
      id: "u1",
      email: "alice@example.com",
      name: "Alice",
      role: "USER",
    });
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("returns null on wrong password", async () => {
    const hash = await bcrypt.hash("rightpassword", 10);
    findUnique.mockResolvedValue({
      id: "u1",
      email: "alice@example.com",
      name: "Alice",
      role: "USER",
      passwordHash: hash,
    });

    const result = await authorizeWithCredentials({
      email: "alice@example.com",
      password: "WRONG",
    });
    expect(result).toBeNull();
  });

  it("returns null when user does not exist", async () => {
    findUnique.mockResolvedValue(null);

    const result = await authorizeWithCredentials({
      email: "ghost@example.com",
      password: "whatever1234",
    });
    expect(result).toBeNull();
  });

  it("returns null and does not query DB on invalid input", async () => {
    const result = await authorizeWithCredentials({ email: "", password: "" });
    expect(result).toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("normalises email casing before lookup", async () => {
    findUnique.mockResolvedValue(null);
    await authorizeWithCredentials({
      email: "MIXED@Example.COM",
      password: "whatever1234",
    });
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "mixed@example.com" } }),
    );
  });
});
