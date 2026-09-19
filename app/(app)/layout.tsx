import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SidebarNav from "@/components/sidebar-nav";
import BottomNav from "@/components/bottom-nav";
import Topbar from "@/components/topbar";
import ScrollToTop from "@/components/scroll-to-top";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const settings = await prisma.settings.findUnique({ where: { id: "settings" } });
  const storeName = settings?.storeName ?? "Toko Santi Irawati";
  const logoSrc = settings?.logoDataUrl ?? "/logo.png";

  return (
    <div className="flex min-h-screen">
      <ScrollToTop />
      <SidebarNav storeName={storeName} logoSrc={logoSrc} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar storeName={storeName} userName={session.user?.name ?? "Santi"} logoSrc={logoSrc} />
        <main className="flex-1 px-4 pb-24 pt-4 lg:px-8 lg:pb-8 lg:pt-6">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
