"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PuzzleCard } from "@/components/catalog/PuzzleCard";
import { PuzzleCardSkeleton } from "@/components/catalog/PuzzleCardSkeleton";
import { FilterPanel, type FilterState } from "@/components/catalog/FilterPanel";
import { MOCK_PUZZLES, matchesPieceRange } from "@/lib/mock-data";

interface CatalogClientProps {
  locale: string;
}

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  pieceRange: "all",
  condition: "all",
  type: "all",
};

export function CatalogClient({ locale }: CatalogClientProps) {
  const t = useTranslations("catalog");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);

  // Simulate brief loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return MOCK_PUZZLES.filter((p) => {
      if (filters.categories.length > 0 && !filters.categories.includes(p.category)) return false;
      if (filters.pieceRange !== "all" && !matchesPieceRange(p.pieces, filters.pieceRange)) return false;
      if (filters.condition !== "all" && p.condition !== filters.condition) return false;
      if (filters.type !== "all" && p.type !== filters.type) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sage">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="flex gap-8">
        {/* Desktop filter sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-4 rounded-lg border border-border bg-white p-5">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter trigger */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <span className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "пазл" : "пазлів"}
            </span>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  {t("filters")}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{t("filters")}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanel filters={filters} onChange={setFilters} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PuzzleCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white py-20 text-center">
              <p className="text-lg font-semibold text-foreground">{t("emptyTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("emptyDescription")}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setFilters(DEFAULT_FILTERS)}
              >
                {t("filtersClear")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((puzzle) => (
                <PuzzleCard key={puzzle.id} puzzle={puzzle} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
