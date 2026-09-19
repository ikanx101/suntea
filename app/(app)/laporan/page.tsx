import { prisma } from "@/lib/prisma";
import { resolveRange } from "@/lib/dashboard";
import { formatRupiah, formatDate } from "@/lib/format";
import DateRangeFilter from "@/components/date-range-filter";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/badges";

export const dynamic = "force-dynamic";

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: { preset?: string; from?: string; to?: string };
}) {
  const range = resolveRange(searchParams.preset, searchParams.from, searchParams.to);

  const [transactions, orders] = await Promise.all([
    prisma.transaction.findMany({ where: { date: { gte: range.from, lt: range.to } }, orderBy: { date: "desc" } }),
    prisma.order.findMany({ where: { orderDate: { gte: range.from, lt: range.to } }, orderBy: { orderDate: "desc" } }),
  ]);

  const totalIn = transactions.filter((t) => t.type === "IN").reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((t) => t.type === "OUT").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="font-heading text-2xl font-bold text-hotpink-700">Laporan</h1>
        <DateRangeFilter />
      </div>

      <p className="rounded-2xl bg-lavender-50 px-4 py-2 text-sm text-lavender-600">
        Export CSV/Excel menyusul — menunggu konfirmasi kebutuhan (lihat bagian 12 dokumen requirement).
      </p>

      <div className="card">
        <h2 className="mb-3 font-heading text-lg font-bold text-hotpink-700">
          Transaksi ({transactions.length}) — Masuk {formatRupiah(totalIn)} / Keluar {formatRupiah(totalOut)}
        </h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-lavender-500">Tidak ada transaksi pada periode ini.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl bg-lavender-50/60 px-3 py-2 text-sm">
                <span>
                  {formatDate(t.date)} · {t.category}
                </span>
                <span className={t.type === "IN" ? "font-semibold text-mint-600" : "font-semibold text-coral-600"}>
                  {t.type === "IN" ? "+" : "-"}
                  {formatRupiah(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="mb-3 font-heading text-lg font-bold text-hotpink-700">Pesanan ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-lavender-500">Tidak ada pesanan pada periode ini.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-hotpink-50/50 px-3 py-2 text-sm">
                <span>
                  {formatDate(o.orderDate)} · {o.customerName} · {o.invoiceNumber}
                </span>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={o.status} />
                  <PaymentStatusBadge status={o.paymentStatus} />
                  <span className="font-semibold text-hotpink-700">{formatRupiah(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
