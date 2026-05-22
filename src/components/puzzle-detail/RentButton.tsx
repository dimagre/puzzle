"use client";

import { useTranslations } from "next-intl";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";

interface RentButtonProps {
  puzzle: Omit<CartItem, "rentalDays">;
  isAvailable?: boolean;
}

export function RentButton({ puzzle, isAvailable = true }: RentButtonProps) {
  const t = useTranslations("puzzleDetail");
  const tCart = useTranslations("cart");
  const { addItem, isInCart } = useCart();
  const { toast } = useToast();

  const inCart = isInCart(puzzle.puzzleId);

  function handleClick() {
    if (inCart || !isAvailable) return;
    addItem(puzzle);
    toast({
      title: tCart("addedToCart"),
      description: tCart("addedToCartDescription", { title: puzzle.title }),
    });
  }

  return (
    <Button
      size="lg"
      onClick={handleClick}
      disabled={inCart || !isAvailable}
      className={
        inCart
          ? "w-full bg-gray-200 text-gray-500 cursor-default sm:w-auto"
          : "w-full bg-terracotta text-white hover:bg-terracotta/90 sm:w-auto"
      }
      aria-label={inCart ? t("alreadyInCart") : t("rent")}
    >
      {inCart ? (
        <>
          <Check className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("alreadyInCart")}
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("rent")}
        </>
      )}
    </Button>
  );
}
