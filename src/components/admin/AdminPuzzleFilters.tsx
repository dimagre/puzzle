"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { AdminCategoryOption } from "@/lib/api/admin-puzzle-types";

interface FiltersState {
  search: string;
  category: string;
  visibility: "all" | "visible" | "hidden";
  available: "all" | "true" | "false";
}

interface AdminPuzzleFiltersProps {
  categories: AdminCategoryOption[];
  locale: string;
  defaults: FiltersState;
}

export function AdminPuzzleFilters({
  categories,
  locale,
  defaults,
}: AdminPuzzleFiltersProps) {
  const t = useTranslations("admin.puzzles.filters");
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [state, setState] = useState<FiltersState>(defaults);

  const apply = useCallback(
    (next: FiltersState) => {
      const params = new URLSearchParams();
      if (next.search.trim()) params.set("search", next.search.trim());
      if (next.category !== "all") params.set("category", next.category);
      if (next.visibility !== "all") params.set("visibility", next.visibility);
      if (next.available !== "all") params.set("available", next.available);
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `/admin/puzzles?${qs}` : "/admin/puzzles", {
          scroll: false,
        });
      });
    },
    [router],
  );

  function update<K extends keyof FiltersState>(key: K, value: FiltersState[K]) {
    const next = { ...state, [key]: value };
    setState(next);
    if (key !== "search") apply(next);
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    apply(state);
  }

  function reset() {
    const next: FiltersState = {
      search: "",
      category: "all",
      visibility: "all",
      available: "all",
    };
    setState(next);
    apply(next);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 sm:flex-row sm:items-end">
      <form onSubmit={onSearchSubmit} className="flex-1">
        <label
          htmlFor="admin-puzzle-search"
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          {t("search")}
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="admin-puzzle-search"
            value={state.search}
            placeholder={t("searchPlaceholder")}
            onChange={(e) => setState((s) => ({ ...s, search: e.target.value }))}
            className="pl-9"
          />
        </div>
      </form>

      <div className="flex-1 sm:max-w-[14rem]">
        <label
          htmlFor="admin-puzzle-category"
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          {t("category")}
        </label>
        <Select
          value={state.category}
          onValueChange={(v) => update("category", v)}
        >
          <SelectTrigger id="admin-puzzle-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("categoryAll")}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {locale === "en" ? cat.nameEn : cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="sm:w-40">
        <label
          htmlFor="admin-puzzle-visibility"
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          {t("visibility")}
        </label>
        <Select
          value={state.visibility}
          onValueChange={(v) =>
            update("visibility", v as FiltersState["visibility"])
          }
        >
          <SelectTrigger id="admin-puzzle-visibility">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("visibilityAll")}</SelectItem>
            <SelectItem value="visible">{t("visibilityVisible")}</SelectItem>
            <SelectItem value="hidden">{t("visibilityHidden")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="sm:w-40">
        <label
          htmlFor="admin-puzzle-available"
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          {t("availability")}
        </label>
        <Select
          value={state.available}
          onValueChange={(v) =>
            update("available", v as FiltersState["available"])
          }
        >
          <SelectTrigger id="admin-puzzle-available">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("availabilityAll")}</SelectItem>
            <SelectItem value="true">{t("availabilityYes")}</SelectItem>
            <SelectItem value="false">{t("availabilityNo")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={reset}
        className="self-end"
      >
        {t("reset")}
      </Button>
    </div>
  );
}
