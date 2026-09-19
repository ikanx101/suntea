"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { updateStoreSettings, removeStoreLogo, type SettingsFormState } from "@/lib/actions/settings";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? "Menyimpan..." : "Simpan Pengaturan"}
    </button>
  );
}

export default function StoreSettingsForm({
  storeName,
  logoDataUrl,
}: {
  storeName: string;
  logoDataUrl: string | null;
}) {
  const [state, formAction] = useFormState<SettingsFormState, FormData>(updateStoreSettings, {});
  const [preview, setPreview] = useState<string | null>(logoDataUrl);
  const [removing, setRemoving] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="storeName">
          Nama Toko
        </label>
        <input id="storeName" name="storeName" defaultValue={storeName} required className="input" />
      </div>

      <div>
        <label className="label" htmlFor="logo">
          Logo Toko
        </label>
        <div className="flex items-center gap-4">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Logo" className="h-16 w-16 rounded-2xl object-cover shadow-sm" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lavender-100 text-xs text-lavender-400">
              Tanpa logo
            </div>
          )}
          <div className="flex-1 space-y-2">
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setPreview(reader.result as string);
                reader.readAsDataURL(file);
              }}
              className="text-sm text-lavender-600"
            />
            {logoDataUrl && (
              <button
                type="button"
                disabled={removing}
                onClick={async () => {
                  setRemoving(true);
                  await removeStoreLogo();
                  setPreview(null);
                  setRemoving(false);
                }}
                className="text-xs font-semibold text-coral-500 underline"
              >
                Hapus logo saat ini
              </button>
            )}
          </div>
        </div>
        <p className="mt-1 text-xs text-lavender-400">Maksimal 1.5MB. Logo ini juga dipakai di invoice.</p>
      </div>

      {state?.error && <p className="text-sm font-medium text-coral-600">{state.error}</p>}
      {state?.success && <p className="text-sm font-medium text-mint-600">{state.success}</p>}

      <SubmitButton />
    </form>
  );
}
