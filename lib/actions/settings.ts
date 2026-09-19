"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export type SettingsFormState = { error?: string; success?: string };

const MAX_LOGO_BYTES = 1.5 * 1024 * 1024;

export async function updateStoreSettings(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requireSession();

  const storeName = String(formData.get("storeName") || "").trim();
  if (!storeName) {
    return { error: "Nama toko wajib diisi" };
  }

  const logoFile = formData.get("logo");
  let logoDataUrl: string | undefined;

  if (logoFile instanceof File && logoFile.size > 0) {
    if (logoFile.size > MAX_LOGO_BYTES) {
      return { error: "Ukuran logo maksimal 1.5MB" };
    }
    if (!logoFile.type.startsWith("image/")) {
      return { error: "File logo harus berupa gambar" };
    }
    const buffer = Buffer.from(await logoFile.arrayBuffer());
    logoDataUrl = `data:${logoFile.type};base64,${buffer.toString("base64")}`;
  }

  await prisma.settings.upsert({
    where: { id: "settings" },
    update: {
      storeName,
      ...(logoDataUrl ? { logoDataUrl } : {}),
    },
    create: {
      id: "settings",
      storeName,
      logoDataUrl: logoDataUrl ?? null,
    },
  });

  revalidatePath("/pengaturan");
  revalidatePath("/", "layout");
  return { success: "Pengaturan toko tersimpan" };
}

export async function removeStoreLogo(): Promise<SettingsFormState> {
  await requireSession();
  await prisma.settings.update({ where: { id: "settings" }, data: { logoDataUrl: null } });
  revalidatePath("/pengaturan");
  return { success: "Logo dihapus" };
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export async function changePassword(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const session = await requireSession();

  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const userId = (session.user as { id?: string })?.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { error: "User tidak ditemukan" };
  }

  const isValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!isValid) {
    return { error: "Password saat ini salah" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: "Password berhasil diganti" };
}
