"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { createManualTransaction, type TransactionFormState } from "@/lib/actions/transactions";

const IN_CATEGORIES = ["Penjualan", "Lain-lain"];
const OUT_CATEGORIES = ["Belanja Stok ke Pemasok", "Ongkir", "Kemasan", "Operasional Lain"];

function todayInputValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
      {pending ? "Menyimpan..." : "Tambah Transaksi"}
    </button>
  );
}

export default function TransactionForm() {
  const [state, formAction] = useFormState<TransactionFormState, FormData>(createManualTransaction, {});
  const [type, setType] = useState<"IN" | "OUT">("OUT");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && !state.error) {
      formRef.current?.reset();
    }
  }, [state]);

  const categories = type === "IN" ? IN_CATEGORIES : OUT_CATEGORIES;

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="flex gap-2">
        {(["OUT", "IN"] as const).map((t) => (
          <label
            key={t}
            className={`flex-1 cursor-pointer rounded-2xl border-2 px-4 py-2 text-center font-semibold transition ${
              type === t ? (t === "IN" ? "border-mint-400 bg-mint-50 text-mint-700" : "border-coral-400 bg-coral-50 text-coral-700") : "border-lavender-100 text-lavender-500"
            }`}
          >
            <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="hidden" />
            {t === "IN" ? "Pemasukan" : "Pengeluaran"}
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="amount">
            Nominal (Rp)
          </label>
          <input id="amount" name="amount" type="number" min={1} required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="date">
            Tanggal
          </label>
          <input id="date" name="date" type="date" required defaultValue={todayInputValue()} className="input" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="category">
          Kategori
        </label>
        <select id="category" name="category" required className="input">
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="description">
          Keterangan (opsional)
        </label>
        <input id="description" name="description" className="input" />
      </div>

      {state?.error && <p className="text-sm font-medium text-coral-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}
