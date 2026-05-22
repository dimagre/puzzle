import type { OrderStatus } from "@prisma/client";
import { sendEmail } from "./send";
import {
  NewOrderAdminEmail,
  newOrderAdminSubject,
} from "./templates/NewOrderAdmin";
import {
  OrderCancelledEmail,
  orderCancelledSubject,
} from "./templates/OrderCancelled";
import {
  OrderConfirmedEmail,
  orderConfirmedSubject,
} from "./templates/OrderConfirmed";
import {
  OrderDeliveredEmail,
  orderDeliveredSubject,
} from "./templates/OrderDelivered";
import {
  OrderShippedEmail,
  orderShippedSubject,
} from "./templates/OrderShipped";

interface OrderStatusChangeInput {
  orderId: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  trackingNumber: string | null;
}

export function notifyOrderStatusChange(input: OrderStatusChangeInput): void {
  switch (input.status) {
    case "CONFIRMED":
      void sendEmail({
        to: input.customerEmail,
        subject: orderConfirmedSubject(input.orderId),
        react: OrderConfirmedEmail({
          orderId: input.orderId,
          customerName: input.customerName,
        }),
      });
      return;
    case "SHIPPED":
      if (!input.trackingNumber) {
        console.warn(
          `[email] Skipping SHIPPED email for order ${input.orderId} — missing trackingNumber`,
        );
        return;
      }
      void sendEmail({
        to: input.customerEmail,
        subject: orderShippedSubject(input.orderId),
        react: OrderShippedEmail({
          orderId: input.orderId,
          customerName: input.customerName,
          trackingNumber: input.trackingNumber,
        }),
      });
      return;
    case "DELIVERED":
      void sendEmail({
        to: input.customerEmail,
        subject: orderDeliveredSubject(input.orderId),
        react: OrderDeliveredEmail({
          orderId: input.orderId,
          customerName: input.customerName,
        }),
      });
      return;
    case "CANCELLED":
      void sendEmail({
        to: input.customerEmail,
        subject: orderCancelledSubject(input.orderId),
        react: OrderCancelledEmail({
          orderId: input.orderId,
          customerName: input.customerName,
        }),
      });
      return;
    default:
      return;
  }
}

interface NewOrderAdminInput {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  itemCount: number;
}

export function notifyAdminOfNewOrder(input: NewOrderAdminInput): void {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn(
      `[email] ADMIN_EMAIL is not set — skipping new-order notification for ${input.orderId}`,
    );
    return;
  }
  void sendEmail({
    to: adminEmail,
    subject: newOrderAdminSubject(input.orderId, input.customerName),
    react: NewOrderAdminEmail(input),
  });
}
