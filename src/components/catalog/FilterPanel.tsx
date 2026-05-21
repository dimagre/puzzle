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
import { type PuzzleCategory, type PuzzleCondition, type PuzzleType, type PieceCountRange } from "@/lib/mock-data";

const CATEGORIES: PuzzleCategory[] = ["landscape", "animals", "art", "cities", "fantasy", "abstract"];
const PIECE_RANGES: PieceCountRange[] = ["100-500", "500-1000", "1000-2000", "2000+"];
const CONDITIONS: PuzzleCondition[] = ["new", "excellent", "good", "fair"];
const TYPES: PuzzleType[] = ["standard", "panoramic", "shaped", "3d"];

export interface FilterState {
  categories: PuzzleCategory[];
  pieceRange: PieceCountRange | "all";
  condition: PuzzleCondition | "all";
  type: PuzzleType | "all";
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const t = useTranslations("catalog");

  function toggleCategory(cat: PuzzleCategory) {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  }

  function clearAll() {
    onChange({ categories: [], pieceRange: "all", condition: "all", type: "all" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{t("filters")}</h2>
        <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs text-muted-foreground">
          {t("filtersClear")}
        </Button>
      </div>

      {/* Category */}
      <fieldset>
        <legend className="mb-3 text-sm font-medium">{t("category")}</legend>
        <div className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                id={`cat-${cat}`}
                checked={filters.categories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
              />
              <span>{t(`categories.${cat}`)}</span>
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

      {/* Condition */}
      <div>
        <p className="mb-2 text-sm font-medium">{t("condition")}</p>
        <Select
          value={filters.condition}
          onValueChange={(v) => onChange({ ...filters, condition: v as PuzzleCondition | "all" })}
        >
          <SelectTrigger className="w-full" aria-label={t("condition")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("conditionAll")}</SelectItem>
            {CONDITIONS.map((c) => (
              <SelectItem key={c} value={c}>{t(`conditions.${c}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type */}
      <div>
        <p className="mb-2 text-sm font-medium">{t("type")}</p>
        <Select
          value={filters.type}
          onValueChange={(v) => onChange({ ...filters, type: v as PuzzleType | "all" })}
        >
          <SelectTrigger className="w-full" aria-label={t("type")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("types.all")}</SelectItem>
            {TYPES.map((tp) => (
              <SelectItem key={tp} value={tp}>{t(`types.${tp}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
