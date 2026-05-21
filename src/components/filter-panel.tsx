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
import {
  type PuzzleCategory,
  type PuzzleCondition,
  type PuzzleType,
} from "@/lib/mock-data";

export type PieceCountRange = "100-500" | "500-1000" | "1000-2000" | "2000+";

export interface FilterState {
  categories: PuzzleCategory[];
  pieceCount: PieceCountRange | "";
  condition: PuzzleCondition | "";
  type: PuzzleType | "";
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const ALL_CATEGORIES: PuzzleCategory[] = [
  "nature",
  "cities",
  "art",
  "animals",
  "fantasy",
  "abstract",
];

const PIECE_COUNT_RANGES: PieceCountRange[] = [
  "100-500",
  "500-1000",
  "1000-2000",
  "2000+",
];

const CONDITIONS: PuzzleCondition[] = ["new", "excellent", "good", "fair"];
const TYPES: PuzzleType[] = ["standard", "panoramic", "round", "3d"];

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const t = useTranslations("catalog");

  function toggleCategory(cat: PuzzleCategory) {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  }

  function clearFilters() {
    onChange({ categories: [], pieceCount: "", condition: "", type: "" });
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.pieceCount !== "" ||
    filters.condition !== "" ||
    filters.type !== "";

  return (
    <div className="flex flex-col gap-6">
      {/* Category */}
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-foreground">
          {t("category")}
        </legend>
        <div className="flex flex-col gap-2">
          {ALL_CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                id={`cat-${cat}`}
                checked={filters.categories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
                aria-label={t(`categories.${cat}`)}
              />
              <span>{t(`categories.${cat}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Piece count */}
      <div>
        <label
          htmlFor="piece-count-select"
          className="mb-2 block text-sm font-semibold text-foreground"
        >
          {t("pieceCount")}
        </label>
        <Select
          value={filters.pieceCount}
          onValueChange={(v) =>
            onChange({
              ...filters,
              pieceCount: v === "all" ? "" : (v as PieceCountRange),
            })
          }
        >
          <SelectTrigger id="piece-count-select" className="w-full">
            <SelectValue placeholder={t("allPieceCounts")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allPieceCounts")}</SelectItem>
            {PIECE_COUNT_RANGES.map((r) => (
              <SelectItem key={r} value={r}>
                {t(`pieceCounts.${r}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condition */}
      <div>
        <label
          htmlFor="condition-select"
          className="mb-2 block text-sm font-semibold text-foreground"
        >
          {t("condition")}
        </label>
        <Select
          value={filters.condition}
          onValueChange={(v) =>
            onChange({
              ...filters,
              condition: v === "all" ? "" : (v as PuzzleCondition),
            })
          }
        >
          <SelectTrigger id="condition-select" className="w-full">
            <SelectValue placeholder={t("allConditions")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allConditions")}</SelectItem>
            {CONDITIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {t(`conditions.${c}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type */}
      <div>
        <label
          htmlFor="type-select"
          className="mb-2 block text-sm font-semibold text-foreground"
        >
          {t("type")}
        </label>
        <Select
          value={filters.type}
          onValueChange={(v) =>
            onChange({
              ...filters,
              type: v === "all" ? "" : (v as PuzzleType),
            })
          }
        >
          <SelectTrigger id="type-select" className="w-full">
            <SelectValue placeholder={t("allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allTypes")}</SelectItem>
            {TYPES.map((tp) => (
              <SelectItem key={tp} value={tp}>
                {t(`types.${tp}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full border-terracotta text-terracotta hover:bg-terracotta hover:text-white"
        >
          {t("clearFilters")}
        </Button>
      )}
    </div>
  );
}
