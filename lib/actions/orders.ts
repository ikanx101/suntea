"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { generateInvoiceNumber } from "@/lib/invoice-number";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().positive(),
});

const createOrderSchema = z.object({
  customerName: z.string().min(1, "Nama pemesan wajib diisi"),
  customerWhatsapp: z.string().min(1, "Nomor WhatsApp wajib diisi"),
  orderDate: z.string().min(1, "Tanggal pesanan wajib diisi"),
  note: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Minimal 1 barang harus dipilih"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderActionState = { error?: string; orderId?: string };

export async function createOrder(input: CreateOrderInput): Promise<OrderActionState> {
  await requireSession();
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const productIds = parsed.data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (products.length !== new Set(productIds).size) {
    return { error: "Ada barang yang tidak ditemukan" };
  }

  const orderDate = new Date(parsed.data.orderDate);

  const itemsData = parsed.data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const subtotal = product.sellPrice * item.qty;
    return {
      productId: product.id,
      productNameSnapshot: product.name,
      unitPriceSnapshot: product.sellPrice,
      qty: item.qty,
      subtotal,
    };
  });

  const total = itemsData.reduce((sum, i) => sum + i.subtotal, 0);
  const invoiceNumber = await generateInvoiceNumber(orderDate);

  const order = await prisma.order.create({
    data: {
      invoiceNumber,
      customerName: parsed.data.customerName,
      customerWhatsapp: parsed.data.customerWhatsapp,
      orderDate,
      note: parsed.data.note || null,
      total,
      items: { create: itemsData },
    },
  });

  revalidatePath("/pesanan");
  revalidatePath("/");
  redirect(`/pesanan/${order.id}`);
}

export async function updateOrderStatus(orderId: string, status: "NEW" | "PROCESSING" | "DONE" | "CANCELLED") {
  await requireSession();

  if (status === "CANCELLED") {
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { orderId, source: "ORDER" } }),
      prisma.order.update({
        where: { id: orderId },
        data: { status, paymentStatus: "UNPAID", paidAt: null },
      }),
    ]);
  } else {
    await prisma.order.update({ where: { id: orderId }, data: { status } });
  }

  revalidatePath(`/pesanan/${orderId}`);
  revalidatePath("/pesanan");
  revalidatePath("/piutang");
  revalidatePath("/");
}

export async function setOrderBankAccount(orderId: string, bankAccountId: string) {
  await requireSession();
  const bank = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } });
  if (!bank) throw new Error("Rekening tidak ditemukan");

  await prisma.order.update({
    where: { id: orderId },
    data: {
      bankAccountId: bank.id,
      bankNameSnapshot: bank.bankName,
      accountNumberSnapshot: bank.accountNumber,
      accountHolderSnapshot: bank.accountHolderName,
    },
  });

  revalidatePath(`/pesanan/${orderId}`);
}

export async function togglePaymentStatus(orderId: string, paid: boolean) {
  await requireSession();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Pesanan tidak ditemukan");
  if (order.status === "CANCELLED") throw new Error("Pesanan sudah dibatalkan");

  if (paid) {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "PAID", paidAt: new Date() },
      }),
      prisma.transaction.create({
        data: {
          type: "IN",
          amount: order.total,
          category: "Penjualan",
          description: `Pembayaran invoice ${order.invoiceNumber} (${order.customerName})`,
          date: new Date(),
          source: "ORDER",
          orderId: order.id,
        },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { orderId, source: "ORDER" } }),
      prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "UNPAID", paidAt: null },
      }),
    ]);
  }

  revalidatePath(`/pesanan/${orderId}`);
  revalidatePath("/pesanan");
  revalidatePath("/piutang");
  revalidatePath("/keuangan");
  revalidatePath("/");
}
