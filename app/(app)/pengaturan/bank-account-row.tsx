"use client";

import { useEffect, useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Pencil, Archive, ArchiveRestore } from "lucide-react";
import type { BankAccount } from "@prisma/client";
import {
  updateBankAccount,
  toggleBankAccountActive,
  type BankAccountFormState,
} from "@/lib/actions/bank-accounts";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary !px-4 !py-2 text-sm">
      {pending ? "Menyimpan..." : "Simpan"}
    </button>
  );
}

export default function BankAccountRow({ bank }: { bank: BankAccount }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const action = updateBankAccount.bind(null, bank.id);
  const [state, formAction] = useFormState<BankAccountFormState, FormData>(action, {});

  useEffect(() => {
    if (state?.success) {
      setEditing(false);
      router.refresh();
    }
  }, [state, router]);

  if (editing) {
    return (
      <form action={formAction} className="space-y-3 rounded-2xl bg-lavender-50 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input name="bankName" defaultValue={bank.bankName} required className="input" placeholder="Nama bank" />
          <input name="accountNumber" defaultValue={bank.accountNumber} required className="input" placeholder="No. rekening" />
          <input
            name="accountHolderName"
            defaultValue={bank.accountHolderName}
            required
            className="input"
            placeholder="Nama pemilik"
          />
        </div>
        {state?.error && <p className="text-sm font-medium text-coral-600">{state.error}</p>}
        <div className="flex gap-2">
          <SaveButton />
          <button type="button" onClick={() => setEditing(false)} className="btn-secondary !px-4 !py-2 text-sm">
            Batal
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-lavender-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-hotpink-800">
          {bank.bankName} {!bank.isActive && <span className="badge ml-2 bg-gray-200 text-gray-600">Nonaktif</span>}
        </p>
        <p className="text-sm text-lavender-600">
          {bank.accountNumber} a/n {bank.accountHolderName}
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditing(true)} className="btn-ghost !px-3 !py-1.5 text-sm">
          <Pencil size={14} /> Edit
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await toggleBankAccountActive(bank.id, !bank.isActive);
              router.refresh();
            })
          }
          className="btn-ghost !px-3 !py-1.5 text-sm"
        >
          {bank.isActive ? (
            <>
              <Archive size={14} /> Nonaktifkan
            </>
          ) : (
            <>
              <ArchiveRestore size={14} /> Aktifkan
            </>
          )}
        </button>
      </div>
    </div>
  );
}
