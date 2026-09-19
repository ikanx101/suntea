import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/");
  }

  const settings = await prisma.settings.findUnique({ where: { id: "settings" } });
  const storeName = settings?.storeName ?? "Toko Santi Irawati";
  const logoSrc = settings?.logoDataUrl ?? "/logo.png";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-hotpink-100 via-cream to-lavender-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt={storeName} className="mx-auto mb-3 h-16 w-16 rounded-3xl object-cover shadow-md" />
          <h1 className="font-heading text-3xl font-bold text-hotpink-600">{storeName}</h1>
          <p className="mt-1 text-lavender-600">Masuk untuk kelola produk, pesanan & keuangan</p>
        </div>
        <div className="card">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
