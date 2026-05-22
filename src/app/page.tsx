import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Search, Package, Smile, Leaf, Wallet, LayoutGrid } from "lucide-react";

export default async function HomePage() {
  const t = await getTranslations("homepage");

  return (
    <>
      {/* Hero */}
      <section className="bg-cream px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold leading-tight text-sage sm:text-5xl lg:text-6xl">
            {t("hero.heading")}
          </h1>
          <p className="mt-6 text-lg text-gray-600 sm:text-xl">
            {t("hero.subheading")}
          </p>
          <div className="mt-10">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-md bg-sage px-8 py-3 text-base font-medium text-white transition-colors hover:bg-sage/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
              aria-label={t("hero.cta")}
            >
              {t("hero.cta")}
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            {t("howItWorks.title")}
          </h2>
          <ol className="grid gap-8 sm:grid-cols-3">
            <HowItWorksStep
              number={1}
              icon={<Search className="h-8 w-8 text-sage" aria-hidden="true" />}
              title={t("howItWorks.step1.title")}
              description={t("howItWorks.step1.description")}
            />
            <HowItWorksStep
              number={2}
              icon={<Package className="h-8 w-8 text-sage" aria-hidden="true" />}
              title={t("howItWorks.step2.title")}
              description={t("howItWorks.step2.description")}
            />
            <HowItWorksStep
              number={3}
              icon={<Smile className="h-8 w-8 text-sage" aria-hidden="true" />}
              title={t("howItWorks.step3.title")}
              description={t("howItWorks.step3.description")}
            />
          </ol>
        </div>
      </section>

      {/* Value propositions */}
      <section className="bg-cream px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            {t("values.title")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <ValueCard
              icon={<Leaf className="h-8 w-8 text-terracotta" aria-hidden="true" />}
              title={t("values.eco.title")}
              description={t("values.eco.description")}
            />
            <ValueCard
              icon={<Wallet className="h-8 w-8 text-terracotta" aria-hidden="true" />}
              title={t("values.affordable.title")}
              description={t("values.affordable.description")}
            />
            <ValueCard
              icon={<LayoutGrid className="h-8 w-8 text-terracotta" aria-hidden="true" />}
              title={t("values.variety.title")}
              description={t("values.variety.description")}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-sage px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {t("finalCta.heading")}
          </h2>
          <p className="mt-4 text-lg text-white/80">
            {t("finalCta.subheading")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-md bg-white px-8 py-3 text-base font-medium text-sage transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-sage"
              aria-label={t("finalCta.catalogCta")}
            >
              {t("finalCta.catalogCta")}
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md border border-white px-8 py-3 text-base font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-sage"
              aria-label={t("finalCta.loginCta")}
            >
              {t("finalCta.loginCta")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

interface HowItWorksStepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function HowItWorksStep({ number, icon, title, description }: HowItWorksStepProps) {
  return (
    <li className="flex flex-col items-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream">
        {icon}
      </div>
      <span className="mb-1 text-sm font-semibold uppercase tracking-wide text-terracotta">
        {number}
      </span>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </li>
  );
}

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ValueCard({ icon, title, description }: ValueCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
