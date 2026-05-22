import { z } from "zod";

export const PUZZLE_CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR"] as const;
export const PUZZLE_TYPES = [
  "CLASSIC",
  "THREE_D",
  "FLOOR",
  "EDUCATIONAL",
] as const;

const decimalString = z
  .string()
  .trim()
  .min(1, "required")
  .regex(
    /^\d+(\.\d{1,2})?$/,
    "Must be a non-negative decimal with up to 2 fractional digits",
  );

export const puzzleFormImageSchema = z.object({
  url: z.string().url("Must be a valid URL").max(2048),
  alt: z.string().min(1, "required").max(500),
  altEn: z.string().min(1, "required").max(500),
});

export const puzzleFormSchema = z.object({
  title: z.string().trim().min(1, "required").max(200),
  titleEn: z.string().trim().min(1, "required").max(200),
  description: z.string().trim().min(1, "required").max(5000),
  descriptionEn: z.string().trim().min(1, "required").max(5000),
  pieceCount: z.number().int().positive().max(100_000),
  condition: z.enum(PUZZLE_CONDITIONS),
  type: z.enum(PUZZLE_TYPES),
  rentalPricePerDay: decimalString,
  depositAmount: decimalString,
  isAvailable: z.boolean(),
  categoryId: z.string().min(1, "required"),
  images: z.array(puzzleFormImageSchema).min(1, "At least one image required").max(20),
});

export type PuzzleFormValues = z.infer<typeof puzzleFormSchema>;
export type PuzzleFormImage = z.infer<typeof puzzleFormImageSchema>;
