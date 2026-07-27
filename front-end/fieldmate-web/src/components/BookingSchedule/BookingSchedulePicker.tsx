"use client";

import axios from "axios";
import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Moon,
  RefreshCcw,
  Sun,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { venueService } from "@/services/venue.service";
import type {
  BookedPeriodResponse,
  VenueBookingScheduleResponse,
} from "@/types/booking";

export type BookingScheduleSelection = {
  courtId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
};

type BookingSchedulePickerProps = {
  venueId: number;
  disabled?: boolean;
  onCourtChange?: (courtId: number) => void;
  onSelectionChange: (
    selection: BookingScheduleSelection | null,
  ) => void;
};

type Shift = "morning" | "afternoon";

type ApiErrorResponse = {
  message?: string;
};

const SLOT_MINUTES = 30;
const MORNING_SLOTS = Array.from(
  { length: 24 },
  (_, index) => index * SLOT_MINUTES,
);
const AFTERNOON_SLOTS = Array.from(
  { length: 24 },
  (_, index) => 12 * 60 + index * SLOT_MINUTES,
);

function toMinutes(time: string) {
  const [hour, minute] = time.slice(0, 5).split(":").map(Number);

  return hour * 60 + minute;
}

function toTime(totalMinutes: number) {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function isBooked(
  periods: BookedPeriodResponse[],
  slotStart: number,
) {
  const slotEnd = slotStart + SLOT_MINUTES;

  return periods.some((period) => {
    const periodStart = toMinutes(period.startTime);
    const periodEnd = toMinutes(period.endTime);

    return periodStart < slotEnd && periodEnd > slotStart;
  });
}

function isPastSlot(date: Date, slotStartMinutes: number) {
  const slotStart = new Date(date);

  slotStart.setHours(
    Math.floor(slotStartMinutes / 60),
    slotStartMinutes % 60,
    0,
    0,
  );

  return slotStart.getTime() < Date.now();
}

function formatDayLabel(date: Date) {
  const label = format(date, "EEEE", { locale: vi });

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function BookingSchedulePicker({
  venueId,
  disabled = false,
  onCourtChange,
  onSelectionChange,
}: BookingSchedulePickerProps) {
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(today, { weekStartsOn: 1 }),
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [shift, setShift] = useState<Shift>("afternoon");
  const [schedule, setSchedule] =
    useState<VenueBookingScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCourtId, setActiveCourtId] = useState<
    number | null
  >(null);
  const [selectedStartMinute, setSelectedStartMinute] = useState<
    number | null
  >(null);
  const [selectedEndMinute, setSelectedEndMinute] = useState<
    number | null
  >(null);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );
  const slots =
    shift === "morning" ? MORNING_SLOTS : AFTERNOON_SLOTS;
  const activeCourt =
    schedule?.courts.find(
      (court) => court.courtId === activeCourtId,
    ) ?? null;

  useEffect(() => {
    let active = true;
    const date = format(selectedDate, "yyyy-MM-dd");

    async function loadSchedule() {
      try {
        setLoading(true);
        setError("");

        const data = await venueService.getBookingSchedule(
          venueId,
          date,
        );

        if (active) {
          setSchedule(data);
          setActiveCourtId((current) =>
            data.courts.some((court) => court.courtId === current)
              ? current
              : data.courts[0]?.courtId ?? null,
          );
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải lịch sân.",
          );
        } else {
          setError("Không thể tải lịch sân.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSchedule();

    return () => {
      active = false;
    };
  }, [selectedDate, venueId]);

  function clearSelection() {
    setSelectedStartMinute(null);
    setSelectedEndMinute(null);
    onSelectionChange(null);
  }

  function selectDate(date: Date) {
    setSelectedDate(date);
    clearSelection();
  }

  function changeWeek(offset: number) {
    const nextWeek = addWeeks(weekStart, offset);

    setWeekStart(nextWeek);
    setSelectedDate(nextWeek);
    clearSelection();
  }

  function goToToday() {
    const now = new Date();

    setWeekStart(startOfWeek(now, { weekStartsOn: 1 }));
    setSelectedDate(now);
    clearSelection();
  }

  function changeShift(nextShift: Shift) {
    setShift(nextShift);
    clearSelection();
  }

  function changeCourt(courtId: number) {
    setActiveCourtId(courtId);
    onCourtChange?.(courtId);
    clearSelection();
  }

  function selectSlot(
    courtId: number,
    slotStart: number,
    periods: BookedPeriodResponse[],
  ) {
    if (
      disabled ||
      slotStart + SLOT_MINUTES >= 24 * 60 ||
      isPastSlot(selectedDate, slotStart) ||
      isBooked(periods, slotStart)
    ) {
      return;
    }

    let startMinute = slotStart;
    let endMinute = slotStart + SLOT_MINUTES;

    if (
      activeCourtId === courtId &&
      selectedStartMinute !== null &&
      selectedEndMinute !== null
    ) {
      if (slotStart === selectedEndMinute) {
        const rangeIsAvailable = !periods.some(
          (period) =>
            toMinutes(period.startTime) <
              slotStart + SLOT_MINUTES &&
            toMinutes(period.endTime) > slotStart,
        );

        if (rangeIsAvailable) {
          startMinute = selectedStartMinute;
          endMinute = slotStart + SLOT_MINUTES;
        }
      } else if (
        slotStart + SLOT_MINUTES === selectedStartMinute
      ) {
        startMinute = slotStart;
        endMinute = selectedEndMinute;
      }
    }

    setSelectedStartMinute(startMinute);
    setSelectedEndMinute(endMinute);
    onSelectionChange({
      courtId,
      bookingDate: format(selectedDate, "yyyy-MM-dd"),
      startTime: toTime(startMinute),
      endTime: toTime(endMinute),
    });
  }

  function getSlotState(
    courtId: number,
    periods: BookedPeriodResponse[],
    slotStart: number,
  ) {
    if (
      slotStart + SLOT_MINUTES >= 24 * 60 ||
      isPastSlot(selectedDate, slotStart)
    ) {
      return "locked";
    }

    if (isBooked(periods, slotStart)) {
      return "booked";
    }

    if (
      activeCourtId === courtId &&
      selectedStartMinute !== null &&
      selectedEndMinute !== null &&
      slotStart >= selectedStartMinute &&
      slotStart < selectedEndMinute
    ) {
      return "selected";
    }

    return "available";
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => changeWeek(-1)}
            className="rounded-r-none border-r-0"
            aria-label="Tuần trước"
          >
            <ChevronLeft />
          </Button>
          <div className="flex h-9 min-w-32 items-center justify-center border-y border-slate-200 px-3 text-sm font-bold text-slate-800">
            {format(weekStart, "dd/MM")} –{" "}
            {format(addDays(weekStart, 6), "dd/MM")}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => changeWeek(1)}
            className="rounded-l-none"
            aria-label="Tuần sau"
          >
            <ChevronRight />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-slate-700">
          <Legend color="bg-[#edf1ff] ring-1 ring-blue-400" label="Giờ trống" />
          <Legend color="bg-slate-400" label="Đã khóa" />
          <Legend color="bg-red-500" label="Đã đặt" />
          <Legend color="bg-[#246bfe]" label="Đang chọn" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={goToToday}
            className="rounded-xl"
          >
            <RefreshCcw />
            Hôm nay
          </Button>
          <Button
            type="button"
            variant={shift === "morning" ? "default" : "secondary"}
            onClick={() => changeShift("morning")}
            className={
              shift === "morning"
                ? "rounded-xl bg-[#073b77] text-white hover:bg-[#052e5d]"
                : "rounded-xl"
            }
          >
            <Sun />
            Ca sáng
          </Button>
          <Button
            type="button"
            variant={shift === "afternoon" ? "default" : "outline"}
            onClick={() => changeShift("afternoon")}
            className={
              shift === "afternoon"
                ? "rounded-xl bg-[#246bfe] text-white hover:bg-[#1756d5]"
                : "rounded-xl border-blue-500 text-blue-600"
            }
          >
            <Moon />
            Ca chiều
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <div className="min-w-[1320px] p-4">
            <div className="mb-4 flex items-center gap-3">
              <label
                htmlFor="booking-court"
                className="text-sm font-black text-slate-700"
              >
                Chọn sân
              </label>
              <select
                id="booking-court"
                value={activeCourtId ?? ""}
                disabled={disabled || loading || !schedule?.courts.length}
                onChange={(event) =>
                  changeCourt(Number(event.target.value))
                }
                className="h-11 min-w-64 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none focus:border-[#246bfe] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              >
                {schedule?.courts.length ? (
                  schedule.courts.map((court) => (
                    <option key={court.courtId} value={court.courtId}>
                      {court.courtName}
                    </option>
                  ))
                ) : (
                  <option value="">Không có sân đang hoạt động</option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-7 border-b border-blue-200">
              {days.map((day) => {
                const active = isSameDay(day, selectedDate);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => selectDate(day)}
                    className={`rounded-t-2xl px-4 py-3 text-base font-black transition ${
                      active
                        ? "bg-blue-100 text-[#246bfe]"
                        : "text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {formatDayLabel(day)}
                    <span className="ml-2 text-sm font-bold opacity-70">
                      {format(day, "dd/MM")}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1">
              {slots.map((slotStart) => (
                <div
                  key={slotStart}
                  className="pb-2 text-center text-xs font-bold text-slate-700"
                >
                  {toTime(slotStart)}
                </div>
              ))}

              {loading ? (
                <div className="col-span-24 flex min-h-32 items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                  <LoaderCircle className="size-5 animate-spin text-[#246bfe]" />
                  Đang tải lịch sân...
                </div>
              ) : error ? (
                <div className="col-span-24 flex min-h-32 items-center justify-center text-sm font-semibold text-red-600">
                  {error}
                </div>
              ) : activeCourt ? (
                slots.map((slotStart) => {
                  const state = getSlotState(
                    activeCourt.courtId,
                    activeCourt.bookedPeriods,
                    slotStart,
                  );

                  return (
                    <button
                      key={`${activeCourt.courtId}-${slotStart}`}
                      type="button"
                      disabled={
                        disabled ||
                        state === "locked" ||
                        state === "booked"
                      }
                      onClick={() =>
                        selectSlot(
                          activeCourt.courtId,
                          slotStart,
                          activeCourt.bookedPeriods,
                        )
                      }
                      title={`${activeCourt.courtName}: ${toTime(slotStart)}–${toTime(slotStart + SLOT_MINUTES)}`}
                      className={`h-16 rounded-xl transition ${
                        state === "locked"
                          ? "cursor-not-allowed bg-slate-400"
                          : state === "booked"
                            ? "cursor-not-allowed bg-red-500"
                            : state === "selected"
                              ? "bg-[#246bfe] shadow-sm ring-2 ring-blue-300"
                              : "bg-[#edf1ff] ring-1 ring-inset ring-blue-100 hover:bg-blue-100"
                      }`}
                      aria-label={`${activeCourt.courtName}, ${toTime(slotStart)} đến ${toTime(slotStart + SLOT_MINUTES)}, ${state}`}
                    />
                  );
                })
              ) : (
                <div className="col-span-24 flex min-h-32 items-center justify-center text-sm font-semibold text-slate-500">
                  Không có sân đang hoạt động.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <span className={`size-4 rounded ${color}`} />
      {label}
    </span>
  );
}
