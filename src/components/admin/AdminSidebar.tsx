"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Puzzle as PuzzleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof PuzzleIcon;
}

interface AdminSidebarProps {
  items: NavItem[];
  heading: string;
}

export function AdminSidebar({ items, heading }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-white md:block">
      <div className="sticky top-0 px-4 py-6">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {heading}
        </p>
        <nav>
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sage/10 text-sage"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
