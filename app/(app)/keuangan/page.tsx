import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate } from "@/lib/format";
import TransactionForm from "./transaction-form";
import DeleteTransactionButton from "./delete-transaction-button";
import DeleteOrderButton from "@/components/delete-order-button";

export const dynamic = "force-dynamic";

export default async function KeuanganPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: "desc" },
    take: 100,
    include: { order: true },
  });

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-bold text-hotpink-700">Keuangan</h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <h2 className="mb-4 font-heading text-lg font-bold text-hotpink-700">Tambah Transaksi Manual</h2>
          <TransactionForm />
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="mb-4 font-heading text-lg font-bold text-hotpink-700">Riwayat Transaksi</h2>
            {transactions.length === 0 ? (
              <p className="text-sm text-lavender-500">Belum ada transaksi.</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-lavender-50/60 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-hotpink-800">{t.category}</p>
                      <p className="text-xs text-lavender-500">
                        {formatDate(t.date)}
                        {t.description ? ` · ${t.description}` : ""}
                        {t.source === "ORDER" && t.order ? (
                          <>
                            {" · "}
                            <Link href={`/pesanan/${t.order.id}`} className="underline">
                              {t.order.invoiceNumber}
                            </Link>
                          </>
                        ) : null}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-heading font-bold ${t.type === "IN" ? "text-mint-600" : "text-coral-600"}`}
                      >
                        {t.type === "IN" ? "+" : "-"}
                        {formatRupiah(t.amount)}
                      </span>
                      {t.source === "MANUAL" && <DeleteTransactionButton id={t.id} />}
                      {t.source === "ORDER" && t.order && (
                        <DeleteOrderButton orderId={t.order.id} invoiceNumber={t.order.invoiceNumber} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
