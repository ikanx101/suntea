import { prisma } from "@/lib/prisma";

export type DateRange = { from: Date; to: Date };

export function resolveRange(preset: string | undefined, fromParam?: string, toParam?: string): DateRange {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

  if (fromParam && toParam) {
    return { from: startOfDay(new Date(fromParam)), to: endOfDay(new Date(toParam)) };
  }

  if (preset === "today") {
    return { from: startOfDay(now), to: endOfDay(now) };
  }
  if (preset === "week") {
    const day = now.getDay() === 0 ? 7 : now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    return { from: startOfDay(monday), to: endOfDay(now) };
  }
  // default: month
  return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) };
}

export async function getDashboardData(range: DateRange) {
  const { from, to } = range;

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: from, lt: to } },
    orderBy: { date: "asc" },
  });

  const totalIn = transactions.filter((t) => t.type === "IN").reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((t) => t.type === "OUT").reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIn - totalOut;

  const orders = await prisma.order.findMany({
    where: { orderDate: { gte: from, lt: to } },
    include: { items: { include: { product: true } } },
  });

  const nonCancelled = orders.filter((o) => o.status !== "CANCELLED");

  const grossMargin = nonCancelled.reduce((sum, order) => {
    return (
      sum +
      order.items.reduce((s, item) => {
        const buyPrice = item.product?.buyPrice ?? 0;
        return s + (item.unitPriceSnapshot - buyPrice) * item.qty;
      }, 0)
    );
  }, 0);

  const statusCounts = {
    NEW: orders.filter((o) => o.status === "NEW").length,
    PROCESSING: orders.filter((o) => o.status === "PROCESSING").length,
    DONE: orders.filter((o) => o.status === "DONE").length,
    CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
  };

  const productSales = new Map<string, { name: string; qty: number }>();
  for (const order of nonCancelled) {
    for (const item of order.items) {
      const key = item.productId ?? item.productNameSnapshot;
      const existing = productSales.get(key);
      if (existing) {
        existing.qty += item.qty;
      } else {
        productSales.set(key, { name: item.productNameSnapshot, qty: item.qty });
      }
    }
  }
  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const dailyMap = new Map<string, { date: string; masuk: number; keluar: number }>();
  for (const t of transactions) {
    const key = t.date.toISOString().slice(0, 10);
    const entry = dailyMap.get(key) ?? { date: key, masuk: 0, keluar: 0 };
    if (t.type === "IN") entry.masuk += t.amount;
    else entry.keluar += t.amount;
    dailyMap.set(key, entry);
  }
  const trend = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  const unpaidOrders = await prisma.order.findMany({
    where: { paymentStatus: "UNPAID", status: { not: "CANCELLED" } },
  });
  const totalPiutang = unpaidOrders.reduce((s, o) => s + o.total, 0);
  const countPiutang = unpaidOrders.length;

  return {
    totalIn,
    totalOut,
    netProfit,
    grossMargin,
    statusCounts,
    topProducts,
    trend,
    totalPiutang,
    countPiutang,
  };
}
