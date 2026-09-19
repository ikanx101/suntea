"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Product } from "@prisma/client";
import { createProduct, updateProduct, type ProductFormState } from "@/lib/actions/products";

const CATEGORY_OPTIONS = ["Frozen Food", "Ready to Eat", "Lainnya"];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
      {pending ? "Menyimpan..." : label}
    </button>
  );
}

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const action = product ? updateProduct.bind(null, product.id) : createProduct;
  const [state, formAction] = useFormState<ProductFormState, FormData>(action, {});

  useEffect(() => {
    if (state?.success) {
      router.push("/produk");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">
          Nama Barang
        </label>
        <input id="name" name="name" required defaultValue={product?.name} className="input" />
      </div>

      <div>
        <label className="label" htmlFor="description">
          Deskripsi
        </label>
        <textarea id="description" name="description" defaultValue={product?.description ?? ""} className="input" rows={3} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="category">
            Kategori
          </label>
          <input
            id="category"
            name="category"
            required
            list="category-options"
            defaultValue={product?.category ?? "Frozen Food"}
            className="input"
          />
          <datalist id="category-options">
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="label" htmlFor="supplierName">
            Nama Pemasok <span className="font-normal text-lavender-400">(internal, tidak tampil di invoice)</span>
          </label>
          <input id="supplierName" name="supplierName" defaultValue={product?.supplierName ?? ""} className="input" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="buyPrice">
            Harga Beli (Rp)
          </label>
          <input
            id="buyPrice"
            name="buyPrice"
            type="number"
            min={0}
            required
            defaultValue={product?.buyPrice}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="sellPrice">
            Harga Jual (Rp)
          </label>
          <input
            id="sellPrice"
            name="sellPrice"
            type="number"
            min={0}
            required
            defaultValue={product?.sellPrice}
            className="input"
          />
        </div>
      </div>

      {state?.error && <p className="text-sm font-medium text-coral-600">{state.error}</p>}

      <div className="flex gap-3">
        <SubmitButton label={product ? "Simpan Perubahan" : "Tambah Barang"} />
        <button type="button" onClick={() => router.push("/produk")} className="btn-secondary">
          Batal
        </button>
      </div>
    </form>
  );
}
