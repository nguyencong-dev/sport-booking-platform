"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  LoaderCircle,
  MapPin,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState, type ElementType } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { bookingService } from "@/services/booking.service";
import type {
  BookingResponse,
  BookingStatus,
} from "@/types/booking";

type BookingFilter = "ALL" | BookingStatus;

const filters: Array<{
  value: BookingFilter;
  label: string;
}> = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "EXPIRED", label: "Hết hạn" },
];

const statusConfig: Record<
  BookingStatus,
  {
    label: string;
    className: string;
  }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-red-50 text-red-700 ring-red-200",
  },
  EXPIRED: {
    label: "Hết hạn",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function BookingsScreen() {
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [selectedFilter, setSelectedFilter] =
    useState<BookingFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, ready, router]);

  useEffect(() => {
    if (!ready || !isAuthenticated) {
      return;
    }

    let active = true;

    async function loadBookings() {
      try {
        setLoading(true);
        setError("");

        const response = await bookingService.getMyBookings();

        if (active) {
          setBookings(response);
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 401
        ) {
          router.replace("/login");
          return;
        }

        setError("Không thể tải lịch đặt sân.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadBookings();

    return () => {
      active = false;
    };
  }, [isAuthenticated, ready, router]);

  const filteredBookings = useMemo(() => {
    if (selectedFilter === "ALL") {
      return bookings;
    }

    return bookings.filter(
      (booking) => booking.status === selectedFilter,
    );
  }, [bookings, selectedFilter]);

  if (!ready || (isAuthenticated && loading)) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] flex-1 items-center justify-center bg-[#f6f8fb]">
        <div className="flex items-center gap-3 font-semibold text-slate-500">
          <LoaderCircle className="size-5 animate-spin text-[#ff174f]" />
          Đang tải lịch đặt...
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="flex-1 bg-[#f6f8fb] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ff174f]">
              Tài khoản của tôi
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#073b77] sm:text-4xl">
              Lịch đặt sân
            </h1>
          </div>

          <div className="hidden rounded-2xl bg-white px-5 py-3 text-right shadow-sm ring-1 ring-slate-100 sm:block">
            <p className="text-xs font-semibold text-slate-500">
              Tổng lịch đặt
            </p>

            <p className="text-2xl font-black text-[#073b77]">
              {bookings.length}
            </p>
          </div>
        </div>

        <div className="mb-7 flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              variant={
                selectedFilter === filter.value ? "default" : "outline"
              }
              onClick={() => setSelectedFilter(filter.value)}
              className={
                selectedFilter === filter.value
                  ? "shrink-0 rounded-xl bg-[#ff174f] text-white hover:bg-[#e8003e]"
                  : "shrink-0 rounded-xl border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-[#ff174f]"
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {error ? (
          <Card className="rounded-3xl border-red-100 bg-white">
            <CardContent className="flex flex-col items-center py-14 text-center">
              <ReceiptText className="size-10 text-red-400" />

              <p className="mt-4 font-bold text-slate-800">
                {error}
              </p>

              <Button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 rounded-xl bg-[#ff174f] text-white hover:bg-[#e8003e]"
              >
                Thử lại
              </Button>
            </CardContent>
          </Card>
        ) : filteredBookings.length === 0 ? (
          <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
            <CardContent className="flex flex-col items-center py-16 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-rose-50">
                <CalendarDays className="size-8 text-[#ff174f]" />
              </span>

              <h2 className="mt-5 text-xl font-black text-[#073b77]">
                Chưa có lịch đặt sân
              </h2>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function BookingCard({
  booking,
}: {
  booking: BookingResponse;
}) {
  const status = statusConfig[booking.status];

  return (
    <Card className="overflow-hidden rounded-3xl border-0 bg-white py-0 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
      <div className="h-1.5 bg-[#ff174f]" />

      <CardHeader className="gap-4 px-5 pt-6 sm:flex-row sm:items-start sm:justify-between sm:px-7">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ff174f]">
            Mã lịch đặt #{booking.id}
          </p>

          <CardTitle className="mt-2 text-xl font-black text-[#073b77]">
            {booking.courtName}
          </CardTitle>

          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="size-4 shrink-0 text-[#ff174f]" />
            <span className="truncate">{booking.venueName}</span>
          </div>
        </div>

        <Badge
          className={`w-fit rounded-full px-3 py-1 font-bold ring-1 ${status.className}`}
        >
          {status.label}
        </Badge>
      </CardHeader>

      <CardContent className="px-5 pb-6 sm:px-7">
        <Separator />

        <div className="grid gap-5 py-6 sm:grid-cols-2 lg:grid-cols-4">
          <BookingInfo
            icon={CalendarDays}
            label="Ngày đặt sân"
            value={formatDate(booking.bookingDate)}
          />

          <BookingInfo
            icon={Clock3}
            label="Khung giờ"
            value={`${formatTime(booking.startTime)} - ${formatTime(
              booking.endTime,
            )}`}
          />

          <BookingInfo
            icon={WalletCards}
            label="Tổng tiền"
            value={formatCurrency(booking.totalPrice)}
          />

          <BookingInfo
            icon={ReceiptText}
            label="Còn lại"
            value={formatCurrency(booking.remainingAmount)}
          />
        </div>

        <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">
          <PriceItem
            label="Tiền cọc"
            value={booking.requiredDeposit}
          />

          <PriceItem
            label="Đã thanh toán"
            value={booking.paidAmount}
            valueClassName="text-emerald-600"
          />

          <PriceItem
            label="Chưa thanh toán"
            value={booking.remainingAmount}
            valueClassName="text-[#ff174f]"
          />
        </div>

        <Button
          nativeButton={false}
          render={<Link href={`/bookings/${booking.id}`} />}
          className="mt-5 h-11 w-full rounded-xl bg-[#073b77] font-bold text-white hover:bg-[#052f60]"
        >
          Xem chi tiết và giao dịch
        </Button>
      </CardContent>
    </Card>
  );
}

type BookingInfoProps = {
  icon: ElementType;
  label: string;
  value: string;
};

function BookingInfo({
  icon: Icon,
  label,
  value,
}: BookingInfoProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#ff174f]">
        <Icon className="size-5" />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500">
          {label}
        </p>

        <p className="mt-1 font-bold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

type PriceItemProps = {
  label: string;
  value: number;
  valueClassName?: string;
};

function PriceItem({
  label,
  value,
  valueClassName = "text-slate-800",
}: PriceItemProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500">
        {label}
      </p>

      <p className={`mt-1 font-black ${valueClassName}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}
