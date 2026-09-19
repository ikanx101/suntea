"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/lib/actions/orders";
import { ORDER_STATUS_LABEL } from "@/components/badges";

const OPTIONS: OrderStatus[] = ["NEW", "PROCESSING", "DONE", "CANCELLED"];

export default function StatusControl({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(next: OrderStatus) {
    if (next === status) return;
    if (next === "CANCELLED" && !confirm("Batalkan pesanan ini? Transaksi pemasukan terkait (jika ada) akan ikut dihapus.")) {
      return;
    }
    startTransition(async () => {
      await updateOrderStatus(orderId, next);
      router.refresh();
    });
  }

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
      className="input !w-auto"
    >
      {OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {ORDER_STATUS_LABEL[opt]}
        </option>
      ))}
    </select>
  );
}
