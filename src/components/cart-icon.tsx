"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function CartIcon() {
  const { itemCount } = useCart();
  const t = useTranslations("nav");

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
      aria-label={t("cart")}
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      {itemCount > 0 && (
        <Badge
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta p-0 text-[10px] text-white"
          aria-label={`${itemCount}`}
        >
          {itemCount}
        </Badge>
      )}
    </Link>
  );
}
