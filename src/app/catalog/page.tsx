import { Suspense } from "react";
import { cookies } from "next/headers";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { PuzzleCardSkeleton } from "@/components/catalog/PuzzleCardSkeleton";

function CatalogLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="h-9 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-5 w-80 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </aside>
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PuzzleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function CatalogPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "uk";

  return (
    <Suspense fallback={<CatalogLoadingSkeleton />}>
      <CatalogClient locale={locale} />
    </Suspense>
  );
}
