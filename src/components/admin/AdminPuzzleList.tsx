"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeletePuzzleDialog } from "@/components/admin/DeletePuzzleDialog";
import { useToast } from "@/hooks/use-toast";
import type { AdminPuzzleRow } from "@/lib/api/admin-puzzle-types";

interface AdminPuzzleListProps {
  rows: AdminPuzzleRow[];
  locale: string;
  page: number;
  totalPages: number;
}

const PRICE_FORMATTERS: Record<string, Intl.NumberFormat> = {};
function formatPrice(value: number, locale: string): string {
  if (!PRICE_FORMATTERS[locale]) {
    PRICE_FORMATTERS[locale] = new Intl.NumberFormat(
      locale === "uk" ? "uk-UA" : "en-US",
      { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    );
  }
  return `${PRICE_FORMATTERS[locale].format(value)} ₴`;
}

export function AdminPuzzleList({
  rows,
  locale,
  page,
  totalPages,
}: AdminPuzzleListProps) {
  const t = useTranslations("admin.puzzles");
  const router = useRouter();
  const { toast } = useToast();
  const [target, setTarget] = useState<AdminPuzzleRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!target) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/puzzles/${target.id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        throw new Error(`HTTP ${res.status}`);
      }
      toast({
        title: t("toast.deleted"),
      });
      setTarget(null);
      router.refresh();
    } catch {
      toast({
        title: t("toast.deleteFailed"),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  function gotoPage(next: number) {
    const url = new URL(window.location.href);
    if (next <= 1) {
      url.searchParams.delete("page");
    } else {
      url.searchParams.set("page", String(next));
    }
    router.replace(`${url.pathname}${url.search}`, { scroll: false });
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-base font-semibold">{t("empty.title")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("empty.description")}
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/puzzles/new">{t("create")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">{t("table.image")}</TableHead>
            <TableHead>{t("table.title")}</TableHead>
            <TableHead>{t("table.category")}</TableHead>
            <TableHead className="text-right">{t("table.pieces")}</TableHead>
            <TableHead className="text-right">{t("table.price")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
            <TableHead className="w-[120px] text-right">
              {t("table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const title = locale === "en" ? row.titleEn : row.title;
            const categoryName =
              locale === "en" ? row.category.nameEn : row.category.name;
            return (
              <TableRow
                key={row.id}
                className={!row.isVisible ? "opacity-60" : undefined}
              >
                <TableCell>
                  <div className="relative h-12 w-12 overflow-hidden rounded-md bg-cream">
                    {row.thumbnailUrl ? (
                      <Image
                        src={row.thumbnailUrl}
                        alt={title}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized={row.thumbnailUrl.startsWith("data:")}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        {t("table.noImage")}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{title}</TableCell>
                <TableCell>{categoryName}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.pieceCount}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatPrice(row.rentalPricePerDay, locale)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {row.isVisible ? (
                      row.isAvailable ? (
                        <Badge variant="default">
                          {t("status.available")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {t("status.unavailable")}
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline">{t("status.hidden")}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      aria-label={t("actions.edit")}
                    >
                      <Link href={`/admin/puzzles/${row.id}/edit`}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("actions.delete")}
                      onClick={() => setTarget(row)}
                      disabled={!row.isVisible}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {totalPages > 1 ? (
        <nav
          aria-label={t("pagination.label")}
          className="flex items-center justify-between gap-2 border-t border-border px-4 py-3"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => gotoPage(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            {t("pagination.prev")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("pagination.of", { page, totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => gotoPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            {t("pagination.next")}
          </Button>
        </nav>
      ) : null}

      <DeletePuzzleDialog
        puzzle={target}
        locale={locale}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => (deleting ? undefined : setTarget(null))}
      />
    </>
  );
}
