"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validation/profile";
import type { ProfileDto } from "@/lib/api/profile-serialize";

interface ProfileInfoFormProps {
  profile: ProfileDto;
}

type FormValues = {
  name: string;
  phone: string;
  deliveryRegion: string;
  deliveryCity: string;
  deliveryNovaPoshtaWarehouse: string;
};

function toFormValues(profile: ProfileDto): FormValues {
  return {
    name: profile.name ?? "",
    phone: profile.phone ?? "",
    deliveryRegion: profile.deliveryRegion ?? "",
    deliveryCity: profile.deliveryCity ?? "",
    deliveryNovaPoshtaWarehouse: profile.deliveryNovaPoshtaWarehouse ?? "",
  };
}

const formSchema = updateProfileSchema;

export function ProfileInfoForm({ profile }: ProfileInfoFormProps) {
  const t = useTranslations("profile.info");
  const tValidation = useTranslations("profile.validation");
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormValues(profile),
    mode: "onBlur",
  });

  async function onSubmit(values: UpdateProfileInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const detail = await safeReadError(res);
        throw new Error(detail);
      }
      const updated = (await res.json()) as ProfileDto;
      toast({ title: t("toast.saved") });
      reset(toFormValues(updated));
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("toast.failed");
      setServerError(message);
      toast({
        title: t("toast.failed"),
        description: message,
        variant: "destructive",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FieldRow id="name" label={t("name")} required error={errors.name?.message ? tValidation("nameRequired") : undefined}>
        <Input id="name" autoComplete="name" {...register("name")} />
      </FieldRow>

      <FieldRow id="email" label={t("email")} hint={t("emailHint")}>
        <Input id="email" type="email" value={profile.email} readOnly disabled />
      </FieldRow>

      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <FieldRow
            id="phone"
            label={t("phone")}
            hint={t("phoneHint")}
            error={fieldState.error?.message ? tValidation("phoneInvalid") : undefined}
          >
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+380XXXXXXXXX"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
            />
          </FieldRow>
        )}
      />

      <h3 className="pt-4 text-base font-semibold">{t("deliveryHeading")}</h3>
      <p className="text-xs text-muted-foreground">{t("deliveryHint")}</p>

      <Controller
        control={control}
        name="deliveryRegion"
        render={({ field }) => (
          <FieldRow id="deliveryRegion" label={t("region")}>
            <Input
              id="deliveryRegion"
              autoComplete="address-level1"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
            />
          </FieldRow>
        )}
      />

      <Controller
        control={control}
        name="deliveryCity"
        render={({ field }) => (
          <FieldRow id="deliveryCity" label={t("city")}>
            <Input
              id="deliveryCity"
              autoComplete="address-level2"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
            />
          </FieldRow>
        )}
      />

      <Controller
        control={control}
        name="deliveryNovaPoshtaWarehouse"
        render={({ field }) => (
          <FieldRow
            id="deliveryNovaPoshtaWarehouse"
            label={t("warehouse")}
            hint={t("warehouseHint")}
          >
            <Input
              id="deliveryNovaPoshtaWarehouse"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
            />
          </FieldRow>
        )}
      />

      {serverError ? (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      ) : null}

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}

interface FieldRowProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

function FieldRow({ id, label, required, hint, error, children }: FieldRowProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
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

async function safeReadError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    return body?.error?.message ?? `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}
