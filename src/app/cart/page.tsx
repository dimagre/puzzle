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
import { useCart } from "@/context/cart-context";

const RENTAL_DAY_OPTIONS = [3, 7, 14, 21, 30] as const;

export default function CartPage() {
  const t = useTranslations("cart");
  const { items, removeItem, updateRentalDays } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-sage">{t("title")}</h1>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-cream py-20 text-center">
          <p className="mb-2 text-xl font-semibold text-gray-700">{t("empty")}</p>
          <p className="mb-6 text-gray-500">{t("emptyDescription")}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-sage">{t("title")}</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Item list */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const subtotal = item.rentalPricePerDay * item.rentalDays;
            return (
              <div
                key={item.puzzleId}
                className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                {/* Thumbnail */}
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">
                        {t("pieces", { count: item.pieceCount })}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.puzzleId)}
                      className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      aria-label={t("remove")}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Rental days selector */}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`days-${item.puzzleId}`}
                        className="text-sm text-gray-600"
                      >
                        {t("rentalDays")}:
                      </label>
                      <Select
                        value={String(item.rentalDays)}
                        onValueChange={(val) =>
                          updateRentalDays(item.puzzleId, Number(val))
                        }
                      >
                        <SelectTrigger
                          id={`days-${item.puzzleId}`}
                          className="w-24"
                          aria-label={t("rentalDays")}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RENTAL_DAY_OPTIONS.map((d) => (
                            <SelectItem key={d} value={String(d)}>
                              {t("days", { count: d })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Per-item subtotal */}
                    <p className="ml-auto text-sm font-medium text-gray-900">
                      {subtotal} ₴
                      <span className="ml-1 text-xs text-gray-400">
                        ({item.rentalPricePerDay} ₴{t("perDay")})
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {t("grandTotal")}
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">{t("rentalSubtotal")}</dt>
              <dd className="font-medium">{rentalSubtotal} ₴</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">{t("depositSubtotal")}</dt>
              <dd className="font-medium">{depositSubtotal} ₴</dd>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold">
              <dt>{t("grandTotal")}</dt>
              <dd className="text-sage">{grandTotal} ₴</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
