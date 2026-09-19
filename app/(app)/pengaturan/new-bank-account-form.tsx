"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createBankAccount, type BankAccountFormState } from "@/lib/actions/bank-accounts";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      <Plus size={16} /> {pending ? "Menambahkan..." : "Tambah Rekening"}
    </button>
  );
}

export default function NewBankAccountForm() {
  const [state, formAction] = useFormState<BankAccountFormState, FormData>(createBankAccount, {});
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state && !state.error) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-2xl border-2 border-dashed border-lavender-200 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input name="bankName" required className="input" placeholder="Nama bank (mis. BCA)" />
        <input name="accountNumber" required className="input" placeholder="Nomor rekening" />
        <input name="accountHolderName" required className="input" placeholder="Nama pemilik rekening" />
      </div>
      {state?.error && <p className="text-sm font-medium text-coral-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
