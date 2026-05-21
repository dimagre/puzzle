import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function Header() {
  const t = await getTranslations("common");
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "uk";

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-sage">{t("title")}</span>
        </div>
        <LanguageSwitcher currentLocale={locale} />
      </div>
    </header>
  );
}
