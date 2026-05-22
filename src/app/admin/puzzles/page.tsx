import Link from "next/link";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { AdminPuzzleList } from "@/components/admin/AdminPuzzleList";
import { AdminPuzzleFilters } from "@/components/admin/AdminPuzzleFilters";
import type { AdminPuzzleRow } from "@/lib/api/admin-puzzle-types";

export const dynamic = "force-dynamic";

const ADMIN_PAGE_SIZE = 20;

interface PageProps {
  searchParams?: {
    search?: string;
    category?: string;
    visibility?: "all" | "visible" | "hidden";
    available?: "all" | "true" | "false";
    page?: string;
  };
}

export default async function AdminPuzzlesPage({ searchParams }: PageProps) {
  const t = await getTranslations("admin.puzzles");
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "uk";

  const search = searchParams?.search?.trim() ?? "";
  const categorySlug = searchParams?.category ?? "all";
  const visibility = searchParams?.visibility ?? "all";
  const available = searchParams?.available ?? "all";
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const where: Prisma.PuzzleWhereInput = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { titleEn: { contains: search, mode: "insensitive" } },
    ];
  }
  if (categorySlug !== "all") where.category = { slug: categorySlug };
  if (visibility === "visible") where.isVisible = true;
  if (visibility === "hidden") where.isVisible = false;
  if (available === "true") where.isAvailable = true;
  if (available === "false") where.isAvailable = false;

  const [total, puzzles, categories] = await prisma.$transaction([
    prisma.puzzle.count({ where }),
    prisma.puzzle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: { orderBy: { order: "asc" }, take: 1 },
      },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, nameEn: true, slug: true },
    }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / ADMIN_PAGE_SIZE);

  const rows: AdminPuzzleRow[] = puzzles.map((p) => ({
    id: p.id,
    title: p.title,
    titleEn: p.titleEn,
    pieceCount: p.pieceCount,
    rentalPricePerDay: Number(p.rentalPricePerDay),
    isAvailable: p.isAvailable,
    isVisible: p.isVisible,
    category: {
      id: p.category.id,
      name: p.category.name,
      nameEn: p.category.nameEn,
      slug: p.category.slug,
    },
    thumbnailUrl: p.images[0]?.url ?? null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle", { total })}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/puzzles/new" className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("create")}
          </Link>
        </Button>
      </div>

      <AdminPuzzleFilters
        categories={categories}
        locale={locale}
        defaults={{
          search,
          category: categorySlug,
          visibility,
          available,
        }}
      />

      <div className="mt-4 rounded-lg border border-border bg-white">
        <AdminPuzzleList
          rows={rows}
          locale={locale}
          page={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
