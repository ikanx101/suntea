"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Product } from "@prisma/client";
import { createOrder } from "@/lib/actions/orders";
import { formatRupiah } from "@/lib/format";

type ItemRow = { key: string; productId: string; qty: number };

function todayInputValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function OrderForm({ products }: { products: Product[] }) {
  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [orderDate, setOrderDate] = useState(todayInputValue());
  const [note, setNote] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ key: crypto.randomUUID(), productId: "", qty: 1 }]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product ? product.sellPrice * item.qty : 0);
    }, 0);
  }, [items, products]);

  function addItem() {
    setItems((prev) => [...prev, { key: crypto.randomUUID(), productId: "", qty: 1 }]);
  }

  function removeItem(key: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.key !== key) : prev));
  }

  function updateItem(key: string, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validItems = items.filter((i) => i.productId && i.qty > 0);
    if (validItems.length === 0) {
      setError("Pilih minimal 1 barang dengan kuantitas valid");
      return;
    }

    startTransition(async () => {
      const result = await createOrder({
        customerName,
        customerWhatsapp,
        orderDate,
        note,
        items: validItems.map((i) => ({ productId: i.productId, qty: i.qty })),
      });
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="customerName">
            Nama Pemesan
          </label>
          <input
            id="customerName"
            required
            className="input"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="customerWhatsapp">
            Nomor WhatsApp
          </label>
          <input
            id="customerWhatsapp"
            required
            className="input"
            placeholder="08xxxxxxxxxx"
            value={customerWhatsapp}
            onChange={(e) => setCustomerWhatsapp(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="orderDate">
          Tanggal Pesanan
        </label>
        <input
          id="orderDate"
          type="date"
          required
          className="input sm:w-56"
          value={orderDate}
          onChange={(e) => setOrderDate(e.target.value)}
        />
      </div>

      <div>
        <label className="label">Daftar Barang</label>
        <div className="space-y-2">
          {items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return (
              <div key={item.key} className="flex flex-col gap-2 rounded-2xl bg-lavender-50/60 p-3 sm:flex-row sm:items-center">
                <select
                  className="input flex-1"
                  value={item.productId}
                  onChange={(e) => updateItem(item.key, { productId: e.target.value })}
                >
                  <option value="">Pilih barang...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatRupiah(p.sellPrice)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  className="input sm:w-24"
                  value={item.qty}
                  onChange={(e) => updateItem(item.key, { qty: Math.max(1, Number(e.target.value)) })}
                />
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <span className="text-sm font-semibold text-hotpink-700 sm:w-32 sm:text-right">
                    {product ? formatRupiah(product.sellPrice * item.qty) : "-"}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="rounded-xl p-2 text-coral-500 hover:bg-coral-50"
                    aria-label="Hapus baris"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button type="button" onClick={addItem} className="btn-ghost mt-2 text-sm">
          <Plus size={16} /> Tambah Barang
        </button>
      </div>

      <div>
        <label className="label" htmlFor="note">
          Catatan (opsional)
        </label>
        <textarea id="note" className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-hotpink-50 px-4 py-3">
        <span className="font-semibold text-hotpink-700">Total Tagihan</span>
        <span className="font-heading text-xl font-bold text-hotpink-700">{formatRupiah(total)}</span>
      </div>

      {error && <p className="text-sm font-medium text-coral-600">{error}</p>}

      <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
        {pending ? "Menyimpan..." : "Simpan Pesanan"}
      </button>
    </form>
  );
}
