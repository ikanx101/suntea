"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, ArchiveRestore, Archive } from "lucide-react";
import Link from "next/link";
import { toggleProductActive } from "@/lib/actions/products";

export default function ProductActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <Link href={`/produk/${id}`} className="btn-ghost !px-3 !py-1.5 text-sm">
        <Pencil size={14} /> Edit
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await toggleProductActive(id, !isActive);
            router.refresh();
          })
        }
        className="btn-ghost !px-3 !py-1.5 text-sm"
      >
        {isActive ? (
          <>
            <Archive size={14} /> Arsipkan
          </>
        ) : (
          <>
            <ArchiveRestore size={14} /> Aktifkan
          </>
        )}
      </button>
    </div>
  );
}
