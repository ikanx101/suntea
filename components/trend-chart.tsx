"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { formatRupiah } from "@/lib/format";

type Point = { date: string; masuk: number; keluar: number };

export default function TrendChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-lavender-500">Belum ada data transaksi pada periode ini.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffe0ef" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(v: string) => v.slice(5)}
          stroke="#8258f7"
        />
        <YAxis tick={{ fontSize: 11 }} width={70} tickFormatter={(v: number) => `${Math.round(v / 1000)}rb`} stroke="#8258f7" />
        <Tooltip formatter={(value) => formatRupiah(Number(value))} labelFormatter={(v) => `Tanggal ${v}`} />
        <Legend />
        <Line type="monotone" dataKey="masuk" name="Pemasukan" stroke="#ec1580" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="keluar" name="Pengeluaran" stroke="#fc5c2e" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
