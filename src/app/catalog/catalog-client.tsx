"use client";

import { useState, useEffect } from "react";
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
import { PuzzleCard } from "@/components/puzzle-card";
import { PuzzleCardSkeleton } from "@/components/puzzle-card-skeleton";
import { FilterPanel, type FilterState } from "@/components/filter-panel";
import { MOCK_PUZZLES, type Puzzle } from "@/lib/mock-data";

function matchesPieceCount(pieces: number, range: FilterState["pieceCount"]) {
  if (!range) return true;
  if (range === "100-500") return pieces >= 100 && pieces <= 500;
  if (range === "500-1000") return pieces > 500 && pieces <= 1000;
  if (range === "1000-2000") return pieces > 1000 && pieces <= 2000;
  if (range === "2000+") return pieces > 2000;
  return true;
}

function applyFilters(puzzles: Puzzle[], filters: FilterState): Puzzle[] {
  return puzzles.filter((p) => {
    if (filters.categories.length > 0 && !filters.categories.includes(p.category))
      return false;
    if (!matchesPieceCount(p.pieces, filters.pieceCount)) return false;
    if (filters.condition && p.condition !== filters.condition) return false;
    if (filters.type && p.type !== filters.type) return false;
    return true;
  });
}

export function CatalogClient() {
  const t = useTranslations("catalog");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    pieceCount: "",
    condition: "",
    type: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered = applyFilters(MOCK_PUZZLES, filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sage">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="flex gap-8">
        {/* Desktop filter sidebar */}
        <aside
          className="hidden w-56 shrink-0 lg:block"
          aria-label={t("filters")}
        >
          <div className="sticky top-4 rounded-lg border border-border bg-white p-5">
            <h2 className="mb-4 text-base font-semibold text-foreground">
              {t("filters")}
            </h2>
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter trigger */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <span className="text-sm text-muted-foreground">
              {filtered.length} {t("subtitle")}
            </span>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  aria-label={t("filtersOpen")}
                >
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
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              aria-label={t("loading")}
              aria-busy="true"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <PuzzleCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white py-20 text-center">
              <p className="text-lg font-semibold text-foreground">
                {t("noResults")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("noResultsHint")}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-terracotta text-terracotta hover:bg-terracotta hover:text-white"
                onClick={() =>
                  setFilters({
                    categories: [],
                    pieceCount: "",
                    condition: "",
                    type: "",
                  })
                }
              >
                {t("clearFilters")}
              </Button>
            </div>
          ) : (
            <ul
              className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              aria-label={t("title")}
            >
              {filtered.map((puzzle) => (
                <li key={puzzle.id}>
                  <PuzzleCard puzzle={puzzle} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
