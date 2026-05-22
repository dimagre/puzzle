import type {
  Order,
  OrderItem,
  Payment,
  Puzzle,
  User,
} from "@prisma/client";
import type {
  AdminOrderDeliveryAddress,
  AdminOrderDetail,
  AdminOrderRow,
} from "@/lib/api/admin-orders-types";

type OrderWithCount = Order & {
  user: Pick<User, "id" | "name" | "email">;
  _count: { items: number };
};

export function serializeAdminOrderRow(order: OrderWithCount): AdminOrderRow {
  return {
    id: order.id,
    status: order.status,
    deliveryMethod: order.deliveryMethod,
    totalAmount: Number(order.totalAmount),
    depositAmount: Number(order.depositAmount),
    itemCount: order._count.items,
    customer: {
      id: order.user.id,
      name: order.user.name,
      email: order.user.email,
    },
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

type OrderWithFullRelations = Order & {
  user: Pick<
    User,
    | "id"
    | "name"
    | "email"
    | "phone"
    | "deliveryRegion"
    | "deliveryCity"
    | "deliveryNovaPoshtaWarehouse"
  >;
  items: (OrderItem & {
    puzzle: Pick<Puzzle, "id" | "title" | "titleEn">;
  })[];
  payments: Payment[];
};

interface ParsedDelivery {
  contactName: string | null;
  contactPhone: string | null;
  address: string | null;
}

function parseDeliveryFromAdminNotes(
  notes: string | null,
): ParsedDelivery & { rawNotes: string | null; remainingNotes: string | null } {
  if (!notes) {
    return {
      contactName: null,
      contactPhone: null,
      address: null,
      rawNotes: null,
      remainingNotes: null,
    };
  }
  try {
    const parsed = JSON.parse(notes) as unknown;
    if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, unknown>;
      const isString = (v: unknown): v is string =>
        typeof v === "string" && v.length > 0;
      const remainingNotes = isString(obj.notes) ? obj.notes : null;
      return {
        contactName: isString(obj.contactName) ? obj.contactName : null,
        contactPhone: isString(obj.contactPhone) ? obj.contactPhone : null,
        address: isString(obj.address) ? obj.address : null,
        rawNotes: notes,
        remainingNotes,
      };
    }
  } catch {
    // Not JSON — treat the whole field as plain admin notes for backward compat.
  }
  return {
    contactName: null,
    contactPhone: null,
    address: null,
    rawNotes: notes,
    remainingNotes: notes,
  };
}

export function serializeAdminOrderDetail(
  order: OrderWithFullRelations,
): AdminOrderDetail {
  const delivery = parseDeliveryFromAdminNotes(order.adminNotes);
  const deliveryAddress: AdminOrderDeliveryAddress = {
    contactName: delivery.contactName,
    contactPhone: delivery.contactPhone,
    address: delivery.address,
    rawNotes: delivery.rawNotes,
  };

  return {
    id: order.id,
    status: order.status,
    deliveryMethod: order.deliveryMethod,
    trackingNumber: order.trackingNumber ?? null,
    adminNotes: delivery.remainingNotes,
    totalAmount: Number(order.totalAmount),
    depositAmount: Number(order.depositAmount),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    customer: {
      id: order.user.id,
      name: order.user.name,
      email: order.user.email,
      phone: order.user.phone ?? null,
      deliveryRegion: order.user.deliveryRegion ?? null,
      deliveryCity: order.user.deliveryCity ?? null,
      deliveryNovaPoshtaWarehouse: order.user.deliveryNovaPoshtaWarehouse ?? null,
    },
    delivery: deliveryAddress,
    items: order.items.map((item) => ({
      id: item.id,
      rentalDays: item.rentalDays,
      pricePerDay: Number(item.pricePerDay),
      depositAmount: Number(item.depositAmount),
      puzzle: {
        id: item.puzzle.id,
        title: item.puzzle.title,
        titleEn: item.puzzle.titleEn,
      },
    })),
    payments: order.payments.map((payment) => ({
      id: payment.id,
      type: payment.type,
      status: payment.status,
      amount: Number(payment.amount),
      monoInvoiceId: payment.monoInvoiceId,
      monoPaymentRef: payment.monoPaymentRef ?? null,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    })),
  };
}

interface MergeNotesInput {
  rawNotes: string | null;
  newNotesField: string | null;
}

export function mergeAdminNotes({
  rawNotes,
  newNotesField,
}: MergeNotesInput): string | null {
  if (!rawNotes) {
    if (newNotesField === null || newNotesField.length === 0) return null;
    return JSON.stringify({ notes: newNotesField });
  }
  try {
    const parsed = JSON.parse(rawNotes) as unknown;
    if (parsed && typeof parsed === "object") {
      const obj = { ...(parsed as Record<string, unknown>) };
      if (newNotesField === null || newNotesField.length === 0) {
        delete obj.notes;
      } else {
        obj.notes = newNotesField;
      }
      return JSON.stringify(obj);
    }
  } catch {
    // Plain-text legacy notes — replace entirely.
  }
  if (newNotesField === null || newNotesField.length === 0) return null;
  return newNotesField;
}
