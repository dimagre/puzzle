import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function Header() {
  const t = await getTranslations();
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "uk";
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-sage">
            {t("common.title")}
          </Link>
          {isAdmin ? (
            <Link
              href="/admin/puzzles"
              className="text-sm font-medium text-sage hover:text-sage/80"
            >
              {t("nav.admin")}
            </Link>
          ) : null}
        </div>
        <LanguageSwitcher currentLocale={locale} />
      </div>
    </header>
  );
}
