import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma, mockAuth } = vi.hoisted(() => {
  return {
    mockPrisma: {
      puzzle: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      puzzleImage: {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
      },
      category: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      $transaction: vi.fn(),
    },
    mockAuth: vi.fn(),
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/auth", () => ({ auth: mockAuth }));
vi.mock("server-only", () => ({}));

import { NextRequest } from "next/server";

import { GET as listPuzzles, POST as createPuzzle } from "@/app/api/puzzles/route";
import { GET as getPuzzle } from "@/app/api/puzzles/[id]/route";
import { GET as listCategories } from "@/app/api/categories/route";

function buildRequest(url: string, init?: RequestInit) {
  return new NextRequest(new Request(url, init));
}

const samplePuzzle = {
  id: "puz_1",
  title: "Карпатські гори",
  titleEn: "Carpathians",
  description: "...",
  descriptionEn: "...",
  pieceCount: 1000,
  condition: "NEW" as const,
  type: "CLASSIC" as const,
  rentalPricePerDay: { toString: () => "25.00" } as unknown as object,
  depositAmount: { toString: () => "400.00" } as unknown as object,
  isAvailable: true,
  isVisible: true,
  rentalCount: 0,
  categoryId: "cat_1",
  category: { id: "cat_1", name: "Пейзажі", nameEn: "Landscapes", slug: "landscapes" },
  images: [
    { id: "img_1", url: "https://example.com/a.jpg", alt: "a", altEn: "a", order: 0, puzzleId: "puz_1", createdAt: new Date() },
  ],
  createdAt: new Date("2026-05-21T00:00:00Z"),
  updatedAt: new Date("2026-05-21T00:00:00Z"),
};

beforeEach(() => {
  Object.values(mockPrisma).forEach((model) => {
    if (typeof model === "function") return;
    Object.values(model).forEach((fn) => (fn as unknown as { mockReset?: () => void }).mockReset?.());
  });
  mockPrisma.$transaction.mockReset();
  mockAuth.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/categories", () => {
  it("returns categories sorted by name", async () => {
    mockPrisma.category.findMany.mockResolvedValueOnce([
      { id: "cat_1", name: "Мистецтво", nameEn: "Art", slug: "art" },
    ]);

    const res = await listCategories();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.categories).toHaveLength(1);
    expect(json.categories[0].slug).toBe("art");
    expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { name: "asc" } }),
    );
  });
});

describe("GET /api/puzzles", () => {
  it("returns paginated results with default page/limit", async () => {
    mockPrisma.$transaction.mockImplementationOnce(async (ops: unknown[]) => {
      // Resolve the operation promises so the route's destructure works.
      return Promise.all(ops as Promise<unknown>[]);
    });
    mockPrisma.puzzle.count.mockResolvedValueOnce(1);
    mockPrisma.puzzle.findMany.mockResolvedValueOnce([samplePuzzle]);

    const res = await listPuzzles(buildRequest("http://test/api/puzzles"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(1);
    expect(json.page).toBe(1);
    expect(json.totalPages).toBe(1);
    expect(json.puzzles).toHaveLength(1);
    expect(json.puzzles[0]).toMatchObject({
      id: "puz_1",
      pieces: 1000,
      pricePerDay: 25,
      category: { slug: "landscapes" },
      imageUrl: "https://example.com/a.jpg",
    });
  });

  it("applies category and pieces filters", async () => {
    mockPrisma.$transaction.mockImplementationOnce(async (ops: unknown[]) => Promise.all(ops as Promise<unknown>[]));
    mockPrisma.puzzle.count.mockResolvedValueOnce(0);
    mockPrisma.puzzle.findMany.mockResolvedValueOnce([]);

    const res = await listPuzzles(
      buildRequest("http://test/api/puzzles?category=landscapes&pieces=500-1500&available=true&search=Karpaty"),
    );
    expect(res.status).toBe(200);

    const where = mockPrisma.puzzle.findMany.mock.calls[0][0].where;
    expect(where.category).toEqual({ slug: "landscapes" });
    expect(where.pieceCount).toEqual({ gte: 500, lte: 1500 });
    expect(where.isAvailable).toBe(true);
    expect(where.OR).toBeDefined();
  });

  it("rejects an invalid pieces format", async () => {
    const res = await listPuzzles(buildRequest("http://test/api/puzzles?pieces=abc"));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/puzzles/[id]", () => {
  it("returns 200 with the puzzle when found", async () => {
    mockPrisma.puzzle.findFirst.mockResolvedValueOnce(samplePuzzle);

    const res = await getPuzzle(buildRequest("http://test/api/puzzles/puz_1"), {
      params: { id: "puz_1" },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe("puz_1");
    expect(mockPrisma.puzzle.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "puz_1", isVisible: true } }),
    );
  });

  it("returns 404 for missing or archived puzzles", async () => {
    mockPrisma.puzzle.findFirst.mockResolvedValueOnce(null);

    const res = await getPuzzle(buildRequest("http://test/api/puzzles/missing"), {
      params: { id: "missing" },
    });

    expect(res.status).toBe(404);
  });
});

describe("POST /api/puzzles", () => {
  const validBody = {
    title: "Тест",
    titleEn: "Test",
    description: "опис",
    descriptionEn: "description",
    pieceCount: 500,
    condition: "NEW",
    type: "CLASSIC",
    rentalPricePerDay: "20.00",
    depositAmount: "200.00",
    categoryId: "cat_1",
    images: [{ url: "https://example.com/a.jpg", alt: "a", altEn: "a" }],
  };

  function jsonRequest(body: unknown) {
    return buildRequest("http://test/api/puzzles", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  it("returns 401 when no session is present", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const res = await createPuzzle(jsonRequest(validBody));
    expect(res.status).toBe(401);
    expect(mockPrisma.puzzle.create).not.toHaveBeenCalled();
  });

  it("returns 403 when the caller is not an admin", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u_1", role: "USER" } });

    const res = await createPuzzle(jsonRequest(validBody));
    expect(res.status).toBe(403);
  });

  it("creates a puzzle when the caller is admin", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u_admin", role: "ADMIN" } });
    mockPrisma.category.findUnique.mockResolvedValueOnce({ id: "cat_1" });
    mockPrisma.puzzle.create.mockResolvedValueOnce(samplePuzzle);

    const res = await createPuzzle(jsonRequest(validBody));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBe("puz_1");
    expect(mockPrisma.puzzle.create).toHaveBeenCalledTimes(1);
    const args = mockPrisma.puzzle.create.mock.calls[0][0];
    expect(args.data.title).toBe("Тест");
    expect(args.data.images.create).toHaveLength(1);
  });

  it("returns 400 for an invalid body", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u_admin", role: "ADMIN" } });

    const res = await createPuzzle(
      jsonRequest({ ...validBody, pieceCount: -1 }),
    );
    expect(res.status).toBe(400);
  });
});
