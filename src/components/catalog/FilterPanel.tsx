"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { type PieceCountRange } from "@/lib/api/puzzle-types";

const PIECE_RANGES: PieceCountRange[] = ["100-500", "500-1000", "1000-2000", "2000+"];

export interface ApiCategory {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
}

export interface FilterState {
  categorySlugs: string[];
  pieceRange: PieceCountRange | "all";
  available: "all" | "true" | "false";
  search: string;
}

interface FilterPanelProps {
  filters: FilterState;
  categories: ApiCategory[];
  locale: string;
  onChange: (filters: FilterState) => void;
}

export function FilterPanel({ filters, categories, locale, onChange }: FilterPanelProps) {
  const t = useTranslations("catalog");

  function toggleCategory(slug: string) {
    const next = filters.categorySlugs.includes(slug)
      ? filters.categorySlugs.filter((s) => s !== slug)
      : [...filters.categorySlugs, slug];
    onChange({ ...filters, categorySlugs: next });
  }

  function clearAll() {
    onChange({ categorySlugs: [], pieceRange: "all", available: "all", search: "" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{t("filters")}</h2>
        <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs text-muted-foreground">
          {t("filtersClear")}
        </Button>
      </div>

      {/* Search */}
      <div>
        <label htmlFor="catalog-search" className="mb-2 block text-sm font-medium">
          {t("search")}
        </label>
        <input
          id="catalog-search"
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Category */}
      <fieldset>
        <legend className="mb-3 text-sm font-medium">{t("category")}</legend>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <label key={cat.slug} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                id={`cat-${cat.slug}`}
                checked={filters.categorySlugs.includes(cat.slug)}
                onCheckedChange={() => toggleCategory(cat.slug)}
              />
              <span>{locale === "en" ? cat.nameEn : cat.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Piece count */}
      <div>
        <p className="mb-2 text-sm font-medium">{t("pieceCount")}</p>
        <Select
          value={filters.pieceRange}
          onValueChange={(v) => onChange({ ...filters, pieceRange: v as PieceCountRange | "all" })}
        >
          <SelectTrigger className="w-full" aria-label={t("pieceCount")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("pieceRanges.all")}</SelectItem>
            {PIECE_RANGES.map((r) => (
              <SelectItem key={r} value={r}>{t(`pieceRanges.${r}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Availability */}
      <div>
        <p className="mb-2 text-sm font-medium">{t("availability")}</p>
        <Select
          value={filters.available}
          onValueChange={(v) => onChange({ ...filters, available: v as "all" | "true" | "false" })}
        >
          <SelectTrigger className="w-full" aria-label={t("availability")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("availabilityAll")}</SelectItem>
            <SelectItem value="true">{t("availabilityYes")}</SelectItem>
            <SelectItem value="false">{t("availabilityNo")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
