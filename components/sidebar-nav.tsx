"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_ITEMS } from "./nav-items";

export default function SidebarNav({ storeName, logoSrc }: { storeName: string; logoSrc: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-hotpink-100 bg-white/70 p-5 lg:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt={storeName} className="h-10 w-10 rounded-2xl object-cover shadow-sm" />
        <div>
          <p className="font-heading text-lg font-bold leading-tight text-hotpink-600">{storeName}</p>
          <p className="text-xs text-lavender-500">Panel manajemen toko</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-2xl px-4 py-2.5 font-medium transition",
                active
                  ? "bg-gradient-to-r from-hotpink-500 to-coral-400 text-white shadow-md"
                  : "text-lavender-700 hover:bg-hotpink-50",
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
