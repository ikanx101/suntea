"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const productSchema = z.object({
  name: z.string().min(1, "Nama barang wajib diisi"),
  description: z.string().optional(),
  category: z.string().min(1, "Kategori wajib diisi"),
  supplierName: z.string().optional(),
  buyPrice: z.coerce.number().int().min(0),
  sellPrice: z.coerce.number().int().min(0),
});

export type ProductFormState = { error?: string; success?: boolean };

export async function createProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireSession();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  await prisma.product.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      category: parsed.data.category,
      supplierName: parsed.data.supplierName || null,
      buyPrice: parsed.data.buyPrice,
      sellPrice: parsed.data.sellPrice,
    },
  });

  revalidatePath("/produk");
  return { success: true };
}

export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireSession();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  await prisma.product.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      category: parsed.data.category,
      supplierName: parsed.data.supplierName || null,
      buyPrice: parsed.data.buyPrice,
      sellPrice: parsed.data.sellPrice,
    },
  });

  revalidatePath("/produk");
  return { success: true };
}

export async function toggleProductActive(id: string, isActive: boolean) {
  await requireSession();
  await prisma.product.update({ where: { id }, data: { isActive } });
  revalidatePath("/produk");
}
