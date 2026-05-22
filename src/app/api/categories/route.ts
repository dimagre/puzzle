import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { internalError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, nameEn: true, slug: true },
    });
    return NextResponse.json({ categories });
  } catch (err) {
    console.error("GET /api/categories failed", err);
    return internalError();
  }
}
