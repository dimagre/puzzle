"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useToast } from "@/hooks/use-toast";
import {
  PUZZLE_CONDITIONS,
  PUZZLE_TYPES,
  puzzleFormSchema,
  type PuzzleFormValues,
} from "@/lib/api/admin-puzzle-form";
import type { AdminCategoryOption } from "@/lib/api/admin-puzzle-types";

interface PuzzleFormProps {
  mode: "create" | "edit";
  puzzleId?: string;
  initialValues: PuzzleFormValues;
  categories: AdminCategoryOption[];
  locale: string;
}

export function PuzzleForm({
  mode,
  puzzleId,
  initialValues,
  categories,
  locale,
}: PuzzleFormProps) {
  const t = useTranslations("admin.puzzles.form");
  const tCondition = useTranslations("admin.puzzles.condition");
  const tType = useTranslations("admin.puzzles.type");
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PuzzleFormValues>({
    resolver: zodResolver(puzzleFormSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  async function onSubmit(values: PuzzleFormValues) {
    const payload = {
      ...values,
      images: values.images.map((img, idx) => ({
        url: img.url,
        alt: img.alt,
        altEn: img.altEn,
        order: idx,
      })),
    };

    const url =
      mode === "create" ? "/api/puzzles" : `/api/puzzles/${puzzleId}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let detail = "";
        try {
          const body = (await res.json()) as { error?: { message?: string } };
          detail = body?.error?.message ?? "";
        } catch {
          /* ignore */
        }
        throw new Error(detail || `HTTP ${res.status}`);
      }
      toast({
        title: mode === "create" ? t("toast.created") : t("toast.updated"),
      });
      router.push("/admin/puzzles");
      router.refresh();
    } catch (err) {
      toast({
        title: t("toast.failed"),
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-lg border border-border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">{t("sections.basics")}</h2>

        <Tabs defaultValue={locale === "en" ? "en" : "uk"} className="w-full">
          <TabsList>
            <TabsTrigger value="uk">{t("lang.uk")}</TabsTrigger>
            <TabsTrigger value="en">{t("lang.en")}</TabsTrigger>
          </TabsList>
          <TabsContent value="uk" className="space-y-4">
            <FieldRow
              id="title"
              label={t("fields.titleUk")}
              error={errors.title?.message}
            >
              <Input id="title" {...register("title")} />
            </FieldRow>
            <FieldRow
              id="description"
              label={t("fields.descriptionUk")}
              error={errors.description?.message}
            >
              <Textarea
                id="description"
                rows={4}
                {...register("description")}
              />
            </FieldRow>
          </TabsContent>
          <TabsContent value="en" className="space-y-4">
            <FieldRow
              id="titleEn"
              label={t("fields.titleEn")}
              error={errors.titleEn?.message}
            >
              <Input id="titleEn" {...register("titleEn")} />
            </FieldRow>
            <FieldRow
              id="descriptionEn"
              label={t("fields.descriptionEn")}
              error={errors.descriptionEn?.message}
            >
              <Textarea
                id="descriptionEn"
                rows={4}
                {...register("descriptionEn")}
              />
            </FieldRow>
          </TabsContent>
        </Tabs>
      </section>

      <section className="rounded-lg border border-border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">{t("sections.details")}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldRow
            id="categoryId"
            label={t("fields.category")}
            error={errors.categoryId?.message}
          >
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder={t("placeholders.category")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {locale === "en" ? cat.nameEn : cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldRow>

          <FieldRow
            id="pieceCount"
            label={t("fields.pieceCount")}
            error={errors.pieceCount?.message}
          >
            <Input
              id="pieceCount"
              type="number"
              min={1}
              max={100000}
              {...register("pieceCount", { valueAsNumber: true })}
            />
          </FieldRow>

          <FieldRow
            id="condition"
            label={t("fields.condition")}
            error={errors.condition?.message}
          >
            <Controller
              control={control}
              name="condition"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PUZZLE_CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {tCondition(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldRow>

          <FieldRow
            id="type"
            label={t("fields.type")}
            error={errors.type?.message}
          >
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PUZZLE_TYPES.map((tp) => (
                      <SelectItem key={tp} value={tp}>
                        {tType(tp)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldRow>

          <FieldRow
            id="rentalPricePerDay"
            label={t("fields.rentalPricePerDay")}
            error={errors.rentalPricePerDay?.message}
            hint={t("hints.uah")}
          >
            <Input
              id="rentalPricePerDay"
              inputMode="decimal"
              {...register("rentalPricePerDay")}
            />
          </FieldRow>

          <FieldRow
            id="depositAmount"
            label={t("fields.depositAmount")}
            error={errors.depositAmount?.message}
            hint={t("hints.uah")}
          >
            <Input
              id="depositAmount"
              inputMode="decimal"
              {...register("depositAmount")}
            />
          </FieldRow>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Controller
            control={control}
            name="isAvailable"
            render={({ field }) => (
              <Checkbox
                id="isAvailable"
                checked={field.value}
                onCheckedChange={(v) => field.onChange(v === true)}
              />
            )}
          />
          <Label htmlFor="isAvailable">{t("fields.isAvailable")}</Label>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold">
          {t("sections.images")}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t("sections.imagesDescription")}
        </p>
        <Controller
          control={control}
          name="images"
          render={({ field, fieldState }) => (
            <ImageUploader
              value={field.value}
              onChange={field.onChange}
              defaultAlt={initialValues.title || ""}
              defaultAltEn={initialValues.titleEn || ""}
              error={
                fieldState.error?.message ??
                (Array.isArray(errors.images)
                  ? errors.images.find((e) => !!e)?.url?.message ??
                    errors.images.find((e) => !!e)?.alt?.message ??
                    errors.images.find((e) => !!e)?.altEn?.message
                  : undefined)
              }
            />
          )}
        />
      </section>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-cream px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Button type="button" variant="outline" asChild disabled={isSubmitting}>
          <Link href="/admin/puzzles">{t("actions.cancel")}</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting || (!isDirty && mode === "edit")}>
          {isSubmitting
            ? t("actions.saving")
            : mode === "create"
              ? t("actions.create")
              : t("actions.save")}
        </Button>
      </div>
    </form>
  );
}

interface FieldRowProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function FieldRow({ id, label, error, hint, children }: FieldRowProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
