export type PuzzleCondition = "new" | "excellent" | "good" | "fair";
export type PuzzleCategory = "landscape" | "animals" | "art" | "cities" | "fantasy" | "abstract";
export type PuzzleType = "standard" | "panoramic" | "shaped" | "3d";

export interface Puzzle {
  id: string;
  title: string;
  titleEn: string;
  pieces: number;
  condition: PuzzleCondition;
  category: PuzzleCategory;
  type: PuzzleType;
  pricePerDay: number;
  imageUrl: string;
}

export const MOCK_PUZZLES: Puzzle[] = [
  {
    id: "1",
    title: "Карпатські гори на світанку",
    titleEn: "Carpathian Mountains at Dawn",
    pieces: 1000,
    condition: "excellent",
    category: "landscape",
    type: "standard",
    pricePerDay: 45,
    imageUrl: "/placeholder-puzzle.jpg",
  },
  {
    id: "2",
    title: "Зоряна ніч — Ван Гог",
    titleEn: "Starry Night — Van Gogh",
    pieces: 2000,
    condition: "good",
    category: "art",
    type: "standard",
    pricePerDay: 60,
    imageUrl: "/placeholder-puzzle.jpg",
  },
  {
    id: "3",
    title: "Левеня у савані",
    titleEn: "Lion Cub in the Savanna",
    pieces: 500,
    condition: "new",
    category: "animals",
    type: "standard",
    pricePerDay: 35,
    imageUrl: "/placeholder-puzzle.jpg",
  },
  {
    id: "4",
    title: "Панорама Києва",
    titleEn: "Kyiv Panorama",
    pieces: 1500,
    condition: "excellent",
    category: "cities",
    type: "panoramic",
    pricePerDay: 55,
    imageUrl: "/placeholder-puzzle.jpg",
  },
  {
    id: "5",
    title: "Чарівний ліс",
    titleEn: "Enchanted Forest",
    pieces: 300,
    condition: "fair",
    category: "fantasy",
    type: "standard",
    pricePerDay: 25,
    imageUrl: "/placeholder-puzzle.jpg",
  },
  {
    id: "6",
    title: "Абстрактні кольори",
    titleEn: "Abstract Colors",
    pieces: 1000,
    condition: "good",
    category: "abstract",
    type: "shaped",
    pricePerDay: 40,
    imageUrl: "/placeholder-puzzle.jpg",
  },
  {
    id: "7",
    title: "Підводний світ",
    titleEn: "Underwater World",
    pieces: 500,
    condition: "excellent",
    category: "animals",
    type: "standard",
    pricePerDay: 38,
    imageUrl: "/placeholder-puzzle.jpg",
  },
  {
    id: "8",
    title: "Замок у горах",
    titleEn: "Castle in the Mountains",
    pieces: 2000,
    condition: "new",
    category: "landscape",
    type: "panoramic",
    pricePerDay: 70,
    imageUrl: "/placeholder-puzzle.jpg",
  },
];

export type PieceCountRange = "100-500" | "500-1000" | "1000-2000" | "2000+";

export function matchesPieceRange(pieces: number, range: PieceCountRange): boolean {
  switch (range) {
    case "100-500": return pieces >= 100 && pieces <= 500;
    case "500-1000": return pieces > 500 && pieces <= 1000;
    case "1000-2000": return pieces > 1000 && pieces <= 2000;
    case "2000+": return pieces > 2000;
  }
}
