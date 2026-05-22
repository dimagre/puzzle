"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ApiPuzzle, type ApiPuzzleCondition } from "@/lib/api/puzzle-types";

interface PuzzleCardProps {
  puzzle: ApiPuzzle;
  locale: string;
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

export function PuzzleCard({ puzzle, locale }: PuzzleCardProps) {
  const t = useTranslations("catalog");
  const title = locale === "en" ? puzzle.titleEn : puzzle.title;
  const categoryLabel = locale === "en" ? puzzle.category.nameEn : puzzle.category.name;

  return (
    <Link
      href={`/catalog/${puzzle.id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 rounded-lg"
      aria-label={title}
    >
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-shadow group-hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-cream">
        {puzzle.imageUrl ? (
          <Image
            src={puzzle.imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-cream">
            <span className="text-4xl" aria-hidden="true">🧩</span>
          </div>
        )}
        <div className="absolute left-2 top-2">
          <Badge className={conditionColors[puzzle.condition]}>
            {t(`conditions.${conditionI18nKey[puzzle.condition]}`)}
          </Badge>
        </div>
        {!puzzle.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded bg-black/70 px-2 py-1 text-sm font-semibold text-white">
              {t("unavailable")}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {title}
        </h3>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {puzzle.pieces} {t("pieces")}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {categoryLabel}
          </Badge>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-sage">
            {puzzle.pricePerDay} {t("perDay")}
          </span>
          <Button
            size="sm"
            className="bg-terracotta text-white hover:bg-terracotta/90"
            aria-label={`${t("rent")} — ${title}`}
            disabled={!puzzle.isAvailable}
          >
            {t("rent")}
          </Button>
        </div>
      </div>
    </article>
    </Link>
  );
}
