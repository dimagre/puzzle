"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import {
  DELIVERY_METHODS,
  checkoutFormSchema,
  type CheckoutFormInput,
  type CreateOrderInput,
  type DeliveryMethodValue,
} from "@/lib/validation/checkout";
import type { ProfileDto } from "@/lib/api/profile-serialize";
import { formatPrice } from "@/lib/orders/format";

interface CheckoutClientProps {
  profile: ProfileDto;
  pickupWarehouseAddress: string;
  pickupSellerAddress: string;
}

type CheckoutFormValues = {
  deliveryMethod: DeliveryMethodValue;
  contactName: string;
  contactPhone: string;
  deliveryRegion: string;
  deliveryCity: string;
  deliveryWarehouse: string;
  deliveryStreet: string;
  deliveryPostalCode: string;
};

function defaultValues(profile: ProfileDto): CheckoutFormValues {
  return {
    deliveryMethod: "NOVA_POSHTA",
    contactName: profile.name ?? "",
    contactPhone: profile.phone ?? "",
    deliveryRegion: profile.deliveryRegion ?? "",
    deliveryCity: profile.deliveryCity ?? "",
    deliveryWarehouse: profile.deliveryNovaPoshtaWarehouse ?? "",
    deliveryStreet: "",
    deliveryPostalCode: "",
  };
}

export function CheckoutClient({
  profile,
  pickupWarehouseAddress,
  pickupSellerAddress,
}: CheckoutClientProps) {
  const t = useTranslations("checkout");
  const tDelivery = useTranslations("deliveryMethod");
  const tCart = useTranslations("cart");
  const tValidation = useTranslations("checkout.validation");
  const router = useRouter();
  const { toast } = useToast();
  const locale = useLocale();
  const { items, clearCart } = useCart();
  const [hydrated, setHydrated] = useState(false);
  const [unavailableIds, setUnavailableIds] = useState<string[]>([]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues, unknown, CheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: defaultValues(profile),
    mode: "onBlur",
  });

  const deliveryMethod = watch("deliveryMethod");

  function fieldError(name: keyof CheckoutFormValues): string | undefined {
    const err = errors[name];
    if (!err) return undefined;
    if (name === "contactName") return tValidation("nameRequired");
    if (name === "contactPhone") return tValidation("phoneInvalid");
    if (name === "deliveryRegion") return tValidation("regionRequired");
    if (name === "deliveryCity") return tValidation("cityRequired");
    if (name === "deliveryWarehouse") return tValidation("warehouseRequired");
    if (name === "deliveryStreet") return tValidation("streetRequired");
    if (name === "deliveryPostalCode") return tValidation("postalCodeRequired");
    return tValidation("fieldRequired");
  }

  const totals = useMemo(() => {
    const rental = items.reduce(
      (sum, item) => sum + item.rentalPricePerDay * item.rentalDays,
      0,
    );
    const deposit = items.reduce((sum, item) => sum + item.depositAmount, 0);
    return { rental, deposit, grand: rental + deposit };
  }, [items]);

  const itemTitle = (item: (typeof items)[number]) =>
    locale === "uk" ? item.title : item.titleEn || item.title;

  if (hydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-bold text-sage sm:text-3xl">
            {t("emptyTitle")}
          </h1>
          <p className="text-muted-foreground">{t("emptyDescription")}</p>
          <Link
            href="/catalog"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {tCart("browseCatalog")}
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(values: CheckoutFormInput) {
    setUnavailableIds([]);
    const payload: CreateOrderInput = {
      deliveryMethod: values.deliveryMethod,
      contactName: values.contactName,
      contactPhone: values.contactPhone,
      deliveryRegion: values.deliveryRegion,
      deliveryCity: values.deliveryCity,
      deliveryWarehouse: values.deliveryWarehouse,
      deliveryStreet: values.deliveryStreet,
      deliveryPostalCode: values.deliveryPostalCode,
      items: items.map((item) => ({
        puzzleId: item.puzzleId,
        rentalDays: item.rentalDays,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: { unavailablePuzzleIds?: string[]; message?: string };
        };
        const ids = body?.error?.unavailablePuzzleIds ?? [];
        setUnavailableIds(ids);
        toast({
          title: t("toast.unavailableTitle"),
          description: t("toast.unavailableDescription"),
          variant: "destructive",
        });
        return;
      }

      if (!res.ok) {
        toast({
          title: t("toast.failedTitle"),
          description: await readErrorMessage(res, t("toast.failedDescription")),
          variant: "destructive",
        });
        return;
      }

      const body = (await res.json()) as { orderId: string };
      clearCart();

      const paymentRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: body.orderId }),
      });

      if (!paymentRes.ok) {
        toast({
          title: t("toast.paymentFailedTitle"),
          description: await readErrorMessage(
            paymentRes,
            t("toast.paymentFailedDescription"),
          ),
          variant: "destructive",
        });
        router.push(
          `/checkout/payment-result?orderId=${encodeURIComponent(body.orderId)}&error=init`,
        );
        return;
      }

      const paymentBody = (await paymentRes.json()) as { paymentUrl: string };
      window.location.assign(paymentBody.paymentUrl);
    } catch {
      toast({
        title: t("toast.failedTitle"),
        description: t("toast.failedDescription"),
        variant: "destructive",
      });
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="grid gap-6 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
          <section
            aria-labelledby="delivery-method-heading"
            className="rounded-lg border border-border bg-white p-5 sm:p-6"
          >
            <h2
              id="delivery-method-heading"
              className="mb-1 text-lg font-semibold text-foreground"
            >
              {t("delivery.heading")}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("delivery.description")}
            </p>

            <Controller
              control={control}
              name="deliveryMethod"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={(v) =>
                    field.onChange(v as DeliveryMethodValue)
                  }
                  className="gap-3"
                >
                  {DELIVERY_METHODS.map((method) => (
                    <div
                      key={method}
                      className="flex items-start gap-3 rounded-md border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <RadioGroupItem
                        value={method}
                        id={`delivery-${method}`}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={`delivery-${method}`}
                        className="flex-1 cursor-pointer text-sm font-medium"
                      >
                        {tDelivery(method)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />

            <div className="mt-6 space-y-4">
              {deliveryMethod === "NOVA_POSHTA" ? (
                <>
                  <Field
                    id="deliveryRegion"
                    label={t("address.region")}
                    error={fieldError("deliveryRegion")}
                  >
                    <Input
                      id="deliveryRegion"
                      autoComplete="address-level1"
                      {...register("deliveryRegion")}
                    />
                  </Field>
                  <Field
                    id="deliveryCity"
                    label={t("address.city")}
                    error={fieldError("deliveryCity")}
                  >
                    <Input
                      id="deliveryCity"
                      autoComplete="address-level2"
                      {...register("deliveryCity")}
                    />
                  </Field>
                  <Field
                    id="deliveryWarehouse"
                    label={t("address.warehouse")}
                    hint={t("address.warehouseHint")}
                    error={fieldError("deliveryWarehouse")}
                  >
                    <Input
                      id="deliveryWarehouse"
                      {...register("deliveryWarehouse")}
                    />
                  </Field>
                </>
              ) : null}

              {deliveryMethod === "UKRPOSHTA" ? (
                <>
                  <Field
                    id="deliveryRegion"
                    label={t("address.region")}
                    error={fieldError("deliveryRegion")}
                  >
                    <Input
                      id="deliveryRegion"
                      autoComplete="address-level1"
                      {...register("deliveryRegion")}
                    />
                  </Field>
                  <Field
                    id="deliveryCity"
                    label={t("address.city")}
                    error={fieldError("deliveryCity")}
                  >
                    <Input
                      id="deliveryCity"
                      autoComplete="address-level2"
                      {...register("deliveryCity")}
                    />
                  </Field>
                  <Field
                    id="deliveryStreet"
                    label={t("address.street")}
                    error={fieldError("deliveryStreet")}
                  >
                    <Input
                      id="deliveryStreet"
                      autoComplete="street-address"
                      {...register("deliveryStreet")}
                    />
                  </Field>
                  <Field
                    id="deliveryPostalCode"
                    label={t("address.postalCode")}
                    error={fieldError("deliveryPostalCode")}
                  >
                    <Input
                      id="deliveryPostalCode"
                      autoComplete="postal-code"
                      {...register("deliveryPostalCode")}
                    />
                  </Field>
                </>
              ) : null}

              {deliveryMethod === "SELF_PICKUP_WAREHOUSE" ? (
                <PickupAddress
                  label={t("address.pickupWarehouse")}
                  address={pickupWarehouseAddress}
                  fallback={t("address.pickupNotConfigured")}
                />
              ) : null}

              {deliveryMethod === "SELF_PICKUP_SELLER" ? (
                <PickupAddress
                  label={t("address.pickupSeller")}
                  address={pickupSellerAddress}
                  fallback={t("address.pickupNotConfigured")}
                />
              ) : null}
            </div>
          </section>

          <section
            aria-labelledby="contact-heading"
            className="rounded-lg border border-border bg-white p-5 sm:p-6"
          >
            <h2
              id="contact-heading"
              className="mb-1 text-lg font-semibold text-foreground"
            >
              {t("contact.heading")}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("contact.description")}
            </p>

            <div className="space-y-4">
              <Field
                id="contactName"
                label={t("contact.name")}
                error={fieldError("contactName")}
                required
              >
                <Input
                  id="contactName"
                  autoComplete="name"
                  {...register("contactName")}
                />
              </Field>
              <Field
                id="contactPhone"
                label={t("contact.phone")}
                hint={t("contact.phoneHint")}
                error={fieldError("contactPhone")}
                required
              >
                <Input
                  id="contactPhone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+380XXXXXXXXX"
                  {...register("contactPhone")}
                />
              </Field>
            </div>
          </section>
        </div>

        <aside
          aria-labelledby="summary-heading"
          className="space-y-4 rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6 lg:h-fit"
        >
          <h2
            id="summary-heading"
            className="text-lg font-semibold text-foreground"
          >
            {t("summary.heading")}
          </h2>

          <ul className="divide-y divide-border">
            {items.map((item) => {
              const lineTotal = item.rentalPricePerDay * item.rentalDays;
              const isUnavailable = unavailableIds.includes(item.puzzleId);
              return (
                <li
                  key={item.puzzleId}
                  className={`flex gap-3 py-3 ${
                    isUnavailable ? "rounded-md bg-destructive/5 px-2" : ""
                  }`}
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={itemTitle(item)}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium leading-tight">
                      {itemTitle(item)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("summary.itemMeta", {
                        days: item.rentalDays,
                        price: formatPrice(item.rentalPricePerDay, locale),
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("summary.deposit")}:{" "}
                      {formatPrice(item.depositAmount, locale)}
                    </p>
                    {isUnavailable ? (
                      <p
                        role="alert"
                        className="mt-1 text-xs font-medium text-destructive"
                      >
                        {t("summary.unavailable")}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right text-sm font-semibold tabular-nums">
                    {formatPrice(lineTotal, locale)}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("summary.rentalSubtotal")}
              </span>
              <span className="tabular-nums">
                {formatPrice(totals.rental, locale)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("summary.depositSubtotal")}
              </span>
              <span className="tabular-nums">
                {formatPrice(totals.deposit, locale)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold text-sage">
              <span>{t("summary.grandTotal")}</span>
              <span className="tabular-nums">
                {formatPrice(totals.grand, locale)}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || items.length === 0}
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
          <p className="text-xs text-muted-foreground">{t("submitHint")}</p>
        </aside>
      </form>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function Field({ id, label, hint, required, error, children }: FieldProps) {
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

function PickupAddress({
  label,
  address,
  fallback,
}: {
  label: string;
  address: string;
  fallback: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-border bg-muted/30 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{address || fallback}</p>
    </div>
  );
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    return body?.error?.message ?? fallback;
  } catch {
    return fallback;
  }
}
