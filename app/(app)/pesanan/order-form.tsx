"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Product } from "@prisma/client";
import { createOrder } from "@/lib/actions/orders";
import { formatRupiah } from "@/lib/format";

// `discount` = nominal diskon untuk baris itu (Rupiah), bukan diskon per satuan.
type ItemRow = { key: string; productId: string; qty: number; discount: number };

function todayInputValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function OrderForm({ products }: { products: Product[] }) {
  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [orderDate, setOrderDate] = useState(todayInputValue());
  const [note, setNote] = useState("");
  const [items, setItems] = useState<ItemRow[]>([
    { key: crypto.randomUUID(), productId: "", qty: 1, discount: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const totals = useMemo(() => {
    let gross = 0;
    let discount = 0;
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;
      const lineGross = product.sellPrice * item.qty;
      gross += lineGross;
      // Diskon tidak pernah melebihi harga barangnya sendiri.
      discount += Math.min(item.discount, lineGross);
    }
    return { gross, discount, net: gross - discount };
  }, [items, products]);

  function addItem() {
    setItems((prev) => [...prev, { key: crypto.randomUUID(), productId: "", qty: 1, discount: 0 }]);
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

    const overDiscounted = validItems.find((i) => {
      const product = products.find((p) => p.id === i.productId);
      return product ? i.discount > product.sellPrice * i.qty : false;
    });
    if (overDiscounted) {
      setError("Ada diskon yang melebihi harga barang. Periksa kembali nominal diskonnya.");
      return;
    }

    startTransition(async () => {
      const result = await createOrder({
        customerName,
        customerWhatsapp,
        orderDate,
        note,
        items: validItems.map((i) => ({
          productId: i.productId,
          qty: i.qty,
          discount: i.discount,
        })),
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
        <div className="space-y-3">
          {items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            const lineGross = product ? product.sellPrice * item.qty : 0;
            const overDiscount = !!product && item.discount > lineGross;
            const lineNet = lineGross - Math.min(item.discount, lineGross);
            return (
              <div key={item.key} className="space-y-2 rounded-2xl bg-ocean-50/60 p-3">
                <div className="flex items-center gap-2">
                  <select
                    id={`product-${item.key}`}
                    aria-label="Barang"
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
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="rounded-xl p-2 text-rose-500 hover:bg-rose-50"
                    aria-label="Hapus baris"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ocean-600" htmlFor={`qty-${item.key}`}>
                      Qty
                    </label>
                    <input
                      id={`qty-${item.key}`}
                      type="number"
                      min={1}
                      step={1}
                      className="input"
                      value={item.qty}
                      onChange={(e) => updateItem(item.key, { qty: Math.max(1, Number(e.target.value) || 1) })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ocean-600" htmlFor={`discount-${item.key}`}>
                      Diskon (Rp)
                    </label>
                    <input
                      id={`discount-${item.key}`}
                      type="number"
                      min={0}
                      step={1}
                      className="input"
                      placeholder="0"
                      value={item.discount || ""}
                      onChange={(e) => updateItem(item.key, { discount: Math.max(0, Number(e.target.value) || 0) })}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="mb-1 text-xs font-semibold text-ocean-600">Harga baris ini</p>
                    <p className="font-semibold text-turquoise-700">
                      {product ? formatRupiah(lineNet) : "-"}
                      {product && item.discount > 0 && !overDiscount && (
                        <span className="ml-1 text-xs font-normal text-ocean-500 line-through">
                          {formatRupiah(lineGross)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {product && (
                  <p className="text-xs text-ocean-500">
                    Harga satuan {formatRupiah(product.sellPrice)} × {item.qty} = {formatRupiah(lineGross)}
                    {item.discount > 0 && ` — diskon ${formatRupiah(Math.min(item.discount, lineGross))}`}
                  </p>
                )}
                {overDiscount && (
                  <p className="text-xs font-semibold text-rose-600">
                    Diskon melebihi harga barang baris ini ({formatRupiah(lineGross)}).
                  </p>
                )}
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

      <div className="space-y-1 rounded-2xl bg-turquoise-50 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ocean-600">Total barang</span>
          <span className="font-semibold text-turquoise-800">{formatRupiah(totals.gross)}</span>
        </div>
        {totals.discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-ocean-600">Diskon</span>
            <span className="font-semibold text-turquoise-800">−{formatRupiah(totals.discount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-turquoise-100 pt-1">
          <span className="font-semibold text-turquoise-700">Total Tagihan</span>
          <span className="font-heading text-xl font-bold text-turquoise-700">{formatRupiah(totals.net)}</span>
        </div>
        <p className="text-xs text-ocean-500">
          Belum termasuk ongkir — ongkir ditanyakan menyusul saat membuat invoice.
        </p>
      </div>

      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

      <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
        {pending ? "Menyimpan..." : "Simpan Pesanan"}
      </button>
    </form>
  );
}
