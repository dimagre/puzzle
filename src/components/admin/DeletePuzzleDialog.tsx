"use client";

import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AdminPuzzleRow } from "@/lib/api/admin-puzzle-types";

interface DeletePuzzleDialogProps {
  puzzle: AdminPuzzleRow | null;
  locale: string;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeletePuzzleDialog({
  puzzle,
  locale,
  loading,
  onConfirm,
  onClose,
}: DeletePuzzleDialogProps) {
  const t = useTranslations("admin.puzzles.delete");
  const title = puzzle
    ? locale === "en"
      ? puzzle.titleEn
      : puzzle.title
    : "";

  return (
    <AlertDialog
      open={!!puzzle}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("description", { title })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? t("confirming") : t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
