import type { LucideIcon } from "lucide-react";
import { Home, Package, Receipt, Wallet, CheckSquare, BarChart3, Settings } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/produk", label: "Produk", icon: Package },
  { href: "/pesanan", label: "Pesanan", icon: Receipt },
  { href: "/keuangan", label: "Keuangan", icon: Wallet },
  { href: "/piutang", label: "Piutang", icon: CheckSquare },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/produk", label: "Produk", icon: Package },
  { href: "/pesanan", label: "Pesanan", icon: Receipt },
  { href: "/keuangan", label: "Kas", icon: Wallet },
  { href: "/piutang", label: "Piutang", icon: CheckSquare },
];
