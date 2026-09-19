"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { MOBILE_NAV_ITEMS } from "./nav-items";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-hotpink-100 bg-white/95 backdrop-blur lg:hidden">
      {MOBILE_NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition",
              active ? "text-hotpink-600" : "text-lavender-400",
            )}
          >
            <Icon size={20} className={clsx(active && "scale-110")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
