import { cookies } from "next/headers";
import { CatalogClient } from "@/components/catalog/CatalogClient";

export default async function CatalogPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "uk";

  return <CatalogClient locale={locale} />;
}
