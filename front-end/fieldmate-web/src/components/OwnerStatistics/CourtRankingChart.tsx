"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { CourtRankingMetric, CourtRankingResponse } from "@/types/owner-statistics";

function formatValue(value: number, metric: CourtRankingMetric) {
  if (metric === "REVENUE") return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
  if (metric === "BOOKED_HOURS") return `${value.toLocaleString("vi-VN")} giờ`;
  return `${value.toLocaleString("vi-VN")} lượt`;
}

export function CourtRankingChart({ data, metric }: { data: CourtRankingResponse[]; metric: CourtRankingMetric }) {
  if (data.length === 0) return <p className="grid h-80 place-items-center text-sm font-semibold text-slate-500">Chưa có dữ liệu xếp hạng sân trong khoảng thời gian này.</p>;

  const chartData = data.map((item) => ({ ...item, displayName: `${item.courtName} · ${item.venueName}` }));

  return (
    <div className="w-full" style={{ height: Math.max(280, data.length * 56) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="displayName" width={220} tick={{ fill: "#475569", fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => [formatValue(Number(value), metric), "Giá trị"]} labelFormatter={(label) => String(label)} contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} />
          <Bar dataKey="value" fill="#ff174f" radius={[0, 6, 6, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
