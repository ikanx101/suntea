"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteManualTransaction } from "@/lib/actions/transactions";

export default function DeleteTransactionButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Hapus transaksi ini?")) return;
        startTransition(async () => {
          await deleteManualTransaction(id);
          router.refresh();
        });
      }}
      className="rounded-xl p-2 text-coral-500 hover:bg-coral-50"
      aria-label="Hapus transaksi"
    >
      <Trash2 size={16} />
    </button>
  );
}
