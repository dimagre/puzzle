import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_VALUES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
] as const satisfies readonly OrderStatus[];

export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["RETURNED"],
  RETURNED: [],
  CANCELLED: [],
};

export function isValidStatusTransition(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  if (from === to) return true;
  return ALLOWED_ORDER_TRANSITIONS[from].includes(to);
}

export const ADMIN_ORDERS_PAGE_SIZE = 20;
const ADMIN_ORDERS_PAGE_SIZE_MAX = 100;

const isoDateString = z
  .string()
  .trim()
  .min(1)
  .refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Invalid date",
  });

export const listAdminOrdersQuerySchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES).optional(),
  customer: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  from: isoDateString.optional(),
  to: isoDateString.optional(),
  page: z.coerce.number().int().positive().max(10_000).optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(ADMIN_ORDERS_PAGE_SIZE_MAX)
    .optional(),
});

export type ListAdminOrdersQuery = z.infer<typeof listAdminOrdersQuerySchema>;

const trackingNumberSchema = z
  .string()
  .trim()
  .max(100, "Tracking number must be at most 100 characters");

const adminNotesSchema = z
  .string()
  .max(2000, "Admin notes must be at most 2000 characters");

export const updateAdminOrderSchema = z
  .object({
    status: z.enum(ORDER_STATUS_VALUES).optional(),
    trackingNumber: z
      .union([trackingNumberSchema, z.null()])
      .optional(),
    adminNotes: z.union([adminNotesSchema, z.null()]).optional(),
  })
  .refine(
    (data) =>
      data.status !== undefined ||
      data.trackingNumber !== undefined ||
      data.adminNotes !== undefined,
    { message: "At least one field is required" },
  );

export type UpdateAdminOrderInput = z.infer<typeof updateAdminOrderSchema>;
