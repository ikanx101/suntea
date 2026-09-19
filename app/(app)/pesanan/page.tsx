import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate } from "@/lib/format";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/badges";
import DeleteOrderButton from "@/components/delete-order-button";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_TABS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "NEW", label: "Baru" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "DONE", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

export default async function PesananPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status ?? "ALL";

  const orders = await prisma.order.findMany({
    where: status !== "ALL" ? { status: status as OrderStatus } : {},
    orderBy: { orderDate: "desc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="font-heading text-2xl font-bold text-hotpink-700">Pesanan</h1>
        <Link href="/pesanan/baru" className="btn-primary">
          <Plus size={18} /> Tambah Pesanan
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "ALL" ? "/pesanan" : `/pesanan?status=${tab.value}`}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              status === tab.value ? "bg-hotpink-500 text-white shadow" : "bg-lavender-50 text-lavender-600"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="card text-center text-lavender-500">Belum ada pesanan.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/pesanan/${order.id}`}
              className="card flex flex-col gap-2 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-heading font-bold text-hotpink-800">{order.customerName}</p>
                <p className="text-xs text-lavender-500">
                  {order.invoiceNumber} · {formatDate(order.orderDate)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} />
                <span className="font-heading font-bold text-hotpink-700">{formatRupiah(order.total)}</span>
                <DeleteOrderButton orderId={order.id} invoiceNumber={order.invoiceNumber} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
