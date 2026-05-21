"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

const locales = [
  { code: "uk", label: "UA" },
  { code: "en", label: "EN" },
] as const;

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale(locale: string) {
    document.cookie = `locale=${locale};path=/;max-age=31536000`;
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex gap-1">
      {locales.map((loc) => (
        <button
          key={loc.code}
          onClick={() => switchLocale(loc.code)}
          disabled={isPending}
          className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
            currentLocale === loc.code
              ? "bg-sage text-white"
              : "text-sage hover:bg-sage/10"
          }`}
        >
          {loc.label}
        </button>
      ))}
    </div>
  );
}
