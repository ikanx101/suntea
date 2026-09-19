import { prisma } from "@/lib/prisma";
import OrderForm from "../order-form";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="font-heading text-2xl font-bold text-hotpink-700">Tambah Pesanan Baru</h1>
      {products.length === 0 ? (
        <p className="card text-lavender-500">
          Belum ada produk aktif. Tambahkan produk terlebih dahulu di menu Produk.
        </p>
      ) : (
        <div className="card">
          <OrderForm products={products} />
        </div>
      )}
    </div>
  );
}
