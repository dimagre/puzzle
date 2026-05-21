"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Puzzle, type PuzzleCondition } from "@/lib/mock-data";

interface PuzzleCardProps {
  puzzle: Puzzle;
}

const conditionColors: Record<PuzzleCondition, string> = {
  new: "bg-sage text-white",
  excellent: "bg-green-600 text-white",
  good: "bg-yellow-500 text-white",
  fair: "bg-terracotta text-white",
};

export function PuzzleCard({ puzzle }: PuzzleCardProps) {
  const t = useTranslations("catalog");
  const locale = useLocale();
  const title = locale === "en" ? puzzle.titleEn : puzzle.title;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-muted">
        <Image
          src={puzzle.imageUrl}
          alt={title}
          fill
          className="object-cover"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute right-2 top-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${conditionColors[puzzle.condition]}`}
          >
            {t(`conditions.${puzzle.condition}`)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {title}
        </h3>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">
            {puzzle.pieces} {t("pieces")}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {t(`types.${puzzle.type}`)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {t(`categories.${puzzle.category}`)}
          </Badge>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-sage">
            {puzzle.pricePerDay}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              {t("perDay")}
            </span>
          </span>
          <Button size="sm" className="bg-sage hover:bg-sage/90 text-white">
            {t("rent")}
          </Button>
        </div>
      </div>
    </article>
  );
}
