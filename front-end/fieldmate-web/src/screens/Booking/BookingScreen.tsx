"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CircleAlert,
  Clock3,
  LoaderCircle,
  MapPin,
  Volleyball,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BookingSchedulePicker,
  type BookingScheduleSelection,
} from "@/components/BookingSchedule/BookingSchedulePicker";
import { useAuth } from "@/contexts/AuthContext";
import { bookingDraftService } from "@/services/booking-draft.service";
import { courtService } from "@/services/court.service";
import { venueService } from "@/services/venue.service";
import type { CourtResponse } from "@/types/court";
import type { VenueDetailResponse } from "@/types/venue";

type BookingScreenProps = {
  venueId: number;
};

type ApiErrorResponse = {
  message?: string;
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function getToday() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - timezoneOffset)
    .toISOString()
    .split("T")[0];
}

function getDurationHours(startTime: string, endTime: string) {
  if (!startTime || !endTime) {
    return 0;
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  if (end <= start) {
    return 0;
  }

  return (end - start) / 60;
}

export function BookingScreen({
  venueId,
}: BookingScreenProps) {
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();

  const [venue, setVenue] =
    useState<VenueDetailResponse | null>(null);
  const [courts, setCourts] = useState<CourtResponse[]>([]);
  const [courtId, setCourtId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace(
        `/login?redirect=/venues/${venueId}/booking`,
      );
    }
  }, [isAuthenticated, ready, router, venueId]);

  useEffect(() => {
    if (
      !ready ||
      !isAuthenticated ||
      !Number.isInteger(venueId) ||
      venueId <= 0
    ) {
      return;
    }

    let active = true;

    async function loadBookingData() {
      try {
        setLoading(true);
        setError("");

        const [venueData, courtData] = await Promise.all([
          venueService.getById(venueId),
          courtService.getByVenueId(venueId),
        ]);

        if (!active) {
          return;
        }

        const activeCourts = courtData.filter(
          (court) => court.status === "ACTIVE",
        );

        setVenue(venueData);
        setCourts(activeCourts);

        if (activeCourts.length > 0) {
          setCourtId(String(activeCourts[0].id));
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải thông tin đặt sân.",
          );
        } else {
          setError("Không thể tải thông tin đặt sân.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadBookingData();

    return () => {
      active = false;
    };
  }, [isAuthenticated, ready, venueId]);

  const selectedCourt = useMemo(
    () =>
      courts.find((court) => court.id === Number(courtId)) ??
      null,
    [courtId, courts],
  );

  const durationHours = useMemo(
    () => getDurationHours(startTime, endTime),
    [endTime, startTime],
  );

  const estimatedTotal = selectedCourt
    ? selectedCourt.pricePerHour * durationHours
    : 0;

  const estimatedDeposit = estimatedTotal * 0.3;

  function handleScheduleSelection(
    selection: BookingScheduleSelection | null,
  ) {
    if (!selection) {
      setBookingDate("");
      setStartTime("");
      setEndTime("");
      return;
    }

    setCourtId(String(selection.courtId));
    setBookingDate(selection.bookingDate);
    setStartTime(selection.startTime);
    setEndTime(selection.endTime);
    setError("");
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedCourt) {
      setError("Vui lòng chọn sân.");
      return;
    }

    if (!bookingDate || !startTime || !endTime) {
      setError("Vui lòng nhập đầy đủ ngày và giờ đặt sân.");
      return;
    }

    if (durationHours <= 0) {
      setError("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }

    setError("");

    bookingDraftService.save({
      courtId: selectedCourt.id,
      bookingDate,
      startTime,
      endTime,
    });

    router.push("/payment");
  }

  if (!ready || (isAuthenticated && loading)) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] flex-1 items-center justify-center bg-[#f6f8fb]">
        <div className="flex items-center gap-3 font-semibold text-slate-500">
          <LoaderCircle className="size-5 animate-spin text-[#ff174f]" />
          Đang tải...
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error && !venue) {
    return (
      <main className="flex-1 bg-[#f6f8fb] px-4 py-12">
        <Alert
          variant="destructive"
          className="mx-auto max-w-2xl"
        >
          <CircleAlert />
          <AlertTitle>Không thể đặt sân</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </main>
    );
  }

  if (!venue) {
    return null;
  }

  return (
    <main className="flex-1 bg-[#f6f8fb] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-[1500px]">
        <h1 className="mb-8 text-3xl font-black tracking-[-0.04em] text-[#073b77] sm:text-4xl">
          Đặt sân
        </h1>

        <div className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="order-last rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 2xl:order-first">
            <CardHeader className="px-6 pt-7 sm:px-8">
              <CardTitle className="text-xl font-black text-[#073b77]">
                Chọn lịch đặt
              </CardTitle>
            </CardHeader>

            <CardContent className="px-6 pb-8 sm:px-8">
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <BookingSchedulePicker
                  venueId={venueId}
                  onCourtChange={(selectedCourtId) =>
                    setCourtId(String(selectedCourtId))
                  }
                  onSelectionChange={handleScheduleSelection}
                />

                <div className="hidden">
                <div>
                  <label
                    htmlFor="court"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Sân
                  </label>

                  <div className="relative">
                    <Volleyball className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                    <select
                      id="court"
                      value={courtId}
                      onChange={(event) =>
                        setCourtId(event.target.value)
                      }
                      disabled={courts.length === 0}
                      required
                      className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-12 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#073b77] focus:ring-2 focus:ring-[#073b77]/10 disabled:bg-slate-100"
                    >
                      {courts.length === 0 ? (
                        <option value="">
                          Không có sân đang hoạt động
                        </option>
                      ) : (
                        courts.map((court) => (
                          <option
                            key={court.id}
                            value={court.id}
                          >
                            {court.name} - {court.sportTypeName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="booking-date"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Ngày đặt sân
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="booking-date"
                      type="date"
                      min={getToday()}
                      value={bookingDate}
                      onChange={(event) =>
                        setBookingDate(event.target.value)
                      }
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#073b77] focus:ring-2 focus:ring-[#073b77]/10"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="start-time"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Giờ bắt đầu
                    </label>

                    <div className="relative">
                      <Clock3 className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                      <input
                        id="start-time"
                        type="time"
                        value={startTime}
                        onChange={(event) =>
                          setStartTime(event.target.value)
                        }
                        required
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#073b77] focus:ring-2 focus:ring-[#073b77]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="end-time"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Giờ kết thúc
                    </label>

                    <div className="relative">
                      <Clock3 className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                      <input
                        id="end-time"
                        type="time"
                        value={endTime}
                        onChange={(event) =>
                          setEndTime(event.target.value)
                        }
                        required
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#073b77] focus:ring-2 focus:ring-[#073b77]/10"
                      />
                    </div>
                  </div>
                </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <CircleAlert />
                    <AlertTitle>Không thể đặt sân</AlertTitle>
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={
                    courts.length === 0 ||
                    durationHours <= 0
                  }
                  className="h-12 w-full rounded-xl bg-[#ff174f] text-base font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-[#e8003e]"
                >
                  Tiếp tục thanh toán
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="order-first rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 2xl:order-last 2xl:sticky 2xl:top-24">
            {venue.banner && (
              <div className="aspect-[16/9] overflow-hidden rounded-t-3xl bg-slate-100">
                <img
                  src={venue.banner}
                  alt={venue.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <CardHeader className="px-6">
              <CardTitle className="text-xl font-black text-[#073b77]">
                {venue.name}
              </CardTitle>

              <div className="flex items-start gap-2 text-sm text-slate-500">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#ff174f]" />
                <span>{venue.address}</span>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-7">
              <Separator className="mb-5" />

              {selectedCourt ? (
                <div className="space-y-4">
                  <SummaryItem
                    label="Sân"
                    value={selectedCourt.name}
                  />

                  <SummaryItem
                    label="Bộ môn"
                    value={selectedCourt.sportTypeName}
                  />

                  <SummaryItem
                    label="Đơn giá"
                    value={`${currencyFormatter.format(
                      selectedCourt.pricePerHour,
                    )}/giờ`}
                  />

                  <SummaryItem
                    label="Thời lượng"
                    value={
                      durationHours > 0
                        ? `${durationHours} giờ`
                        : "Chưa chọn"
                    }
                  />

                  <Separator />

                  <SummaryItem
                    label="Tổng tiền"
                    value={currencyFormatter.format(
                      estimatedTotal,
                    )}
                    valueClassName="text-[#073b77]"
                  />

                  <SummaryItem
                    label="Tiền cọc 30%"
                    value={currencyFormatter.format(
                      estimatedDeposit,
                    )}
                    valueClassName="text-[#ff174f]"
                  />
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-slate-500">
                  Không có sân đang hoạt động.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

type SummaryItemProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function SummaryItem({
  label,
  value,
  valueClassName = "text-slate-800",
}: SummaryItemProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-semibold text-slate-500">
        {label}
      </span>

      <span
        className={`text-right font-black ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  );
}
