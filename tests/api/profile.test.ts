import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

const { findUnique, update, authMock } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn(),
  authMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique, update },
  },
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

import { GET as profileGet, PATCH as profilePatch } from "@/app/api/profile/route";
import { POST as passwordPost } from "@/app/api/profile/password/route";

function jsonRequest(url: string, method: string, body: unknown): Request {
  return new Request(url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const PROFILE_RECORD = {
  id: "user_1",
  email: "alice@example.com",
  name: "Alice",
  phone: "+380501234567",
  deliveryRegion: "Київська",
  deliveryCity: "Київ",
  deliveryNovaPoshtaWarehouse: "Відділення №1",
};

describe("profile API", () => {
  beforeEach(() => {
    authMock.mockResolvedValue({ user: { id: "user_1", email: "alice@example.com" } });
  });

  afterEach(() => {
    findUnique.mockReset();
    update.mockReset();
    authMock.mockReset();
  });

  describe("GET /api/profile", () => {
    it("returns 401 when unauthenticated", async () => {
      authMock.mockResolvedValue(null);
      const res = await profileGet();
      expect(res.status).toBe(401);
    });

    it("returns the current user profile", async () => {
      findUnique.mockResolvedValue(PROFILE_RECORD);
      const res = await profileGet();
      expect(res.status).toBe(200);
      const body = (await res.json()) as { id: string; email: string };
      expect(body.id).toBe("user_1");
      expect(body.email).toBe("alice@example.com");
      expect(findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "user_1" } }),
      );
    });

    it("returns 404 when user record is missing", async () => {
      findUnique.mockResolvedValue(null);
      const res = await profileGet();
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/profile", () => {
    it("returns 401 when unauthenticated", async () => {
      authMock.mockResolvedValue(null);
      const res = await profilePatch(
        jsonRequest("http://localhost/api/profile", "PATCH", {
          name: "Bob",
          phone: null,
          deliveryRegion: null,
          deliveryCity: null,
          deliveryNovaPoshtaWarehouse: null,
        }),
      );
      expect(res.status).toBe(401);
      expect(update).not.toHaveBeenCalled();
    });

    it("updates profile fields and returns the new state", async () => {
      update.mockResolvedValue({
        ...PROFILE_RECORD,
        name: "Alice Updated",
        phone: "+380671112233",
      });

      const res = await profilePatch(
        jsonRequest("http://localhost/api/profile", "PATCH", {
          name: "Alice Updated",
          phone: "+380671112233",
          deliveryRegion: "Київська",
          deliveryCity: "Київ",
          deliveryNovaPoshtaWarehouse: "Відділення №1",
        }),
      );

      expect(res.status).toBe(200);
      const body = (await res.json()) as { name: string; phone: string };
      expect(body.name).toBe("Alice Updated");
      expect(body.phone).toBe("+380671112233");

      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user_1" },
          data: expect.objectContaining({
            name: "Alice Updated",
            phone: "+380671112233",
            deliveryRegion: "Київська",
          }),
        }),
      );
    });

    it("rejects an invalid phone number", async () => {
      const res = await profilePatch(
        jsonRequest("http://localhost/api/profile", "PATCH", {
          name: "Alice",
          phone: "12345",
          deliveryRegion: null,
          deliveryCity: null,
          deliveryNovaPoshtaWarehouse: null,
        }),
      );
      expect(res.status).toBe(400);
      expect(update).not.toHaveBeenCalled();
    });

    it("rejects an empty name", async () => {
      const res = await profilePatch(
        jsonRequest("http://localhost/api/profile", "PATCH", {
          name: "   ",
          phone: null,
          deliveryRegion: null,
          deliveryCity: null,
          deliveryNovaPoshtaWarehouse: null,
        }),
      );
      expect(res.status).toBe(400);
      expect(update).not.toHaveBeenCalled();
    });

    it("normalises blank optional fields to null", async () => {
      update.mockResolvedValue({
        ...PROFILE_RECORD,
        deliveryRegion: null,
        deliveryCity: null,
        deliveryNovaPoshtaWarehouse: null,
      });

      const res = await profilePatch(
        jsonRequest("http://localhost/api/profile", "PATCH", {
          name: "Alice",
          phone: "",
          deliveryRegion: "",
          deliveryCity: "",
          deliveryNovaPoshtaWarehouse: "",
        }),
      );

      expect(res.status).toBe(200);
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            phone: null,
            deliveryRegion: null,
            deliveryCity: null,
            deliveryNovaPoshtaWarehouse: null,
          }),
        }),
      );
    });
  });

  describe("POST /api/profile/password", () => {
    it("returns 401 when unauthenticated", async () => {
      authMock.mockResolvedValue(null);
      const res = await passwordPost(
        jsonRequest("http://localhost/api/profile/password", "POST", {
          currentPassword: "old",
          newPassword: "newpassword1",
        }),
      );
      expect(res.status).toBe(401);
    });

    it("changes the password when the current one is correct", async () => {
      const hash = await bcrypt.hash("oldpassword", 10);
      findUnique.mockResolvedValue({ id: "user_1", passwordHash: hash });
      update.mockResolvedValue({ id: "user_1" });

      const res = await passwordPost(
        jsonRequest("http://localhost/api/profile/password", "POST", {
          currentPassword: "oldpassword",
          newPassword: "newpassword1",
        }),
      );

      expect(res.status).toBe(200);
      expect(update).toHaveBeenCalledOnce();
      const updateArgs = update.mock.calls[0][0];
      expect(updateArgs.data.passwordHash).not.toBe("newpassword1");
      const matches = await bcrypt.compare(
        "newpassword1",
        updateArgs.data.passwordHash,
      );
      expect(matches).toBe(true);
    });

    it("returns 401 when the current password is wrong", async () => {
      const hash = await bcrypt.hash("oldpassword", 10);
      findUnique.mockResolvedValue({ id: "user_1", passwordHash: hash });

      const res = await passwordPost(
        jsonRequest("http://localhost/api/profile/password", "POST", {
          currentPassword: "WRONG",
          newPassword: "newpassword1",
        }),
      );

      expect(res.status).toBe(401);
      expect(update).not.toHaveBeenCalled();
    });

    it("rejects a too-short new password", async () => {
      const res = await passwordPost(
        jsonRequest("http://localhost/api/profile/password", "POST", {
          currentPassword: "oldpassword",
          newPassword: "short",
        }),
      );
      expect(res.status).toBe(400);
      expect(findUnique).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    });
  });
});
