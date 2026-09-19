"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const bankAccountSchema = z.object({
  bankName: z.string().min(1, "Nama bank wajib diisi"),
  accountNumber: z.string().min(1, "Nomor rekening wajib diisi"),
  accountHolderName: z.string().min(1, "Nama pemilik rekening wajib diisi"),
});

export type BankAccountFormState = { error?: string; success?: boolean };

export async function createBankAccount(
  _prev: BankAccountFormState,
  formData: FormData,
): Promise<BankAccountFormState> {
  await requireSession();
  const parsed = bankAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  await prisma.bankAccount.create({ data: parsed.data });
  revalidatePath("/pengaturan");
  return { success: true };
}

export async function updateBankAccount(
  id: string,
  _prev: BankAccountFormState,
  formData: FormData,
): Promise<BankAccountFormState> {
  await requireSession();
  const parsed = bankAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  await prisma.bankAccount.update({ where: { id }, data: parsed.data });
  revalidatePath("/pengaturan");
  return { success: true };
}

export async function toggleBankAccountActive(id: string, isActive: boolean) {
  await requireSession();
  await prisma.bankAccount.update({ where: { id }, data: { isActive } });
  revalidatePath("/pengaturan");
}
