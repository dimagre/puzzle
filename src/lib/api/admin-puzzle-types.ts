export interface AdminPuzzleRow {
  id: string;
  title: string;
  titleEn: string;
  pieceCount: number;
  rentalPricePerDay: number;
  isAvailable: boolean;
  isVisible: boolean;
  category: { id: string; name: string; nameEn: string; slug: string };
  thumbnailUrl: string | null;
  createdAt: string;
}

export interface AdminPuzzleDetail {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  pieceCount: number;
  condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
  type: "CLASSIC" | "THREE_D" | "FLOOR" | "EDUCATIONAL";
  rentalPricePerDay: number;
  depositAmount: number;
  isAvailable: boolean;
  isVisible: boolean;
  categoryId: string;
  images: { id: string; url: string; alt: string; altEn: string; order: number }[];
}

export interface AdminCategoryOption {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
}
