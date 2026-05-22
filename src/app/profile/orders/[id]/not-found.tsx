import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function OrderNotFound() {
  const t = await getTranslations("profile.orderDetail");
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
        {t("notFoundTitle")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("notFoundDescription")}
      </p>
      <Link
        href="/profile#orders"
        className="mt-6 inline-flex text-sm font-medium text-sage hover:underline"
      >
        {t("back")}
      </Link>
    </div>
  );
}
