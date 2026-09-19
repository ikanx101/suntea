"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { changePassword, type SettingsFormState } from "@/lib/actions/settings";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? "Menyimpan..." : "Ganti Password"}
    </button>
  );
}

export default function ChangePasswordForm() {
  const [state, formAction] = useFormState<SettingsFormState, FormData>(changePassword, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="currentPassword">
          Password Saat Ini
        </label>
        <input id="currentPassword" name="currentPassword" type="password" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="newPassword">
          Password Baru
        </label>
        <input id="newPassword" name="newPassword" type="password" required minLength={6} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="confirmPassword">
          Konfirmasi Password Baru
        </label>
        <input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} className="input" />
      </div>
      {state?.error && <p className="text-sm font-medium text-coral-600">{state.error}</p>}
      {state?.success && <p className="text-sm font-medium text-mint-600">{state.success}</p>}
      <SubmitButton />
    </form>
  );
}
