"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Share2, ImageDown, Truck } from "lucide-react";
import clsx from "clsx";
import type { BankAccount } from "@prisma/client";
import { saveInvoiceSettings } from "@/lib/actions/orders";
import { formatRupiah } from "@/lib/format";

export default function InvoicePanel({
  orderId,
  invoiceNumber,
  itemsSubtotal,
  shippingCost,
  bankAccounts,
  currentBankAccountId,
}: {
  orderId: string;
  invoiceNumber: string;
  itemsSubtotal: number;
  shippingCost: number;
  bankAccounts: BankAccount[];
  currentBankAccountId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState(currentBankAccountId ?? bankAccounts[0]?.id ?? "");
  const [hasShipping, setHasShipping] = useState(shippingCost > 0);
  const [shippingInput, setShippingInput] = useState(shippingCost > 0 ? String(shippingCost) : "");
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [sharing, setSharing] = useState(false);

  const shippingValue = hasShipping ? Math.max(0, Math.trunc(Number(shippingInput) || 0)) : 0;
  const grandTotal = itemsSubtotal + shippingValue;
  const dirty = selected !== currentBankAccountId || shippingValue !== shippingCost;

  const generateLabel = pending
    ? "Menyimpan..."
    : !currentBankAccountId
      ? "Generate Invoice"
      : dirty
        ? "Simpan & Perbarui Invoice"
        : "Perbarui Invoice";

  const invoiceUrl = `/api/pesanan/${orderId}/invoice${version ? `?v=${version}` : ""}`;
  const fileName = `${invoiceNumber}.png`;

  if (bankAccounts.length === 0) {
    return (
      <p className="text-sm text-ocean-500">
        Belum ada rekening bank aktif.{" "}
        <Link href="/pengaturan" className="font-semibold text-turquoise-600 underline">
          Tambah rekening di Pengaturan
        </Link>{" "}
        sebelum membuat invoice.
      </p>
    );
  }

  function handleGenerate() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await saveInvoiceSettings(orderId, selected, shippingValue);
      if (result?.error) {
        setError(result.error);
        return;
      }
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
      </div>

      <div className="space-y-3 rounded-2xl border-2 border-turquoise-100 bg-turquoise-50/60 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-ocean-700">
          <Truck size={16} className="text-turquoise-600" /> Ada ongkir pada transaksi ini?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setHasShipping(false)}
            className={clsx(
              "rounded-2xl px-4 py-2 text-sm font-semibold transition",
              !hasShipping
                ? "bg-turquoise-500 text-white shadow"
                : "border-2 border-ocean-100 bg-white text-ocean-600 hover:bg-ocean-50",
            )}
          >
            Tidak ada
          </button>
          <button
            type="button"
            onClick={() => setHasShipping(true)}
            className={clsx(
              "rounded-2xl px-4 py-2 text-sm font-semibold transition",
              hasShipping
                ? "bg-turquoise-500 text-white shadow"
                : "border-2 border-ocean-100 bg-white text-ocean-600 hover:bg-ocean-50",
            )}
          >
            Ada ongkir
          </button>
        </div>

        {hasShipping && (
          <div>
            <label className="label" htmlFor="shippingCost">
              Nilai ongkir (Rp)
            </label>
            <input
              id="shippingCost"
              type="number"
              min={0}
              step={1000}
              inputMode="numeric"
              className="input sm:w-56"
              placeholder="0"
              value={shippingInput}
              onChange={(e) => setShippingInput(e.target.value)}
            />
            <p className="mt-1 text-xs text-ocean-500">
              Ongkir yang ditagihkan: {formatRupiah(shippingValue)}
            </p>
          </div>
        )}

        <dl className="space-y-1 rounded-2xl bg-white px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-ocean-600">Subtotal barang</dt>
            <dd className="font-semibold text-turquoise-800">{formatRupiah(itemsSubtotal)}</dd>
          </div>
          {shippingValue > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-ocean-600">Ongkos kirim</dt>
              <dd className="font-semibold text-turquoise-800">{formatRupiah(shippingValue)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-turquoise-100 pt-1">
            <dt className="font-semibold text-ocean-700">Total tagihan</dt>
            <dd className="font-heading text-base font-bold text-turquoise-700">{formatRupiah(grandTotal)}</dd>
          </div>
        </dl>
      </div>

      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={pending}
          className="btn-primary whitespace-nowrap"
        >
          <ImageDown size={18} /> {generateLabel}
        </button>
        {dirty && (
          <p className="text-xs text-ocean-500">
            Perubahan ongkir/rekening belum tersimpan ke pesanan ini.
          </p>
        )}
      </div>

      {currentBankAccountId && (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-turquoise-100 bg-ocean-50">
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
