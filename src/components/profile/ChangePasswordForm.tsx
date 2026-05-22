"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { changePasswordSchema } from "@/lib/validation/profile";

const formSchema = changePasswordSchema
  .extend({
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwords-must-match",
  });

type FormValues = z.infer<typeof formSchema>;

export function ChangePasswordForm() {
  const t = useTranslations("profile.password");
  const tValidation = useTranslations("profile.validation");
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      if (res.status === 401) {
        setServerError(tValidation("currentPasswordInvalid"));
        toast({
          title: t("toast.failed"),
          description: tValidation("currentPasswordInvalid"),
          variant: "destructive",
        });
        return;
      }
      if (!res.ok) {
        const detail = await safeReadError(res);
        throw new Error(detail);
      }
      toast({ title: t("toast.changed") });
      reset();
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
      <div className="space-y-1">
        <Label htmlFor="currentPassword">
          {t("current")}
          <span className="ml-0.5 text-destructive">*</span>
        </Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          {...register("currentPassword")}
        />
        {errors.currentPassword ? (
          <p role="alert" className="text-xs text-destructive">
            {tValidation("currentPasswordRequired")}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="newPassword">
          {t("new")}
          <span className="ml-0.5 text-destructive">*</span>
        </Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          {...register("newPassword")}
        />
        <p className="text-xs text-muted-foreground">{t("hint")}</p>
        {errors.newPassword ? (
          <p role="alert" className="text-xs text-destructive">
            {tValidation("passwordTooShort")}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="confirmPassword">
          {t("confirm")}
          <span className="ml-0.5 text-destructive">*</span>
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p role="alert" className="text-xs text-destructive">
            {tValidation("passwordsMustMatch")}
          </p>
        ) : null}
      </div>

      {serverError ? (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      ) : null}

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
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
