"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PaymentStatus } from "@prisma/client";
import { togglePaymentStatus } from "@/lib/actions/orders";

export default function PaymentControl({
  orderId,
  paymentStatus,
  disabled,
}: {
  orderId: string;
  paymentStatus: PaymentStatus;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isPaid = paymentStatus === "PAID";

  function toggle() {
    if (isPaid && !confirm("Tandai kembali sebagai Belum Lunas? Transaksi pemasukan terkait akan dihapus.")) {
      return;
    }
    startTransition(async () => {
      await togglePaymentStatus(orderId, !isPaid);
      router.refresh();
    });
  }

  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-lavender-50 px-4 py-2">
      <input
        type="checkbox"
        checked={isPaid}
        disabled={pending || disabled}
        onChange={toggle}
        className="h-5 w-5 accent-mint-500"
      />
      <span className="font-semibold text-lavender-700">{isPaid ? "Lunas" : "Tandai sebagai Lunas"}</span>
    </label>
  );
}
