import { useTranslations } from "next-intl";
import Image from "next/image";
import { RentButton } from "@/components/puzzle-detail/RentButton";

// Sample puzzle data — in production this would come from the DB via params
const SAMPLE_PUZZLE = {
  puzzleId: "puzzle-1",
  title: "Карпатський світанок",
  titleEn: "Carpathian Dawn",
  imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  pieceCount: 1000,
  rentalPricePerDay: 25,
  depositAmount: 200,
};

export default function PuzzleDetailPage() {
  const t = useTranslations("puzzle");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
          <Image
            src={SAMPLE_PUZZLE.imageUrl}
            alt={SAMPLE_PUZZLE.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-sage">{SAMPLE_PUZZLE.title}</h1>
          <p className="text-gray-500">{SAMPLE_PUZZLE.titleEn}</p>

          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-500">{t("pieces", { count: SAMPLE_PUZZLE.pieceCount })}</dt>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-gray-900">
                {t("pricePerDay", { price: SAMPLE_PUZZLE.rentalPricePerDay })}
              </dt>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500">
                {t("deposit", { amount: SAMPLE_PUZZLE.depositAmount })}
              </dt>
            </div>
          </dl>

          <div className="mt-4">
            <RentButton puzzle={SAMPLE_PUZZLE} />
          </div>
        </div>
      </div>
    </div>
  );
}
