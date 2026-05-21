import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("common");

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-sage sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-gray-600">{t("subtitle")}</p>
      </div>
    </div>
  );
}
