import type {
  DeliveryMethod,
  OrderStatus,
  PaymentStatus,
  PaymentType,
} from "@prisma/client";

export interface AdminOrderRow {
  id: string;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  totalAmount: number;
  depositAmount: number;
  itemCount: number;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderItem {
  id: string;
  rentalDays: number;
  pricePerDay: number;
  depositAmount: number;
  puzzle: {
    id: string;
    title: string;
    titleEn: string;
  };
}

export interface AdminOrderPayment {
  id: string;
  type: PaymentType;
  status: PaymentStatus;
  amount: number;
  monoInvoiceId: string;
  monoPaymentRef: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderDeliveryAddress {
  contactName: string | null;
  contactPhone: string | null;
  address: string | null;
  rawNotes: string | null;
}

export interface AdminOrderDetail {
  id: string;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  trackingNumber: string | null;
  adminNotes: string | null;
  totalAmount: number;
  depositAmount: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    deliveryRegion: string | null;
    deliveryCity: string | null;
    deliveryNovaPoshtaWarehouse: string | null;
  };
  delivery: AdminOrderDeliveryAddress;
  items: AdminOrderItem[];
  payments: AdminOrderPayment[];
}

export interface AdminOrderListResponse {
  orders: AdminOrderRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
