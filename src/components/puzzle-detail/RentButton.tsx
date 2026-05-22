"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/context/CartContext";

interface RentButtonProps {
  isAvailable: boolean;
  puzzle?: Omit<CartItem, "rentalDays">;
}

export function RentButton({ isAvailable, puzzle }: RentButtonProps) {
  const t = useTranslations("puzzleDetail");
  const tCart = useTranslations("cart");
  const { toast } = useToast();
  const { addItem, isInCart } = useCart();
  const inCart = puzzle ? isInCart(puzzle.puzzleId) : false;

  function handleRent() {
    if (puzzle && !inCart) {
      addItem(puzzle);
      toast({
        title: tCart("addedToCart"),
        description: tCart("addedToCartDescription", { title: puzzle.title }),
      });
    }
  }

  return (
    <Button
      size="lg"
      className={
        inCart
          ? "w-full sm:w-auto"
          : "w-full bg-terracotta text-white hover:bg-terracotta/90 sm:w-auto"
      }
      disabled={!isAvailable || inCart}
      onClick={handleRent}
      aria-label={inCart ? tCart("alreadyInCart") : t("rent")}
    >
      {inCart ? tCart("alreadyInCart") : t("rent")}
    </Button>
  );
}
