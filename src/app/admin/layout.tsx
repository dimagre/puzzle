import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Package, Puzzle as PuzzleIcon } from "lucide-react";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Toaster } from "@/components/ui/toaster";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const t = await getTranslations("admin");

  const navItems = [
    { href: "/admin/puzzles", label: t("nav.puzzles"), icon: PuzzleIcon },
    { href: "/admin/orders", label: t("nav.orders"), icon: Package },
  ];

  return (
    <>
      <div className="flex min-h-[calc(100vh-8rem)]">
        <AdminSidebar items={navItems} heading={t("nav.heading")} />
        <div className="min-w-0 flex-1 bg-cream">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
