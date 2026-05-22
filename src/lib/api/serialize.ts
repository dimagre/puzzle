import type { Puzzle, PuzzleImage, Category } from "@prisma/client";

export type PuzzleWithRelations = Puzzle & {
  images: PuzzleImage[];
  category: Category;
};

type SerializedPuzzle = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  pieces: number;
  condition: Puzzle["condition"];
  type: Puzzle["type"];
  pricePerDay: number;
  depositAmount: number;
  isAvailable: boolean;
  rentalCount: number;
  category: { id: string; name: string; nameEn: string; slug: string };
  images: { id: string; url: string; alt: string; altEn: string; order: number }[];
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export function serializePuzzle(puzzle: PuzzleWithRelations): SerializedPuzzle {
  const sortedImages = [...puzzle.images].sort((a, b) => a.order - b.order);
  return {
    id: puzzle.id,
    title: puzzle.title,
    titleEn: puzzle.titleEn,
    description: puzzle.description,
    descriptionEn: puzzle.descriptionEn,
    pieces: puzzle.pieceCount,
    condition: puzzle.condition,
    type: puzzle.type,
    pricePerDay: Number(puzzle.rentalPricePerDay),
    depositAmount: Number(puzzle.depositAmount),
    isAvailable: puzzle.isAvailable,
    rentalCount: puzzle.rentalCount,
    category: {
      id: puzzle.category.id,
      name: puzzle.category.name,
      nameEn: puzzle.category.nameEn,
      slug: puzzle.category.slug,
    },
    images: sortedImages.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      altEn: img.altEn,
      order: img.order,
    })),
    imageUrl: sortedImages[0]?.url ?? null,
    createdAt: puzzle.createdAt.toISOString(),
    updatedAt: puzzle.updatedAt.toISOString(),
  };
}
