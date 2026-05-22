"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/context/CartContext";

export function CartIcon() {
  const t = useTranslations("nav");
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={t("cart")}
      className="relative flex items-center gap-1 text-sage hover:text-sage/80 transition-colors"
    >
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-xs font-bold text-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
