import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateTime } from "@/lib/format";
import StatusControl from "./status-control";
import PaymentControl from "@/components/payment-control";
import InvoicePanel from "./invoice-panel";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) notFound();

  const bankAccounts = await prisma.bankAccount.findMany({
    where: { isActive: true },
    orderBy: { bankName: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-sm text-lavender-500">{order.invoiceNumber}</p>
        <h1 className="font-heading text-2xl font-bold text-hotpink-700">{order.customerName}</h1>
        <p className="text-sm text-lavender-500">{order.customerWhatsapp}</p>
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label !mb-1">Status Pesanan</p>
          <StatusControl orderId={order.id} status={order.status} />
        </div>
        <div>
          <p className="label !mb-1">Status Pembayaran</p>
          <PaymentControl
            orderId={order.id}
            paymentStatus={order.paymentStatus}
            disabled={order.status === "CANCELLED"}
          />
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-heading text-lg font-bold text-hotpink-700">Detail Pesanan</h2>
        <div className="divide-y divide-hotpink-50">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium text-hotpink-800">{item.productNameSnapshot}</p>
                <p className="text-lavender-500">
                  {item.qty} x {formatRupiah(item.unitPriceSnapshot)}
                </p>
              </div>
              <p className="font-semibold text-hotpink-700">{formatRupiah(item.subtotal)}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-hotpink-100 pt-3">
          <span className="font-semibold text-hotpink-700">Total</span>
          <span className="font-heading text-xl font-bold text-hotpink-700">{formatRupiah(order.total)}</span>
        </div>
        <p className="text-xs text-lavender-400">Tanggal pesanan: {formatDateTime(order.orderDate)}</p>
        {order.note && (
          <p className="rounded-xl bg-lavender-50 px-3 py-2 text-sm text-lavender-700">Catatan: {order.note}</p>
        )}
      </div>

      <div className="card space-y-3">
        <h2 className="font-heading text-lg font-bold text-hotpink-700">Invoice</h2>
        <InvoicePanel
          orderId={order.id}
          invoiceNumber={order.invoiceNumber}
          bankAccounts={bankAccounts}
          currentBankAccountId={order.bankAccountId}
        />
      </div>
    </div>
  );
}
