import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateTime } from "@/lib/format";
import StatusControl from "./status-control";
import PaymentControl from "@/components/payment-control";
import InvoicePanel from "./invoice-panel";
import DeleteOrderButton from "@/components/delete-order-button";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) notFound();

  const itemsSubtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  const bankAccounts = await prisma.bankAccount.findMany({
    where: { isActive: true },
    orderBy: { bankName: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-ocean-500">{order.invoiceNumber}</p>
          <h1 className="font-heading text-2xl font-bold text-turquoise-700">{order.customerName}</h1>
          <p className="text-sm text-ocean-500">{order.customerWhatsapp}</p>
        </div>
        <DeleteOrderButton orderId={order.id} invoiceNumber={order.invoiceNumber} redirectTo="/pesanan" label="Hapus" />
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
        <h2 className="font-heading text-lg font-bold text-turquoise-700">Detail Pesanan</h2>
        <div className="divide-y divide-turquoise-50">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium text-turquoise-800">{item.productNameSnapshot}</p>
                <p className="text-ocean-500">
                  {item.qty} x {formatRupiah(item.unitPriceSnapshot)}
                </p>
              </div>
              <p className="font-semibold text-turquoise-700">{formatRupiah(item.subtotal)}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1 border-t border-turquoise-100 pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ocean-600">Subtotal barang</span>
            <span className="font-semibold text-turquoise-800">{formatRupiah(itemsSubtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ocean-600">Ongkos kirim</span>
            <span className="font-semibold text-turquoise-800">
              {order.shippingCost > 0 ? formatRupiah(order.shippingCost) : "Tidak ada"}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="font-semibold text-turquoise-700">Total</span>
            <span className="font-heading text-xl font-bold text-turquoise-700">{formatRupiah(order.total)}</span>
          </div>
        </div>
        <p className="text-xs text-ocean-400">Tanggal pesanan: {formatDateTime(order.orderDate)}</p>
        {order.note && (
          <p className="rounded-xl bg-ocean-50 px-3 py-2 text-sm text-ocean-700">Catatan: {order.note}</p>
        )}
      </div>

      <div className="card space-y-3">
        <h2 className="font-heading text-lg font-bold text-turquoise-700">Invoice</h2>
        <InvoicePanel
          orderId={order.id}
          invoiceNumber={order.invoiceNumber}
          itemsSubtotal={itemsSubtotal}
          shippingCost={order.shippingCost}
          bankAccounts={bankAccounts}
          currentBankAccountId={order.bankAccountId}
        />
      </div>
    </div>
  );
}
