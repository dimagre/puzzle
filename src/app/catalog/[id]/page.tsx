import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { PuzzleGallery } from "@/components/puzzle-detail/PuzzleGallery";
import { RentButton } from "@/components/puzzle-detail/RentButton";
import { type ApiPuzzle, type ApiPuzzleCondition } from "@/lib/api/puzzle-types";

interface PageProps {
  params: { id: string };
}

async function fetchPuzzle(id: string): Promise<ApiPuzzle | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/puzzles/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch puzzle: ${res.status}`);
  return res.json() as Promise<ApiPuzzle>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "uk";
  try {
    const puzzle = await fetchPuzzle(params.id);
    if (!puzzle) return { title: "Not Found" };
    const title = locale === "en" ? puzzle.titleEn : puzzle.title;
    const description = locale === "en" ? puzzle.descriptionEn : puzzle.description;
    return {
      title: `${title} — PuzzleShare`,
      description: description.slice(0, 160),
    };
  } catch {
    return { title: "PuzzleShare" };
  }
}

const conditionColors: Record<ApiPuzzleCondition, string> = {
  NEW: "bg-sage text-white",
  LIKE_NEW: "bg-green-600 text-white",
  GOOD: "bg-yellow-500 text-white",
  FAIR: "bg-orange-400 text-white",
};

const conditionI18nKey: Record<ApiPuzzleCondition, string> = {
  NEW: "new",
  LIKE_NEW: "excellent",
  GOOD: "good",
  FAIR: "fair",
};

export default async function PuzzleDetailPage({ params }: PageProps) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "uk";
  const t = await getTranslations("puzzleDetail");

  let puzzle: ApiPuzzle | null;
  try {
    puzzle = await fetchPuzzle(params.id);
  } catch {
    puzzle = null;
  }

  if (!puzzle) notFound();

  const title = locale === "en" ? puzzle.titleEn : puzzle.title;
  const description = locale === "en" ? puzzle.descriptionEn : puzzle.description;
  const categoryLabel = locale === "en" ? puzzle.category.nameEn : puzzle.category.name;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">{t("breadcrumbHome")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/catalog">{t("breadcrumbCatalog")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Main layout: single column on mobile, side-by-side on md+ */}
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {/* Gallery — left on desktop */}
        <div className="w-full md:w-1/2 lg:w-3/5">
          <PuzzleGallery images={puzzle.images} title={title} locale={locale} />
        </div>

        {/* Info — right on desktop */}
        <div className="flex w-full flex-col gap-5 md:w-1/2 lg:w-2/5">
          {/* Title */}
          <h1 className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">
            {title}
          </h1>

          {/* Availability badge */}
          <div>
            {puzzle.isAvailable ? (
              <Badge className="bg-sage text-white">{t("available")}</Badge>
            ) : (
              <Badge className="bg-destructive text-white">{t("unavailable")}</Badge>
            )}
          </div>

          {/* Pricing */}
          <div className="flex flex-wrap items-baseline gap-4 rounded-lg border border-border bg-white p-4">
            <div>
              <span className="text-3xl font-bold text-sage">
                {puzzle.pricePerDay}
              </span>
              <span className="ml-1 text-sm text-muted-foreground">{t("pricePerDay")}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {t("deposit")}: <span className="font-semibold text-foreground">{puzzle.depositAmount} {t("depositAmount")}</span>
            </div>
          </div>

          {/* Metadata */}
          <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-white p-4 text-sm">
            <div>
              <dt className="text-muted-foreground">{t("pieces")}</dt>
              <dd className="font-semibold">{puzzle.pieces}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("category")}</dt>
              <dd className="font-semibold">{categoryLabel}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("condition")}</dt>
              <dd>
                <Badge className={conditionColors[puzzle.condition]}>
                  {t(`conditions.${conditionI18nKey[puzzle.condition]}`)}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("type")}</dt>
              <dd className="font-semibold">{t(`types.${puzzle.type}`)}</dd>
            </div>
          </dl>

          {/* Description */}
          {description && (
            <div className="rounded-lg border border-border bg-white p-4">
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {t("description")}
              </h2>
              <p className="text-sm leading-relaxed text-foreground">{description}</p>
            </div>
          )}

          {/* Rent button */}
          <RentButton isAvailable={puzzle.isAvailable} />
        </div>
      </div>
    </div>
  );
}
