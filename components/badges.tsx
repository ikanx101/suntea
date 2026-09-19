import clsx from "clsx";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: "Baru",
  PROCESSING: "Diproses",
  DONE: "Selesai",
  CANCELLED: "Dibatalkan",
};

const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  NEW: "bg-lavender-100 text-lavender-700",
  PROCESSING: "bg-hotpink-100 text-hotpink-700",
  DONE: "bg-mint-100 text-mint-700",
  CANCELLED: "bg-gray-200 text-gray-600",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={clsx("badge", ORDER_STATUS_CLASS[status])}>{ORDER_STATUS_LABEL[status]}</span>;
}

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  UNPAID: "Belum Lunas",
  PAID: "Lunas",
};

const PAYMENT_STATUS_CLASS: Record<PaymentStatus, string> = {
  UNPAID: "bg-coral-100 text-coral-700",
  PAID: "bg-mint-100 text-mint-700",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={clsx("badge", PAYMENT_STATUS_CLASS[status])}>{PAYMENT_STATUS_LABEL[status]}</span>;
}

export { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL };
