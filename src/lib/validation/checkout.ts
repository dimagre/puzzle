import { z } from "zod";
import { profilePhoneSchema } from "@/lib/validation/profile";

export const DELIVERY_METHODS = [
  "NOVA_POSHTA",
  "UKRPOSHTA",
  "SELF_PICKUP_WAREHOUSE",
  "SELF_PICKUP_SELLER",
] as const;

export type DeliveryMethodValue = (typeof DELIVERY_METHODS)[number];

const trimmedRequired = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

const trimmedOptional = (max: number, label: string) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (typeof v === "string" ? v.trim() : ""))
    .transform((v) => (v.length === 0 ? null : v))
    .refine((v) => v === null || v.length <= max, {
      message: `${label} must be at most ${max} characters`,
    });

export const RENTAL_DAYS_MIN = 1;
export const RENTAL_DAYS_MAX = 90;
export const ORDER_ITEMS_MIN = 1;
export const ORDER_ITEMS_MAX = 50;

const orderItemInput = z.object({
  puzzleId: z.string().min(1, "Puzzle is required"),
  rentalDays: z
    .number()
    .int()
    .min(RENTAL_DAYS_MIN, `Rental must be at least ${RENTAL_DAYS_MIN} day`)
    .max(RENTAL_DAYS_MAX, `Rental must be at most ${RENTAL_DAYS_MAX} days`),
});

const phoneRequired = profilePhoneSchema.refine((v) => v !== null, {
  message: "Phone is required",
});

const checkoutAddressFields = {
  deliveryMethod: z.enum(DELIVERY_METHODS),
  contactName: trimmedRequired(100, "Name"),
  contactPhone: phoneRequired,
  deliveryRegion: trimmedOptional(100, "Region"),
  deliveryCity: trimmedOptional(100, "City"),
  deliveryWarehouse: trimmedOptional(200, "Warehouse"),
  deliveryStreet: trimmedOptional(200, "Street"),
  deliveryPostalCode: trimmedOptional(20, "Postal code"),
};

function applyAddressRules(
  data: {
    deliveryMethod: DeliveryMethodValue;
    deliveryRegion: string | null;
    deliveryCity: string | null;
    deliveryWarehouse: string | null;
    deliveryStreet: string | null;
    deliveryPostalCode: string | null;
  },
  ctx: z.RefinementCtx,
) {
  if (data.deliveryMethod === "NOVA_POSHTA") {
    if (!data.deliveryRegion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryRegion"],
        message: "Region is required",
      });
    }
    if (!data.deliveryCity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryCity"],
        message: "City is required",
      });
    }
    if (!data.deliveryWarehouse) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryWarehouse"],
        message: "Warehouse is required",
      });
    }
  } else if (data.deliveryMethod === "UKRPOSHTA") {
    if (!data.deliveryRegion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryRegion"],
        message: "Region is required",
      });
    }
    if (!data.deliveryCity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryCity"],
        message: "City is required",
      });
    }
    if (!data.deliveryStreet) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryStreet"],
        message: "Street is required",
      });
    }
    if (!data.deliveryPostalCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryPostalCode"],
        message: "Postal code is required",
      });
    }
  }
}

export const checkoutFormSchema = z
  .object(checkoutAddressFields)
  .superRefine(applyAddressRules);

export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;

export const createOrderSchema = z
  .object({
    ...checkoutAddressFields,
    items: z
      .array(orderItemInput)
      .min(ORDER_ITEMS_MIN, "Cart cannot be empty")
      .max(ORDER_ITEMS_MAX, `At most ${ORDER_ITEMS_MAX} items per order`),
  })
  .superRefine(applyAddressRules);

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

