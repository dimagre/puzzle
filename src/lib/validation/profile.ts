import { z } from "zod";
import { passwordSchema } from "@/lib/validation/auth";

// Ukrainian mobile: optional +380 / 380 / 0 prefix, then 9 digits.
// Examples accepted: +380501234567, 380501234567, 0501234567.
const ukrainianPhoneRegex = /^(?:\+?380|0)\d{9}$/;

const optionalTrimmedString = (max: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (typeof v === "string" ? v.trim() : ""))
    .transform((v) => (v.length === 0 ? null : v))
    .refine((v) => v === null || v.length <= max, {
      message: `Must be at most ${max} characters`,
    });

export const profilePhoneSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => (typeof v === "string" ? v.replace(/[\s-]/g, "") : ""))
  .transform((v) => (v.length === 0 ? null : v))
  .refine((v) => v === null || ukrainianPhoneRegex.test(v), {
    message: "Invalid Ukrainian phone number",
  });

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  phone: profilePhoneSchema,
  deliveryRegion: optionalTrimmedString(100),
  deliveryCity: optionalTrimmedString(100),
  deliveryNovaPoshtaWarehouse: optionalTrimmedString(200),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

const PAGE_SIZE_DEFAULT = 10;
const PAGE_SIZE_MAX = 50;

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(10_000).optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGE_SIZE_MAX)
    .optional(),
});

export const ORDERS_PAGE_SIZE_DEFAULT = PAGE_SIZE_DEFAULT;
export const ORDERS_PAGE_SIZE_MAX = PAGE_SIZE_MAX;
