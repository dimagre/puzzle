"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface RentButtonProps {
  isAvailable: boolean;
}

export function RentButton({ isAvailable }: RentButtonProps) {
  const t = useTranslations("puzzleDetail");
  const { toast } = useToast();

  function handleRent() {
    toast({ description: t("comingSoon") });
  }

  return (
    <>
      <Button
        size="lg"
        className="w-full bg-terracotta text-white hover:bg-terracotta/90 sm:w-auto"
        disabled={!isAvailable}
        onClick={handleRent}
        aria-label={t("rent")}
      >
        {t("rent")}
      </Button>
      <Toaster />
    </>
  );
}
