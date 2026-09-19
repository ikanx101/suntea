import { prisma } from "@/lib/prisma";

export async function generateInvoiceNumber(orderDate: Date): Promise<string> {
  const y = orderDate.getFullYear();
  const m = String(orderDate.getMonth() + 1).padStart(2, "0");
  const d = String(orderDate.getDate()).padStart(2, "0");
  const dateStr = `${y}${m}${d}`;

  const startOfDay = new Date(y, orderDate.getMonth(), orderDate.getDate());
  const endOfDay = new Date(y, orderDate.getMonth(), orderDate.getDate() + 1);

  const countToday = await prisma.order.count({
    where: { orderDate: { gte: startOfDay, lt: endOfDay } },
  });

  const seq = String(countToday + 1).padStart(4, "0");
  return `INV-${dateStr}-${seq}`;
}
