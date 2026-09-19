"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const transactionSchema = z.object({
  type: z.enum(["IN", "OUT"]),
  amount: z.coerce.number().int().positive("Nominal harus lebih dari 0"),
  category: z.string().min(1, "Kategori wajib diisi"),
  description: z.string().optional(),
  date: z.string().min(1, "Tanggal wajib diisi"),
});

export type TransactionFormState = { error?: string };

export async function createManualTransaction(
  _prev: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  await requireSession();
  const parsed = transactionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  await prisma.transaction.create({
    data: {
      type: parsed.data.type,
      amount: parsed.data.amount,
      category: parsed.data.category,
      description: parsed.data.description || null,
      date: new Date(parsed.data.date),
      source: "MANUAL",
    },
  });

  revalidatePath("/keuangan");
  revalidatePath("/");
  return {};
}

export async function deleteManualTransaction(id: string) {
  await requireSession();
  const trx = await prisma.transaction.findUnique({ where: { id } });
  if (!trx || trx.source !== "MANUAL") {
    throw new Error("Hanya transaksi manual yang bisa dihapus");
  }
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/keuangan");
  revalidatePath("/");
}
