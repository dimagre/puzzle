export type ApiPuzzleCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
export type ApiPuzzleType = "CLASSIC" | "THREE_D" | "FLOOR" | "EDUCATIONAL";

export interface ApiPuzzle {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  pieces: number;
  condition: ApiPuzzleCondition;
  type: ApiPuzzleType;
  pricePerDay: number;
  depositAmount: number;
  isAvailable: boolean;
  rentalCount: number;
  category: { id: string; name: string; nameEn: string; slug: string };
  images: { id: string; url: string; alt: string; altEn: string; order: number }[];
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PuzzlesApiResponse {
  puzzles: ApiPuzzle[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export type SortOption = "newest" | "popular" | "price_asc" | "price_desc";

export type PieceCountRange = "100-500" | "500-1000" | "1000-2000" | "2000+";

export function pieceRangeToApiParam(range: PieceCountRange): string {
  switch (range) {
    case "100-500": return "100-500";
    case "500-1000": return "500-1000";
    case "1000-2000": return "1000-2000";
    case "2000+": return "2000-100000";
  }
}
