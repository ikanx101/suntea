import Link from "next/link";
import { TrendingUp, TrendingDown, PiggyBank, Percent, AlertCircle, Trophy } from "lucide-react";
import { resolveRange, getDashboardData } from "@/lib/dashboard";
import { formatRupiah } from "@/lib/format";
import StatCard from "@/components/stat-card";
import DateRangeFilter from "@/components/date-range-filter";
import TrendChart from "@/components/trend-chart";
import { ORDER_STATUS_LABEL } from "@/components/badges";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { preset?: string; from?: string; to?: string };
}) {
  const range = resolveRange(searchParams.preset, searchParams.from, searchParams.to);
  const data = await getDashboardData(range);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="font-heading text-2xl font-bold text-hotpink-700">Dashboard</h1>
        <DateRangeFilter />
      </div>

      {data.countPiutang > 0 && (
        <Link
          href="/piutang"
          className="card flex items-center justify-between border-coral-200 bg-coral-50 transition hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-coral-500 p-3 text-white">
              <AlertCircle size={22} />
            </div>
            <div>
              <p className="font-semibold text-coral-700">
                {data.countPiutang} invoice belum lunas — total piutang {formatRupiah(data.totalPiutang)}
              </p>
              <p className="text-sm text-coral-500">Klik untuk konfirmasi pembayaran & cek piutang</p>
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Pemasukan" value={formatRupiah(data.totalIn)} icon={TrendingUp} tone="mint" />
        <StatCard label="Total Pengeluaran" value={formatRupiah(data.totalOut)} icon={TrendingDown} tone="coral" />
        <StatCard label="Laba Bersih" value={formatRupiah(data.netProfit)} icon={PiggyBank} tone="pink" />
        <StatCard label="Estimasi Margin Kotor" value={formatRupiah(data.grossMargin)} icon={Percent} tone="lavender" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-4 font-heading text-lg font-bold text-hotpink-700">Tren Pemasukan vs Pengeluaran</h2>
          <TrendChart data={data.trend} />
        </div>

        <div className="card">
          <h2 className="mb-4 font-heading text-lg font-bold text-hotpink-700">Pesanan per Status</h2>
          <ul className="space-y-2">
            {(Object.keys(data.statusCounts) as (keyof typeof data.statusCounts)[]).map((key) => (
              <li key={key} className="flex items-center justify-between rounded-xl bg-hotpink-50/60 px-3 py-2">
                <span className="text-sm font-medium text-lavender-700">{ORDER_STATUS_LABEL[key]}</span>
                <span className="font-heading font-bold text-hotpink-700">{data.statusCounts[key]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-hotpink-700">
          <Trophy size={18} className="text-coral-500" /> Produk Terlaris
        </h2>
        {data.topProducts.length === 0 ? (
          <p className="text-sm text-lavender-500">Belum ada penjualan pada periode ini.</p>
        ) : (
          <ol className="space-y-2">
            {data.topProducts.map((p, i) => (
              <li key={p.name} className="flex items-center justify-between rounded-xl bg-lavender-50/60 px-3 py-2">
                <span className="text-sm font-medium text-lavender-700">
                  {i + 1}. {p.name}
                </span>
                <span className="font-heading font-bold text-hotpink-700">{p.qty} terjual</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
