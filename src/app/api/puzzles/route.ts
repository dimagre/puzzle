import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/auth-guard";
import { badRequest, fromZodError, internalError } from "@/lib/api/errors";
import {
  createPuzzleSchema,
  listPuzzlesQuerySchema,
} from "@/lib/api/puzzle-schemas";
import { serializePuzzle } from "@/lib/api/serialize";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

function parsePieceRange(raw: string): { min: number; max: number } | null {
  const [minStr, maxStr] = raw.split("-");
  const min = Number.parseInt(minStr, 10);
  const max = Number.parseInt(maxStr, 10);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) return null;
  return { min, max };
}

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = listPuzzlesQuerySchema.safeParse(params);
  if (!parsed.success) return fromZodError(parsed.error);

  const {
    category,
    pieces,
    available,
    search,
    sort,
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
  } = parsed.data;

  const where: Prisma.PuzzleWhereInput = { isVisible: true };

  if (category) {
    where.category = { slug: category };
  }

  if (pieces) {
    const range = parsePieceRange(pieces);
    if (!range) return badRequest("Invalid pieces range; expected <min>-<max>");
    where.pieceCount = { gte: range.min, lte: range.max };
  }

  if (available === "true") where.isAvailable = true;
  if (available === "false") where.isAvailable = false;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { titleEn: { contains: search, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.PuzzleOrderByWithRelationInput | Prisma.PuzzleOrderByWithRelationInput[];
  switch (sort) {
    case "price_asc":
      orderBy = { rentalPricePerDay: "asc" };
      break;
    case "price_desc":
      orderBy = { rentalPricePerDay: "desc" };
      break;
    case "popular":
      orderBy = [{ rentalCount: "desc" }, { createdAt: "desc" }];
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
  }

  try {
    const [total, puzzles] = await prisma.$transaction([
      prisma.puzzle.count({ where }),
      prisma.puzzle.findMany({
        where,
        orderBy,
        include: { images: true, category: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return NextResponse.json({
      puzzles: puzzles.map(serializePuzzle),
      total,
      page,
      totalPages,
      limit,
    });
  } catch (err) {
    console.error("GET /api/puzzles failed", err);
    return internalError();
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Body must be valid JSON");
  }

  const parsed = createPuzzleSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);
  const input = parsed.data;

  try {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });
    if (!category) return badRequest("categoryId does not reference a category");

    const created = await prisma.puzzle.create({
      data: {
        title: input.title,
        titleEn: input.titleEn,
        description: input.description,
        descriptionEn: input.descriptionEn,
        pieceCount: input.pieceCount,
        condition: input.condition,
        type: input.type,
        rentalPricePerDay: new Prisma.Decimal(input.rentalPricePerDay),
        depositAmount: new Prisma.Decimal(input.depositAmount),
        isAvailable: input.isAvailable ?? true,
        categoryId: input.categoryId,
        images: {
          create: input.images.map((img, idx) => ({
            url: img.url,
            alt: img.alt,
            altEn: img.altEn,
            order: img.order ?? idx,
          })),
        },
      },
      include: { images: true, category: true },
    });

    return NextResponse.json(serializePuzzle(created), { status: 201 });
  } catch (err) {
    console.error("POST /api/puzzles failed", err);
    return internalError();
  }
}
