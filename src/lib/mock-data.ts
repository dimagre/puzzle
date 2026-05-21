export type PuzzleCondition = "new" | "excellent" | "good" | "fair";
export type PuzzleCategory = "nature" | "cities" | "art" | "animals" | "fantasy" | "abstract";
export type PuzzleType = "standard" | "panoramic" | "round" | "3d";

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
    category: "nature",
    type: "standard",
    pricePerDay: 45,
    imageUrl: "/placeholder-puzzle.jpg",
  },
  {
    id: "2",
    title: "Старе місто Львів",
    titleEn: "Old Town Lviv",
    pieces: 500,
    condition: "good",
    category: "cities",
    type: "standard",
    pricePerDay: 30,
    imageUrl: "/placeholder-puzzle.jpg",
  },
  {
    id: "3",
    title: "Соняшникове поле",
    titleEn: "Sunflower Field",
    pieces: 2000,
    condition: "new",
    category: "nature",
    type: "panoramic",
    pricePerDay: 60,
    imageUrl: "/placeholder-puzzle.jpg",
  },
  {
    id: "4",
    title: "Зачарований ліс",
    titleEn: "Enchanted Forest",
    pieces: 1500,
    condition: "excellent",
    category: "fantasy",
    type: "standard",
    pricePerDay: 50,
    imageUrl: "/placeholder-puzzle.jpg",
  },
  {
    id: "5",
    title: "Київська панорама",
    titleEn: "Kyiv Panorama",
    pieces: 3000,
    condition: "good",
    category: "cities",
    type: "panoramic",
    pricePerDay: 75,
    imageUrl: "/placeholder-puzzle.jpg",
  },
  {
    id: "6",
    title: "Лисиця у снігу",
    titleEn: "Fox in the Snow",
    pieces: 500,
    condition: "fair",
    category: "animals",
    type: "standard",
    pricePerDay: 20,
    imageUrl: "/placeholder-puzzle.jpg",
  },
  {
    id: "7",
    title: "Абстрактний вихор",
    titleEn: "Abstract Vortex",
    pieces: 1000,
    condition: "new",
    category: "abstract",
    type: "round",
    pricePerDay: 55,
    imageUrl: "/placeholder-puzzle.jpg",
  },
  {
    id: "8",
    title: "Ван Гог: Зоряна ніч",
    titleEn: "Van Gogh: Starry Night",
    pieces: 2000,
    condition: "excellent",
    category: "art",
    type: "standard",
    pricePerDay: 65,
    imageUrl: "/placeholder-puzzle.jpg",
  },
];
