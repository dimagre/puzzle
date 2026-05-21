import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/auth-guard";
import {
  badRequest,
  fromZodError,
  internalError,
  notFound,
} from "@/lib/api/errors";
import { updatePuzzleSchema } from "@/lib/api/puzzle-schemas";
import { serializePuzzle } from "@/lib/api/serialize";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = params;
  try {
    const puzzle = await prisma.puzzle.findFirst({
      where: { id, isVisible: true },
      include: { images: true, category: true },
    });
    if (!puzzle) return notFound("Puzzle not found");
    return NextResponse.json(serializePuzzle(puzzle));
  } catch (err) {
    console.error(`GET /api/puzzles/${id} failed`, err);
    return internalError();
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Body must be valid JSON");
  }

  const parsed = updatePuzzleSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);
  const input = parsed.data;

  try {
    const existing = await prisma.puzzle.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) return notFound("Puzzle not found");

    if (input.categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: input.categoryId },
        select: { id: true },
      });
      if (!cat) return badRequest("categoryId does not reference a category");
    }

    const data: Prisma.PuzzleUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.titleEn !== undefined) data.titleEn = input.titleEn;
    if (input.description !== undefined) data.description = input.description;
    if (input.descriptionEn !== undefined) data.descriptionEn = input.descriptionEn;
    if (input.pieceCount !== undefined) data.pieceCount = input.pieceCount;
    if (input.condition !== undefined) data.condition = input.condition;
    if (input.type !== undefined) data.type = input.type;
    if (input.rentalPricePerDay !== undefined)
      data.rentalPricePerDay = new Prisma.Decimal(input.rentalPricePerDay);
    if (input.depositAmount !== undefined)
      data.depositAmount = new Prisma.Decimal(input.depositAmount);
    if (input.isAvailable !== undefined) data.isAvailable = input.isAvailable;
    if (input.categoryId !== undefined)
      data.category = { connect: { id: input.categoryId } };

    const updated = await prisma.$transaction(async (tx) => {
      if (input.images) {
        await tx.puzzleImage.deleteMany({ where: { puzzleId: id } });
        await tx.puzzleImage.createMany({
          data: input.images.map((img, idx) => ({
            puzzleId: id,
            url: img.url,
            alt: img.alt,
            altEn: img.altEn,
            order: img.order ?? idx,
          })),
        });
      }
      return tx.puzzle.update({
        where: { id },
        data,
        include: { images: true, category: true },
      });
    });

    return NextResponse.json(serializePuzzle(updated));
  } catch (err) {
    console.error(`PUT /api/puzzles/${id} failed`, err);
    return internalError();
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = params;
  try {
    const existing = await prisma.puzzle.findUnique({
      where: { id },
      select: { id: true, isVisible: true },
    });
    if (!existing) return notFound("Puzzle not found");

    // Soft-delete: schema has no ARCHIVED enum, so we use isVisible=false
    // (the public list/detail handlers already filter on isVisible=true).
    if (existing.isVisible) {
      await prisma.puzzle.update({
        where: { id },
        data: { isVisible: false, isAvailable: false },
      });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error(`DELETE /api/puzzles/${id} failed`, err);
    return internalError();
  }
}
