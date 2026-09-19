"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Share2, ImageDown } from "lucide-react";
import type { BankAccount } from "@prisma/client";
import { setOrderBankAccount } from "@/lib/actions/orders";

export default function InvoicePanel({
  orderId,
  invoiceNumber,
  bankAccounts,
  currentBankAccountId,
}: {
  orderId: string;
  invoiceNumber: string;
  bankAccounts: BankAccount[];
  currentBankAccountId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState(currentBankAccountId ?? bankAccounts[0]?.id ?? "");
  const [version, setVersion] = useState(0);
  const [sharing, setSharing] = useState(false);

  const invoiceUrl = `/api/pesanan/${orderId}/invoice${version ? `?v=${version}` : ""}`;
  const fileName = `${invoiceNumber}.png`;

  if (bankAccounts.length === 0) {
    return (
      <p className="text-sm text-lavender-500">
        Belum ada rekening bank aktif.{" "}
        <Link href="/pengaturan" className="font-semibold text-hotpink-600 underline">
          Tambah rekening di Pengaturan
        </Link>{" "}
        sebelum membuat invoice.
      </p>
    );
  }

  function handleGenerate() {
    if (!selected) return;
    startTransition(async () => {
      await setOrderBankAccount(orderId, selected);
      setVersion((v) => v + 1);
      router.refresh();
    });
  }

  async function handleShare() {
    setSharing(true);
    try {
      const res = await fetch(invoiceUrl);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `Invoice ${invoiceNumber}` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input flex-1">
          {bankAccounts.map((b) => (
            <option key={b.id} value={b.id}>
              {b.bankName} — {b.accountNumber} a/n {b.accountHolderName}
            </option>
          ))}
        </select>
        <button type="button" onClick={handleGenerate} disabled={pending} className="btn-primary whitespace-nowrap">
          <ImageDown size={18} /> {pending ? "Membuat..." : currentBankAccountId ? "Perbarui Invoice" : "Generate Invoice"}
        </button>
      </div>

      {currentBankAccountId && (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-hotpink-100 bg-lavender-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={version} src={invoiceUrl} alt={`Invoice ${invoiceNumber}`} className="w-full" />
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={invoiceUrl} download={fileName} className="btn-secondary">
              <Download size={18} /> Download PNG
            </a>
            <button type="button" onClick={handleShare} disabled={sharing} className="btn-primary">
              <Share2 size={18} /> {sharing ? "Menyiapkan..." : "Bagikan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
