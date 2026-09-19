import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderInvoicePng } from "@/lib/invoice-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }
  if (!order.bankAccountId || !order.bankNameSnapshot || !order.accountNumberSnapshot || !order.accountHolderSnapshot) {
    return NextResponse.json({ error: "Pilih rekening bank terlebih dahulu sebelum membuat invoice" }, { status: 400 });
  }

  const settings = await prisma.settings.findUnique({ where: { id: "settings" } });

  const png = await renderInvoicePng({
    storeName: settings?.storeName ?? "Toko Santi Irawati",
    logoDataUrl: settings?.logoDataUrl ?? null,
    invoiceNumber: order.invoiceNumber,
    orderDate: order.orderDate,
    customerName: order.customerName,
    customerWhatsapp: order.customerWhatsapp,
    items: order.items.map((item) => ({
      name: item.productNameSnapshot,
      qty: item.qty,
      total: item.subtotal,
    })),
    total: order.total,
    bankName: order.bankNameSnapshot,
    accountNumber: order.accountNumberSnapshot,
    accountHolderName: order.accountHolderSnapshot,
    note: order.note,
  });

  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
