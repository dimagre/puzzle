"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/context/CartContext";

const RENTAL_DAY_OPTIONS = [3, 7, 14, 21, 30] as const;

export default function CartPage() {
  const t = useTranslations("cart");
  const { items, removeItem, updateRentalDays } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold text-sage">{t("empty")}</h1>
          <p className="text-gray-600">{t("emptyDescription")}</p>
          <Link
            href="/catalog"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t("browseCatalog")}
          </Link>
        </div>
      </div>
    );
  }

  const rentalSubtotal = items.reduce(
    (sum, item) => sum + item.rentalPricePerDay * item.rentalDays,
    0
  );
  const depositSubtotal = items.reduce((sum, item) => sum + item.depositAmount, 0);
  const grandTotal = rentalSubtotal + depositSubtotal;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-sage">{t("title")}</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const subtotal = item.rentalPricePerDay * item.rentalDays;
            return (
              <div
                key={item.puzzleId}
                className="flex gap-4 rounded-lg border bg-white p-4 shadow-sm"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.pieceCount} {t("pieces")}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.puzzleId)}
                      aria-label={t("remove")}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{t("rentalDays")}:</span>
                      <Select
                        value={String(item.rentalDays)}
                        onValueChange={(val) => updateRentalDays(item.puzzleId, Number(val))}
                      >
                        <SelectTrigger className="w-24" aria-label={t("rentalDays")}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RENTAL_DAY_OPTIONS.map((d) => (
                            <SelectItem key={d} value={String(d)}>
                              {d} {t("days")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="ml-auto text-right">
                      <p className="text-sm text-muted-foreground">
                        {item.rentalPricePerDay} грн{t("perDay")}
                      </p>
                      <p className="font-semibold text-sage">{subtotal} грн</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {t("deposit")}: {item.depositAmount} грн
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm h-fit space-y-3">
          <h2 className="text-lg font-semibold">{t("grandTotal")}</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("rentalSubtotal")}</span>
            <span>{rentalSubtotal} грн</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("depositSubtotal")}</span>
            <span>{depositSubtotal} грн</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-sage">
            <span>{t("grandTotal")}</span>
            <span>{grandTotal} грн</span>
          </div>
          <Link
            href="/checkout"
            className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t("proceedToCheckout")}
          </Link>
        </div>
      </div>
    </div>
  );
}
