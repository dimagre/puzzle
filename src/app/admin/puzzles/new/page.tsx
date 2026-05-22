import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { PuzzleForm } from "@/components/admin/PuzzleForm";
import type { PuzzleFormValues } from "@/lib/api/admin-puzzle-form";

export const dynamic = "force-dynamic";

export default async function NewAdminPuzzlePage() {
  const t = await getTranslations("admin.puzzles");
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "uk";

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, nameEn: true, slug: true },
  });

  const initialValues: PuzzleFormValues = {
    title: "",
    titleEn: "",
    description: "",
    descriptionEn: "",
    pieceCount: 500,
    condition: "NEW",
    type: "CLASSIC",
    rentalPricePerDay: "100.00",
    depositAmount: "500.00",
    isAvailable: true,
    categoryId: categories[0]?.id ?? "",
    images: [],
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
      <h1 className="text-2xl font-bold">{t("createTitle")}</h1>
      <PuzzleForm
        mode="create"
        initialValues={initialValues}
        categories={categories}
        locale={locale}
      />
    </div>
  );
}
