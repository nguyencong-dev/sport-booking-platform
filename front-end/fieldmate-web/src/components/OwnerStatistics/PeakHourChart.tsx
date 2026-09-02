import type { PeakHourStatisticsResponse } from "@/types/owner-statistics";

const days = [
  { value: 1, label: "T2" },
  { value: 2, label: "T3" },
  { value: 3, label: "T4" },
  { value: 4, label: "T5" },
  { value: 5, label: "T6" },
  { value: 6, label: "T7" },
  { value: 7, label: "CN" },
];

const hours = Array.from({ length: 24 }, (_, hour) => hour);

export function PeakHourChart({ data }: { data: PeakHourStatisticsResponse[] }) {
  if (data.length === 0) return <p className="grid h-80 place-items-center text-sm font-semibold text-slate-500">Chưa có dữ liệu khung giờ trong khoảng thời gian này.</p>;

  const values = new Map(data.map((item) => [`${item.dayOfWeek}-${item.hourOfDay}`, item.bookedHours]));
  const maximum = Math.max(...data.map((item) => item.bookedHours), 1);

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[900px] gap-1" style={{ gridTemplateColumns: "48px repeat(24, minmax(30px, 1fr))" }}>
          <span />
          {hours.map((hour) => <span key={hour} className="py-1 text-center text-[10px] font-bold text-slate-400">{hour}h</span>)}
          {days.map((day) => (
            <div key={day.value} className="contents">
              <span className="flex items-center text-xs font-extrabold text-slate-600">{day.label}</span>
              {hours.map((hour) => {
                const value = values.get(`${day.value}-${hour}`) ?? 0;
                const opacity = value === 0 ? 0 : 0.18 + (value / maximum) * 0.82;
                return <div key={hour} title={`${day.label}, ${hour}:00 - ${hour + 1}:00: ${value} giờ được đặt`} className="h-8 rounded-md border border-white" style={{ backgroundColor: value === 0 ? "#f1f5f9" : `rgba(255, 23, 79, ${opacity})` }} />;
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2 text-xs font-semibold text-slate-500">
        <span>Ít</span>
        <span className="size-4 rounded bg-slate-100" />
        <span className="size-4 rounded bg-[#ff174f]/30" />
        <span className="size-4 rounded bg-[#ff174f]/60" />
        <span className="size-4 rounded bg-[#ff174f]" />
        <span>Nhiều</span>
      </div>
    </div>
  );
}
