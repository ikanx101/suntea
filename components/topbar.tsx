"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, MoreHorizontal, BarChart3, Settings } from "lucide-react";

export default function Topbar({
  storeName,
  userName,
  logoSrc,
}: {
  storeName: string;
  userName: string;
  logoSrc: string;
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hotpink-100 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex items-center gap-2 lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt={storeName} className="h-8 w-8 rounded-xl object-cover" />
        <p className="font-heading text-lg font-bold text-hotpink-600">{storeName}</p>
      </div>
      <div className="hidden text-sm text-lavender-600 lg:block">Halo, {userName} 👋</div>

      <div className="flex items-center gap-2">
        <div className="relative lg:hidden">
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className="btn-ghost"
            aria-label="Menu lainnya"
          >
            <MoreHorizontal size={20} />
          </button>
          {moreOpen && (
            <div className="absolute right-0 top-11 w-44 rounded-2xl border border-hotpink-100 bg-white p-2 shadow-lg">
              <Link
                href="/laporan"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-lavender-700 hover:bg-hotpink-50"
                onClick={() => setMoreOpen(false)}
              >
                <BarChart3 size={16} /> Laporan
              </Link>
              <Link
                href="/pengaturan"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-lavender-700 hover:bg-hotpink-50"
                onClick={() => setMoreOpen(false)}
              >
                <Settings size={16} /> Pengaturan
              </Link>
            </div>
          )}
        </div>
        <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="btn-ghost">
          <LogOut size={18} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
