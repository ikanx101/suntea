import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <h1 className="font-heading text-2xl font-bold text-hotpink-700">Edit Barang</h1>
      <div className="card">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
