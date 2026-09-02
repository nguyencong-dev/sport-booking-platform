"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { BookingStatisticsResponse, StatisticsGranularity } from "@/types/owner-statistics";

type BookingChartProps = {
  data: BookingStatisticsResponse[];
  granularity: StatisticsGranularity;
};

function formatPeriod(value: string, granularity: StatisticsGranularity) {
  const date = new Date(`${value}T00:00:00`);
  if (granularity === "MONTH") return new Intl.DateTimeFormat("vi-VN", { month: "2-digit", year: "numeric" }).format(date);
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(date);
}

export function BookingChart({ data, granularity }: BookingChartProps) {
  if (data.length === 0) return <p className="grid h-80 place-items-center text-sm font-semibold text-slate-500">Chưa có lượt đặt trong khoảng thời gian này.</p>;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="periodStart" tickFormatter={(value) => formatPeriod(String(value), granularity)} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
          <Tooltip labelFormatter={(value) => formatPeriod(String(value), granularity)} formatter={(value) => [Number(value), "Lượt đặt"]} contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} />
          <Bar dataKey="bookingCount" fill="#073b77" radius={[6, 6, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
