"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteOrder } from "@/lib/actions/orders";

export default function DeleteOrderButton({
  orderId,
  invoiceNumber,
  redirectTo,
  label,
}: {
  orderId: string;
  invoiceNumber: string;
  redirectTo?: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = confirm(
      `Hapus invoice ${invoiceNumber} secara permanen?\n\nSeluruh data pesanan ini (item, dan transaksi Keuangan yang tertaut jika ada) akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      await deleteOrder(orderId);
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className={label ? "btn-ghost !text-coral-600" : "rounded-xl p-2 text-coral-500 hover:bg-coral-50"}
      aria-label={`Hapus invoice ${invoiceNumber}`}
    >
      <Trash2 size={16} />
      {label && <span>{label}</span>}
    </button>
  );
}
