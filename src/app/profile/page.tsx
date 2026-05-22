import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileInfoForm } from "@/components/profile/ProfileInfoForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { OrderList } from "@/components/profile/OrderList";
import { Toaster } from "@/components/ui/toaster";
import { serializeOrderSummary, serializeProfile } from "@/lib/api/profile-serialize";

export const dynamic = "force-dynamic";

const ORDERS_PREVIEW_LIMIT = 10;

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const t = await getTranslations("profile");
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "uk";

  const [user, orders] = await prisma.$transaction([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        deliveryRegion: true,
        deliveryCity: true,
        deliveryNovaPoshtaWarehouse: true,
      },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: ORDERS_PREVIEW_LIMIT,
      include: { items: { select: { id: true } } },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  const profile = serializeProfile(user);
  const orderSummaries = orders.map(serializeOrderSummary);

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </header>

        <div className="space-y-8">
          <section
            id="info"
            className="rounded-lg border border-border bg-white p-5 sm:p-6"
            aria-labelledby="info-heading"
          >
            <h2
              id="info-heading"
              className="mb-1 text-lg font-semibold text-foreground"
            >
              {t("info.heading")}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("info.description")}
            </p>
            <ProfileInfoForm profile={profile} />
          </section>

          <section
            id="password"
            className="rounded-lg border border-border bg-white p-5 sm:p-6"
            aria-labelledby="password-heading"
          >
            <h2
              id="password-heading"
              className="mb-1 text-lg font-semibold text-foreground"
            >
              {t("password.heading")}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("password.description")}
            </p>
            <ChangePasswordForm />
          </section>

          <section
            id="orders"
            aria-labelledby="orders-heading"
            className="space-y-4"
          >
            <div>
              <h2
                id="orders-heading"
                className="text-lg font-semibold text-foreground"
              >
                {t("orders.heading")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("orders.description")}
              </p>
            </div>
            <OrderList orders={orderSummaries} locale={locale} />
          </section>
        </div>
      </div>
      <Toaster />
    </>
  );
}
