import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";

const { mockAuth, mockPut, mockDel } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockPut: vi.fn(),
  mockDel: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mockAuth }));
vi.mock("@vercel/blob", () => ({
  put: mockPut,
  del: mockDel,
}));
vi.mock("server-only", () => ({}));

import { NextRequest } from "next/server";

import {
  POST as uploadFiles,
  DELETE as deleteFiles,
} from "@/app/api/upload/route";

async function makePngBuffer(width = 64, height = 64): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 80, g: 140, b: 90 },
    },
  })
    .png()
    .toBuffer();
}

function fileFromBuffer(
  buf: Buffer,
  name: string,
  type = "image/png",
): File {
  return new File([new Uint8Array(buf)], name, { type });
}

function multipartRequest(form: FormData): NextRequest {
  return new NextRequest(
    new Request("http://test/api/upload", {
      method: "POST",
      body: form,
    }),
  );
}

function jsonRequest(method: "DELETE", body: unknown): NextRequest {
  return new NextRequest(
    new Request("http://test/api/upload", {
      method,
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
  );
}

beforeEach(() => {
  mockAuth.mockReset();
  mockPut.mockReset();
  mockDel.mockReset();
  mockPut.mockImplementation(async (pathname: string, body: Buffer) => ({
    url: `https://blob.test/${pathname}`,
    downloadUrl: `https://blob.test/${pathname}?download=1`,
    pathname,
    contentType: "image/webp",
    contentDisposition: `attachment; filename="${pathname.split("/").pop()}"`,
    size: body.length,
  }));
  mockDel.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/upload", () => {
  it("returns 401 when no session is present", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const form = new FormData();
    form.append("files", fileFromBuffer(await makePngBuffer(), "a.png"));

    const res = await uploadFiles(multipartRequest(form));
    expect(res.status).toBe(401);
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("returns 403 when caller is not admin", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u1", role: "USER" } });

    const form = new FormData();
    form.append("files", fileFromBuffer(await makePngBuffer(), "a.png"));

    const res = await uploadFiles(multipartRequest(form));
    expect(res.status).toBe(403);
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("rejects requests without multipart content type", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u1", role: "ADMIN" } });

    const res = await uploadFiles(
      new NextRequest(
        new Request("http://test/api/upload", {
          method: "POST",
          body: JSON.stringify({}),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    expect(res.status).toBe(400);
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("rejects when no files are provided", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u1", role: "ADMIN" } });

    const res = await uploadFiles(multipartRequest(new FormData()));
    expect(res.status).toBe(400);
  });

  it("rejects more than 5 files", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u1", role: "ADMIN" } });

    const form = new FormData();
    const buf = await makePngBuffer();
    for (let i = 0; i < 6; i += 1) {
      form.append("files", fileFromBuffer(buf, `a${i}.png`));
    }

    const res = await uploadFiles(multipartRequest(form));
    expect(res.status).toBe(400);
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("rejects non-image MIME types", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u1", role: "ADMIN" } });

    const form = new FormData();
    form.append(
      "files",
      new File([new Uint8Array(Buffer.from("hi"))], "note.txt", { type: "text/plain" }),
    );

    const res = await uploadFiles(multipartRequest(form));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toMatch(/MIME type/i);
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("rejects files larger than 5MB", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u1", role: "ADMIN" } });

    const form = new FormData();
    const oversized = Buffer.alloc(5 * 1024 * 1024 + 1, 0);
    form.append(
      "files",
      new File([new Uint8Array(oversized)], "big.png", { type: "image/png" }),
    );

    const res = await uploadFiles(multipartRequest(form));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.message).toMatch(/exceeds/i);
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("uploads all 4 variants per file as WebP and returns URLs", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u1", role: "ADMIN" } });

    const form = new FormData();
    form.append("puzzleId", "puz_1");
    form.append("files", fileFromBuffer(await makePngBuffer(), "a.png"));

    const res = await uploadFiles(multipartRequest(form));
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.failed).toEqual([]);
    expect(json.uploaded).toHaveLength(1);
    const item = json.uploaded[0];
    expect(item.original).toMatch(/^https:\/\/blob\.test\/puzzles\/puz_1\/original\//);
    expect(item.thumbnail).toMatch(/^https:\/\/blob\.test\/puzzles\/puz_1\/thumbnail\//);
    expect(item.card).toMatch(/^https:\/\/blob\.test\/puzzles\/puz_1\/card\//);
    expect(item.full).toMatch(/^https:\/\/blob\.test\/puzzles\/puz_1\/full\//);

    expect(mockPut).toHaveBeenCalledTimes(4);
    for (const call of mockPut.mock.calls) {
      const [pathname, , opts] = call;
      expect(pathname).toMatch(/\.webp$/);
      expect(opts.contentType).toBe("image/webp");
      expect(opts.access).toBe("public");
    }

    const thumbnailCall = mockPut.mock.calls.find(
      ([pathname]) => typeof pathname === "string" && pathname.includes("/thumbnail/"),
    );
    expect(thumbnailCall).toBeDefined();
    const thumbBuf = thumbnailCall![1] as Buffer;
    const meta = await sharp(thumbBuf).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(200);
    expect(meta.height).toBe(200);

    const cardCall = mockPut.mock.calls.find(
      ([pathname]) => typeof pathname === "string" && pathname.includes("/card/"),
    );
    const cardMeta = await sharp(cardCall![1] as Buffer).metadata();
    expect(cardMeta.width).toBe(600);
    expect(cardMeta.height).toBe(400);

    const fullCall = mockPut.mock.calls.find(
      ([pathname]) => typeof pathname === "string" && pathname.includes("/full/"),
    );
    const fullMeta = await sharp(fullCall![1] as Buffer).metadata();
    expect(fullMeta.width).toBe(1200);
    expect(fullMeta.height).toBe(800);
  });

  it("falls back to 'unassigned' folder when no puzzleId is provided", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u1", role: "ADMIN" } });

    const form = new FormData();
    form.append("files", fileFromBuffer(await makePngBuffer(), "a.png"));

    const res = await uploadFiles(multipartRequest(form));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.uploaded[0].original).toMatch(/\/puzzles\/unassigned\/original\//);
  });

  it("returns 207 with which files succeeded vs failed when one upload throws", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u1", role: "ADMIN" } });

    let fullCount = 0;
    mockPut.mockReset();
    mockPut.mockImplementation(async (pathname: string) => {
      if (pathname.includes("/full/")) {
        fullCount += 1;
        if (fullCount === 2) {
          throw new Error("Simulated blob outage");
        }
      }
      return {
        url: `https://blob.test/${pathname}`,
        downloadUrl: `https://blob.test/${pathname}?download=1`,
        pathname,
        contentType: "image/webp",
        contentDisposition: `attachment`,
        size: 1,
      };
    });

    const buf = await makePngBuffer();
    const form = new FormData();
    form.append("puzzleId", "puz_1");
    form.append("files", fileFromBuffer(buf, "ok.png"));
    form.append("files", fileFromBuffer(buf, "broken.png"));

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await uploadFiles(multipartRequest(form));
    consoleError.mockRestore();

    expect(res.status).toBe(207);
    const json = await res.json();
    expect(json.uploaded).toHaveLength(1);
    expect(json.uploaded[0].original).toMatch(/\/original\//);
    expect(json.failed).toHaveLength(1);
    expect(["ok.png", "broken.png"]).toContain(json.failed[0].filename);
    expect(json.failed[0].error).toMatch(/Simulated/);
  });
});

describe("DELETE /api/upload", () => {
  it("returns 401 without a session", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const res = await deleteFiles(
      jsonRequest("DELETE", { urls: ["https://blob.test/x.webp"] }),
    );
    expect(res.status).toBe(401);
    expect(mockDel).not.toHaveBeenCalled();
  });

  it("returns 403 for non-admin", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u1", role: "USER" } });
    const res = await deleteFiles(
      jsonRequest("DELETE", { urls: ["https://blob.test/x.webp"] }),
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 for invalid body", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u1", role: "ADMIN" } });
    const res = await deleteFiles(jsonRequest("DELETE", { urls: [] }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-URL strings", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u1", role: "ADMIN" } });
    const res = await deleteFiles(
      jsonRequest("DELETE", { urls: ["not-a-url"] }),
    );
    expect(res.status).toBe(400);
  });

  it("deletes blobs and returns 204", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u1", role: "ADMIN" } });
    const urls = [
      "https://blob.test/puzzles/p1/full/a.webp",
      "https://blob.test/puzzles/p1/thumbnail/a.webp",
    ];
    const res = await deleteFiles(jsonRequest("DELETE", { urls }));
    expect(res.status).toBe(204);
    expect(mockDel).toHaveBeenCalledTimes(1);
    expect(mockDel).toHaveBeenCalledWith(urls, expect.any(Object));
  });
});
