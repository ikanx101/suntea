import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import ProductActions from "./product-actions";

export const dynamic = "force-dynamic";

export default async function ProdukPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; status?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const category = searchParams.category ?? "";
  const status = searchParams.status ?? "active";

  const products = await prisma.product.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(category ? { category } : {}),
      ...(status === "active" ? { isActive: true } : status === "archived" ? { isActive: false } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="font-heading text-2xl font-bold text-hotpink-700">Produk</h1>
        <Link href="/produk/baru" className="btn-primary">
          <Plus size={18} /> Tambah Barang
        </Link>
      </div>

      <form method="get" className="card flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari nama barang..."
            className="input pl-9"
          />
        </div>
        <select name="category" defaultValue={category} className="input sm:w-48">
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category}>
              {c.category}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status} className="input sm:w-40">
          <option value="active">Aktif</option>
          <option value="archived">Diarsipkan</option>
          <option value="all">Semua</option>
        </select>
        <button type="submit" className="btn-secondary">
          Filter
        </button>
      </form>

      {products.length === 0 ? (
        <p className="card text-center text-lavender-500">Belum ada produk yang cocok.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="card flex flex-col gap-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-lg font-bold text-hotpink-800">{p.name}</h3>
                  {!p.isActive && <span className="badge bg-gray-200 text-gray-600">Arsip</span>}
                </div>
                <span className="badge mt-1 bg-lavender-100 text-lavender-700">{p.category}</span>
                {p.description && <p className="mt-2 text-sm text-lavender-500 line-clamp-2">{p.description}</p>}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-lavender-500">Beli {formatRupiah(p.buyPrice)}</span>
                <span className="font-bold text-hotpink-700">Jual {formatRupiah(p.sellPrice)}</span>
              </div>
              <ProductActions id={p.id} isActive={p.isActive} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
