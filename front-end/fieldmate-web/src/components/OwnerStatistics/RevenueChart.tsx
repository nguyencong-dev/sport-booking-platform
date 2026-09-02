"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { RevenueStatisticsResponse, StatisticsGranularity } from "@/types/owner-statistics";

type RevenueChartProps = {
  data: RevenueStatisticsResponse[];
  granularity: StatisticsGranularity;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatPeriod(value: string, granularity: StatisticsGranularity) {
  const date = new Date(`${value}T00:00:00`);
  if (granularity === "MONTH") return new Intl.DateTimeFormat("vi-VN", { month: "2-digit", year: "numeric" }).format(date);
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(date);
}

export function RevenueChart({ data, granularity }: RevenueChartProps) {
  if (data.length === 0) return <p className="grid h-80 place-items-center text-sm font-semibold text-slate-500">Chưa có doanh thu trong khoảng thời gian này.</p>;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff174f" stopOpacity={0.32} />
              <stop offset="95%" stopColor="#ff174f" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="periodStart" tickFormatter={(value) => formatPeriod(String(value), granularity)} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(value) => formatCompactCurrency(Number(value))} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} width={58} />
          <Tooltip labelFormatter={(value) => formatPeriod(String(value), granularity)} formatter={(value) => [formatCurrency(Number(value)), "Doanh thu"]} contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} />
          <Area type="monotone" dataKey="revenue" stroke="#ff174f" strokeWidth={3} fill="url(#revenueColor)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
