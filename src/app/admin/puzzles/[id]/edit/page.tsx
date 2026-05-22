import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { PuzzleForm } from "@/components/admin/PuzzleForm";
import type { PuzzleFormValues } from "@/lib/api/admin-puzzle-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function EditAdminPuzzlePage({ params }: PageProps) {
  const t = await getTranslations("admin.puzzles");
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "uk";

  const [puzzle, categories] = await prisma.$transaction([
    prisma.puzzle.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { order: "asc" } } },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, nameEn: true, slug: true },
    }),
  ]);

  if (!puzzle) notFound();

  const initialValues: PuzzleFormValues = {
    title: puzzle.title,
    titleEn: puzzle.titleEn,
    description: puzzle.description,
    descriptionEn: puzzle.descriptionEn,
    pieceCount: puzzle.pieceCount,
    condition: puzzle.condition,
    type: puzzle.type,
    rentalPricePerDay: puzzle.rentalPricePerDay.toFixed(2),
    depositAmount: puzzle.depositAmount.toFixed(2),
    isAvailable: puzzle.isAvailable,
    categoryId: puzzle.categoryId,
    images: puzzle.images.map((img) => ({
      url: img.url,
      alt: img.alt,
      altEn: img.altEn,
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/puzzles"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("backToList")}
        </Link>
      </div>
      <h1 className="text-2xl font-bold">
        {t("editTitle", { title: locale === "en" ? puzzle.titleEn : puzzle.title })}
      </h1>
      <PuzzleForm
        mode="edit"
        puzzleId={puzzle.id}
        initialValues={initialValues}
        categories={categories}
        locale={locale}
      />
    </div>
  );
}
