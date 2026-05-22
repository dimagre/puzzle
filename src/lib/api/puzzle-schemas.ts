import { z } from "zod";

const decimalString = z
  .union([z.number(), z.string()])
  .transform((v, ctx) => {
    const str = typeof v === "number" ? v.toString() : v.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(str)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Must be a non-negative decimal with up to 2 fractional digits",
      });
      return z.NEVER;
    }
    const num = Number(str);
    if (num < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must be >= 0" });
      return z.NEVER;
    }
    return str;
  });

const conditionEnum = z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"]);
const typeEnum = z.enum(["CLASSIC", "THREE_D", "FLOOR", "EDUCATIONAL"]);

const imageInput = z.object({
  url: z.string().url().max(2048),
  alt: z.string().min(1).max(500),
  altEn: z.string().min(1).max(500),
  order: z.number().int().min(0).optional(),
});

export const createPuzzleSchema = z.object({
  title: z.string().min(1).max(200),
  titleEn: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  descriptionEn: z.string().min(1).max(5000),
  pieceCount: z.number().int().positive().max(100_000),
  condition: conditionEnum,
  type: typeEnum,
  rentalPricePerDay: decimalString,
  depositAmount: decimalString,
  categoryId: z.string().min(1),
  isAvailable: z.boolean().optional(),
  images: z.array(imageInput).min(1).max(20),
});

export type CreatePuzzleInput = z.infer<typeof createPuzzleSchema>;

export const updatePuzzleSchema = createPuzzleSchema
  .partial()
  .extend({
    images: z.array(imageInput).min(1).max(20).optional(),
  });

export type UpdatePuzzleInput = z.infer<typeof updatePuzzleSchema>;

const sortValues = ["price_asc", "price_desc", "newest", "popular"] as const;

export const listPuzzlesQuerySchema = z.object({
  category: z.string().min(1).optional(),
  pieces: z
    .string()
    .regex(/^\d+-\d+$/, "Expected format: <min>-<max>")
    .optional(),
  available: z
    .enum(["true", "false"])
    .optional(),
  search: z.string().min(1).max(200).optional(),
  sort: z.enum(sortValues).optional(),
  page: z.coerce.number().int().positive().max(10_000).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type ListPuzzlesQuery = z.infer<typeof listPuzzlesQuerySchema>;
