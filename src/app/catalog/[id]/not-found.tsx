import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function PuzzleNotFound() {
  const t = await getTranslations("puzzleDetail");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
      <span className="text-6xl" aria-hidden="true">🧩</span>
      <h1 className="mt-6 text-2xl font-bold text-foreground">{t("notFound")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("notFoundDescription")}</p>
      <Link
        href="/catalog"
        className={cn(buttonVariants(), "mt-6 bg-sage text-white hover:bg-sage/90")}
      >
        {t("backToCatalog")}
      </Link>
    </div>
  );
}
