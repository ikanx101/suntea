import { prisma } from "@/lib/prisma";
import StoreSettingsForm from "./store-settings-form";
import NewBankAccountForm from "./new-bank-account-form";
import BankAccountRow from "./bank-account-row";
import ChangePasswordForm from "./change-password-form";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const [settings, bankAccounts] = await Promise.all([
    prisma.settings.findUnique({ where: { id: "settings" } }),
    prisma.bankAccount.findMany({ orderBy: [{ isActive: "desc" }, { createdAt: "desc" }] }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-heading text-2xl font-bold text-hotpink-700">Pengaturan</h1>

      <div className="card">
        <h2 className="mb-4 font-heading text-lg font-bold text-hotpink-700">Branding Toko</h2>
        <StoreSettingsForm storeName={settings?.storeName ?? "Toko Santi Irawati"} logoDataUrl={settings?.logoDataUrl ?? null} />
      </div>

      <div className="card space-y-4">
        <h2 className="font-heading text-lg font-bold text-hotpink-700">Rekening Bank</h2>
        <div className="space-y-3">
          {bankAccounts.map((bank) => (
            <BankAccountRow key={bank.id} bank={bank} />
          ))}
        </div>
        <NewBankAccountForm />
      </div>

      <div className="card">
        <h2 className="mb-4 font-heading text-lg font-bold text-hotpink-700">Ganti Password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
