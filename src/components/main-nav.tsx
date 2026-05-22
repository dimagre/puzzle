"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

export function MainNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex items-center gap-6">
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`text-sm font-medium transition-colors hover:text-sage ${
              isActive
                ? "text-sage underline underline-offset-8 decoration-2"
                : "text-gray-700"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
