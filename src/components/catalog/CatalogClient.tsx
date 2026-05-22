"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PuzzleCard } from "@/components/catalog/PuzzleCard";
import { PuzzleCardSkeleton } from "@/components/catalog/PuzzleCardSkeleton";
import { FilterPanel, type FilterState, type ApiCategory } from "@/components/catalog/FilterPanel";
import {
  type ApiPuzzle,
  type PuzzlesApiResponse,
  type SortOption,
  pieceRangeToApiParam,
} from "@/lib/api/puzzle-types";

interface CatalogClientProps {
  locale: string;
}

const DEFAULT_FILTERS: FilterState = {
  categorySlugs: [],
  pieceRange: "all",
  available: "all",
  search: "",
};

function buildSearchParams(
  filters: FilterState,
  sort: SortOption,
  page: number
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.categorySlugs.length === 1) params.set("category", filters.categorySlugs[0]);
  if (filters.pieceRange !== "all") params.set("pieces", pieceRangeToApiParam(filters.pieceRange));
  if (filters.available !== "all") params.set("available", filters.available);
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (sort !== "newest") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  return params;
}

function readFiltersFromUrl(searchParams: URLSearchParams): {
  filters: FilterState;
  sort: SortOption;
  page: number;
} {
  const category = searchParams.get("category");
  const pieces = searchParams.get("pieces");
  const available = searchParams.get("available");
  const search = searchParams.get("search");
  const sort = (searchParams.get("sort") as SortOption) || "newest";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const pieceRange = (() => {
    if (!pieces) return "all" as const;
    if (pieces === "100-500") return "100-500" as const;
    if (pieces === "500-1000") return "500-1000" as const;
    if (pieces === "1000-2000") return "1000-2000" as const;
    return "2000+" as const;
  })();

  return {
    filters: {
      categorySlugs: category ? [category] : [],
      pieceRange,
      available: (available as "all" | "true" | "false") || "all",
      search: search || "",
    },
    sort,
    page,
  };
}

export function CatalogClient({ locale }: CatalogClientProps) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initial = readFiltersFromUrl(searchParams);
  const [filters, setFilters] = useState<FilterState>(initial.filters);
  const [sort, setSort] = useState<SortOption>(initial.sort);
  const [page, setPage] = useState(initial.page);

  const [puzzles, setPuzzles] = useState<ApiPuzzle[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<ApiCategory[]>([]);

  // Fetch categories once
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: { categories: ApiCategory[] }) => setCategories(data.categories))
      .catch(() => {/* non-critical */});
  }, []);

  const fetchPuzzles = useCallback(
    async (f: FilterState, s: SortOption, p: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = buildSearchParams(f, s, p);
        const res = await fetch(`/api/puzzles?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: PuzzlesApiResponse = await res.json();
        setPuzzles(data.puzzles);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch {
        setError(t("errorLoading"));
        setPuzzles([]);
        setTotalPages(0);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  // Sync URL and fetch when filters/sort/page change
  useEffect(() => {
    const params = buildSearchParams(filters, sort, page);
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => {
      router.replace(newUrl, { scroll: false });
    });
    fetchPuzzles(filters, sort, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, page]);

  function handleFiltersChange(next: FilterState) {
    setFilters(next);
    setPage(1);
  }

  function handleSortChange(next: SortOption) {
    setSort(next);
    setPage(1);
  }

  const skeletonCount = 6;

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
            <FilterPanel
              filters={filters}
              categories={categories}
              locale={locale}
              onChange={handleFiltersChange}
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar: count + mobile filter + sort */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile filter trigger */}
              <div className="lg:hidden">
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
                      <FilterPanel
                        filters={filters}
                        categories={categories}
                        locale={locale}
                        onChange={handleFiltersChange}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              {!loading && (
                <span className="text-sm text-muted-foreground">
                  {total} {t("resultsCount")}
                </span>
              )}
            </div>

            {/* Sort */}
            <Select value={sort} onValueChange={(v) => handleSortChange(v as SortOption)}>
              <SelectTrigger className="w-44" aria-label={t("sort")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("sortNewest")}</SelectItem>
                <SelectItem value="popular">{t("sortPopular")}</SelectItem>
                <SelectItem value="price_asc">{t("sortPriceAsc")}</SelectItem>
                <SelectItem value="price_desc">{t("sortPriceDesc")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {/* Grid */}
          {loading || isPending ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <PuzzleCardSkeleton key={i} />
              ))}
            </div>
          ) : puzzles.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white py-20 text-center">
              <p className="text-lg font-semibold text-foreground">{t("emptyTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("emptyDescription")}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => { setFilters(DEFAULT_FILTERS); setPage(1); }}
              >
                {t("filtersClear")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {puzzles.map((puzzle) => (
                <PuzzleCard key={puzzle.id} puzzle={puzzle} locale={locale} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <nav
              aria-label={t("pagination")}
              className="mt-8 flex items-center justify-center gap-2"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label={t("paginationPrev")}
              >
                {t("paginationPrev")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t("paginationOf", { page, totalPages })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                aria-label={t("paginationNext")}
              >
                {t("paginationNext")}
              </Button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
