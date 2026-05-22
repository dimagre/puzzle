import type { Order, OrderItem, Puzzle, PuzzleImage, User } from "@prisma/client";

export type ProfileDto = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  deliveryRegion: string | null;
  deliveryCity: string | null;
  deliveryNovaPoshtaWarehouse: string | null;
};

export function serializeProfile(
  user: Pick<
    User,
    | "id"
    | "email"
    | "name"
    | "phone"
    | "deliveryRegion"
    | "deliveryCity"
    | "deliveryNovaPoshtaWarehouse"
  >,
): ProfileDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? null,
    deliveryRegion: user.deliveryRegion ?? null,
    deliveryCity: user.deliveryCity ?? null,
    deliveryNovaPoshtaWarehouse: user.deliveryNovaPoshtaWarehouse ?? null,
  };
}

export type OrderSummaryDto = {
  id: string;
  status: Order["status"];
  deliveryMethod: Order["deliveryMethod"];
  totalAmount: number;
  depositAmount: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export function serializeOrderSummary(
  order: Order & { items: { id: string }[] },
): OrderSummaryDto {
  return {
    id: order.id,
    status: order.status,
    deliveryMethod: order.deliveryMethod,
    totalAmount: Number(order.totalAmount),
    depositAmount: Number(order.depositAmount),
    itemCount: order.items.length,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export type OrderItemDto = {
  id: string;
  rentalDays: number;
  pricePerDay: number;
  depositAmount: number;
  puzzle: {
    id: string;
    title: string;
    titleEn: string;
    imageUrl: string | null;
  };
};

export type OrderDetailDto = {
  id: string;
  status: Order["status"];
  deliveryMethod: Order["deliveryMethod"];
  trackingNumber: string | null;
  totalAmount: number;
  depositAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
};

type OrderWithItems = Order & {
  items: (OrderItem & {
    puzzle: Puzzle & { images: PuzzleImage[] };
  })[];
};

export function serializeOrderDetail(order: OrderWithItems): OrderDetailDto {
  return {
    id: order.id,
    status: order.status,
    deliveryMethod: order.deliveryMethod,
    trackingNumber: order.trackingNumber ?? null,
    totalAmount: Number(order.totalAmount),
    depositAmount: Number(order.depositAmount),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => {
      const sortedImages = [...item.puzzle.images].sort(
        (a, b) => a.order - b.order,
      );
      return {
        id: item.id,
        rentalDays: item.rentalDays,
        pricePerDay: Number(item.pricePerDay),
        depositAmount: Number(item.depositAmount),
        puzzle: {
          id: item.puzzle.id,
          title: item.puzzle.title,
          titleEn: item.puzzle.titleEn,
          imageUrl: sortedImages[0]?.url ?? null,
        },
      };
    }),
  };
}
