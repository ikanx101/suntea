import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate } from "@/lib/format";
import PaymentControl from "@/components/payment-control";
import type { PaymentStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const TABS: { value: string; label: string }[] = [
  { value: "unpaid", label: "Belum Lunas" },
  { value: "paid", label: "Lunas" },
  { value: "all", label: "Semua" },
];

export default async function PiutangPage({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string };
}) {
  const tab = searchParams.tab ?? "unpaid";
  const q = searchParams.q?.trim() ?? "";

  const where: Prisma.OrderWhereInput = {
    status: { not: "CANCELLED" },
    ...(tab === "unpaid" ? { paymentStatus: "UNPAID" as PaymentStatus } : {}),
    ...(tab === "paid" ? { paymentStatus: "PAID" as PaymentStatus } : {}),
    ...(q
      ? {
          OR: [
            { customerName: { contains: q, mode: "insensitive" } },
            { invoiceNumber: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orders = await prisma.order.findMany({ where, orderBy: { orderDate: "desc" } });

  const unpaidAll = await prisma.order.findMany({
    where: { status: { not: "CANCELLED" }, paymentStatus: "UNPAID" },
  });
  const totalPiutang = unpaidAll.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-bold text-hotpink-700">Konfirmasi Pembayaran (Piutang)</h1>

      <div className="card flex items-center gap-3 border-coral-200 bg-coral-50">
        <div className="rounded-2xl bg-coral-500 p-3 text-white">
          <AlertCircle size={22} />
        </div>
        <div>
          <p className="font-semibold text-coral-700">
            {unpaidAll.length} invoice belum lunas — total {formatRupiah(totalPiutang)}
          </p>
          <p className="text-sm text-coral-500">Centang invoice yang uangnya sudah diterima agar tidak terlewat.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={`/piutang?tab=${t.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                tab === t.value ? "bg-hotpink-500 text-white shadow" : "bg-lavender-50 text-lavender-600"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <form method="get" className="flex gap-2">
          <input type="hidden" name="tab" value={tab} />
          <input type="text" name="q" defaultValue={q} placeholder="Cari nama/no invoice..." className="input" />
          <button type="submit" className="btn-secondary">
            Cari
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <p className="card text-center text-lavender-500">Tidak ada invoice yang cocok.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href={`/pesanan/${order.id}`} className="font-heading font-bold text-hotpink-800 hover:underline">
                  {order.customerName}
                </Link>
                <p className="text-xs text-lavender-500">
                  {order.invoiceNumber} · {formatDate(order.orderDate)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-heading font-bold text-hotpink-700">{formatRupiah(order.total)}</span>
                <PaymentControl orderId={order.id} paymentStatus={order.paymentStatus} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
