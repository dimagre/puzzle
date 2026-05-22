import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z.string().min(1, "orderId is required"),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const paymentStatusQuerySchema = z.object({
  orderId: z.string().min(1, "orderId is required"),
});

export type PaymentStatusQuery = z.infer<typeof paymentStatusQuerySchema>;

export const monoWebhookBodySchema = z.object({
  invoiceId: z.string().min(1),
  status: z.string().min(1),
  reference: z.string().optional(),
});

export type MonoWebhookBody = z.infer<typeof monoWebhookBodySchema>;
