import ProductForm from "../product-form";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <h1 className="font-heading text-2xl font-bold text-hotpink-700">Tambah Barang</h1>
      <div className="card">
        <ProductForm />
      </div>
    </div>
  );
}
