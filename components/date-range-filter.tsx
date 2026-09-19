"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";

const PRESETS = [
  { value: "today", label: "Hari ini" },
  { value: "week", label: "Minggu ini" },
  { value: "month", label: "Bulan ini" },
];

export default function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activePreset = searchParams.get("from") ? null : searchParams.get("preset") ?? "month";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function applyPreset(preset: string) {
    const params = new URLSearchParams();
    params.set("preset", preset);
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyCustomRange(nextFrom: string, nextTo: string) {
    if (!nextFrom || !nextTo) return;
    const params = new URLSearchParams();
    params.set("from", nextFrom);
    params.set("to", nextTo);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1 rounded-2xl bg-lavender-50 p-1">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => applyPreset(p.value)}
            className={clsx(
              "rounded-xl px-3 py-1.5 text-sm font-semibold transition",
              activePreset === p.value ? "bg-white text-hotpink-600 shadow-sm" : "text-lavender-600",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <input
          type="date"
          defaultValue={from}
          onChange={(e) => applyCustomRange(e.target.value, to || e.target.value)}
          className="rounded-xl border-2 border-lavender-100 px-2 py-1.5"
        />
        <span className="text-lavender-400">s/d</span>
        <input
          type="date"
          defaultValue={to}
          onChange={(e) => applyCustomRange(from || e.target.value, e.target.value)}
          className="rounded-xl border-2 border-lavender-100 px-2 py-1.5"
        />
      </div>
    </div>
  );
}
