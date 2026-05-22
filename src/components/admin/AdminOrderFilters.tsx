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
import { ORDER_STATUS_VALUES } from "@/lib/validation/admin-orders";

interface FiltersState {
  search: string;
  status: string;
  from: string;
  to: string;
}

interface AdminOrderFiltersProps {
  defaults: FiltersState;
}

export function AdminOrderFilters({ defaults }: AdminOrderFiltersProps) {
  const t = useTranslations("admin.orders.filters");
  const tStatus = useTranslations("orderStatus");
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [state, setState] = useState<FiltersState>(defaults);

  const apply = useCallback(
    (next: FiltersState) => {
      const params = new URLSearchParams();
      if (next.search.trim()) params.set("customer", next.search.trim());
      if (next.status !== "all") params.set("status", next.status);
      if (next.from) params.set("from", next.from);
      if (next.to) params.set("to", next.to);
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `/admin/orders?${qs}` : "/admin/orders", {
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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    apply(state);
  }

  function reset() {
    const next: FiltersState = { search: "", status: "all", from: "", to: "" };
    setState(next);
    apply(next);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="flex-1 sm:min-w-[12rem]">
        <label
          htmlFor="admin-orders-search"
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
            id="admin-orders-search"
            value={state.search}
            placeholder={t("searchPlaceholder")}
            onChange={(e) => setState((s) => ({ ...s, search: e.target.value }))}
            className="pl-9"
          />
        </div>
      </div>

      <div className="sm:w-44">
        <label
          htmlFor="admin-orders-status"
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          {t("status")}
        </label>
        <Select
          value={state.status}
          onValueChange={(v) => update("status", v)}
        >
          <SelectTrigger id="admin-orders-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("statusAll")}</SelectItem>
            {ORDER_STATUS_VALUES.map((status) => (
              <SelectItem key={status} value={status}>
                {tStatus(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="sm:w-40">
        <label
          htmlFor="admin-orders-from"
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          {t("from")}
        </label>
        <Input
          id="admin-orders-from"
          type="date"
          value={state.from}
          onChange={(e) =>
            update("from", e.target.value as FiltersState["from"])
          }
        />
      </div>

      <div className="sm:w-40">
        <label
          htmlFor="admin-orders-to"
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          {t("to")}
        </label>
        <Input
          id="admin-orders-to"
          type="date"
          value={state.to}
          onChange={(e) =>
            update("to", e.target.value as FiltersState["to"])
          }
        />
      </div>

      <div className="flex gap-2 sm:self-end">
        <Button type="submit" size="sm">
          {t("apply")}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          {t("reset")}
        </Button>
      </div>
    </form>
  );
}
