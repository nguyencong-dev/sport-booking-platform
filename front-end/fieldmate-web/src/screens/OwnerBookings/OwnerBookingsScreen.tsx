"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CalendarCheck2,
  CheckCircle2,
  CircleAlert,
  Eye,
  LoaderCircle,
  RefreshCcw,
  Search,
} from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { bookingService } from "@/services/booking.service";
import { paymentService } from "@/services/payment.service";
import { venueService } from "@/services/venue.service";
import type {
  BookingResponse,
  BookingStatus,
} from "@/types/booking";
import type {
  PaymentResponse,
  PaymentStatus,
} from "@/types/payment";
import type { VenueSummaryResponse } from "@/types/venue";

type ApiErrorResponse = {
  message?: string;
};

const bookingStatusConfig: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Chờ thanh toán",
    className: "bg-amber-100 text-amber-700",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    className: "bg-blue-100 text-blue-700",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-red-100 text-red-700",
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "bg-emerald-100 text-emerald-700",
  },
  EXPIRED: {
    label: "Hết hạn",
    className: "bg-slate-200 text-slate-700",
  },
};

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Đang chờ",
    className: "bg-amber-100 text-amber-700",
  },
  PAID: {
    label: "Đã thanh toán",
    className: "bg-emerald-100 text-emerald-700",
  },
  FAILED: {
    label: "Thất bại",
    className: "bg-red-100 text-red-700",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    className: "bg-violet-100 text-violet-700",
  },
  EXPIRED: {
    label: "Hết hạn",
    className: "bg-slate-200 text-slate-700",
  },
};

const paymentMethodLabels = {
  MOMO: "MoMo",
  VNPAY: "VNPay",
};

const paymentTypeLabels = {
  DEPOSIT: "Tiền cọc",
  REMAINING: "Thanh toán còn lại",
  FULL_PAYMENT: "Thanh toán toàn bộ",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN").format(
    new Date(`${value}T00:00:00`),
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}

function canCompleteBooking(booking: BookingResponse) {
  if (
    booking.status !== "CONFIRMED" ||
    booking.remainingAmount > 0
  ) {
    return false;
  }

  const endTime = new Date(
    `${booking.bookingDate}T${booking.endTime}`,
  );

  return endTime.getTime() <= Date.now();
}

export function OwnerBookingsScreen() {
  const router = useRouter();
  const { user, ready, isAuthenticated } = useAuth();
  const [venues, setVenues] = useState<VenueSummaryResponse[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(
    null,
  );
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingResponse | null>(null);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    BookingStatus | "ALL"
  >("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const filteredBookings = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "ALL" || booking.status === statusFilter;
      const matchesDate =
        !dateFilter || booking.bookingDate === dateFilter;
      const matchesSearch =
        !normalizedSearch ||
        booking.customerName.toLowerCase().includes(normalizedSearch) ||
        booking.courtName.toLowerCase().includes(normalizedSearch) ||
        String(booking.id).includes(normalizedSearch);

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [bookings, dateFilter, searchValue, statusFilter]);

  const statistics = useMemo(
    () => ({
      total: bookings.length,
      paid: bookings.reduce(
        (total, booking) => total + booking.paidAmount,
        0,
      ),
    }),
    [bookings],
  );

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login?redirect=/owner-bookings");
      return;
    }

    if (user?.role !== "COURT_OWNER") {
      router.replace("/");
      return;
    }

    let active = true;

    async function loadVenues() {
      try {
        setLoadingVenues(true);
        setError("");

        const firstPage = await venueService.getMyVenues(0);
        const remainingPages =
          firstPage.totalPages > 1
            ? await Promise.all(
                Array.from(
                  { length: firstPage.totalPages - 1 },
                  (_, index) => venueService.getMyVenues(index + 1),
                ),
              )
            : [];
        const allVenues = [
          ...firstPage.content,
          ...remainingPages.flatMap((page) => page.content),
        ];

        if (active) {
          setVenues(allVenues);
          setSelectedVenueId(allVenues[0]?.id ?? null);
        }
      } catch (requestError) {
        if (active) {
          setError(
            getErrorMessage(
              requestError,
              "Không thể tải danh sách sân.",
            ),
          );
        }
      } finally {
        if (active) {
          setLoadingVenues(false);
        }
      }
    }

    void loadVenues();

    return () => {
      active = false;
    };
  }, [isAuthenticated, ready, router, user]);

  useEffect(() => {
    if (!selectedVenueId || user?.role !== "COURT_OWNER") {
      return;
    }

    const currentVenueId = selectedVenueId;
    let active = true;

    async function loadBookings() {
      try {
        setLoadingBookings(true);
        setError("");
        setSelectedBooking(null);
        setPayments([]);

        const data =
          await bookingService.getByVenueId(currentVenueId);

        if (active) {
          setBookings(data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            getErrorMessage(
              requestError,
              "Không thể tải lịch đặt của sân.",
            ),
          );
        }
      } finally {
        if (active) {
          setLoadingBookings(false);
        }
      }
    }

    void loadBookings();

    return () => {
      active = false;
    };
  }, [selectedVenueId, user?.role]);

  async function loadBookingDetails(bookingId: number) {
    try {
      setLoadingDetails(true);
      setError("");

      const [booking, bookingPayments] = await Promise.all([
        bookingService.getById(bookingId),
        paymentService.getByBookingId(bookingId),
      ]);

      setSelectedBooking(booking);
      setPayments(bookingPayments);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Không thể tải chi tiết lịch đặt.",
        ),
      );
    } finally {
      setLoadingDetails(false);
    }
  }

  async function reloadBookings() {
    if (!selectedVenueId) {
      return;
    }

    try {
      setLoadingBookings(true);
      setError("");
      const data =
        await bookingService.getByVenueId(selectedVenueId);
      setBookings(data);

      if (selectedBooking) {
        const updatedBooking = data.find(
          (booking) => booking.id === selectedBooking.id,
        );
        setSelectedBooking(updatedBooking ?? null);
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Không thể tải lại lịch đặt.",
        ),
      );
    } finally {
      setLoadingBookings(false);
    }
  }

  async function handleComplete(booking: BookingResponse) {
    const confirmed = window.confirm(
      `Xác nhận booking #${booking.id} đã hoàn thành?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setCompletingId(booking.id);
      setError("");

      const completedBooking = await bookingService.complete(
        booking.id,
      );

      setBookings((current) =>
        current.map((item) =>
          item.id === completedBooking.id ? completedBooking : item,
        ),
      );
      setSelectedBooking((current) =>
        current?.id === completedBooking.id ? completedBooking : current,
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Không thể hoàn thành lịch đặt.",
        ),
      );
    } finally {
      setCompletingId(null);
    }
  }

  if (!ready || !user || user.role !== "COURT_OWNER") {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] flex-1 items-center justify-center bg-[#f1f5f9]">
        <LoaderCircle className="size-6 animate-spin text-[#ff174f]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex-1 bg-[#f1f5f9]">
      <section className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#ff174f]">
              Quản trị chủ sân
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#073b77]">
              Quản lý lịch đặt
            </h1>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={loadingBookings || !selectedVenueId}
            onClick={() => void reloadBookings()}
            className="h-11 rounded-xl bg-white font-bold"
          >
            <RefreshCcw
              className={`size-4 ${loadingBookings ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-white p-4">
            <CircleAlert />
            <AlertTitle>Không thể thực hiện</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loadingVenues ? (
          <div className="flex justify-center py-24">
            <LoaderCircle className="size-7 animate-spin text-[#ff174f]" />
          </div>
        ) : venues.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <CalendarCheck2 className="mx-auto size-10 text-slate-300" />
            <p className="mt-4 font-bold text-slate-600">
              Bạn chưa có sân để quản lý lịch đặt.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <StatisticCard
                icon={CalendarCheck2}
                label="Tổng lịch đặt"
                value={String(statistics.total)}
                iconClassName="bg-blue-100 text-blue-600"
              />
              <StatisticCard
                icon={Banknote}
                label="Đã thanh toán"
                value={formatCurrency(statistics.paid)}
                iconClassName="bg-emerald-100 text-emerald-600"
              />
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="grid min-w-0 gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Cụm sân
                  </span>
                  <select
                    value={selectedVenueId ?? ""}
                    onChange={(event) =>
                      setSelectedVenueId(Number(event.target.value))
                    }
                    className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-[#073b77]"
                  >
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid min-w-0 gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Ngày đặt sân
                  </span>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(event) =>
                      setDateFilter(event.target.value)
                    }
                    className="h-11 w-full min-w-0 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#073b77]"
                  />
                </label>

                <label className="grid min-w-0 gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Trạng thái
                  </span>
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value as BookingStatus | "ALL",
                      )
                    }
                    className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#073b77]"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    {Object.entries(bookingStatusConfig).map(
                      ([status, config]) => (
                        <option key={status} value={status}>
                          {config.label}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="grid min-w-0 gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tìm kiếm
                  </span>
                  <span className="relative min-w-0">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={searchValue}
                      onChange={(event) =>
                        setSearchValue(event.target.value)
                      }
                      placeholder="Mã, khách hàng, sân..."
                      className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#073b77]"
                    />
                  </span>
                </label>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="flex h-[720px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
                  <h2 className="font-extrabold text-[#073b77]">
                    Danh sách lịch đặt
                  </h2>
                  <span className="text-sm font-semibold text-slate-500">
                    {filteredBookings.length} kết quả
                  </span>
                </div>

                {loadingBookings ? (
                  <div className="flex min-h-0 flex-1 items-center justify-center">
                    <LoaderCircle className="size-7 animate-spin text-[#ff174f]" />
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
                    <CalendarCheck2 className="size-10 text-slate-300" />
                    <p className="mt-4 font-semibold text-slate-500">
                      Không có lịch đặt phù hợp.
                    </p>
                  </div>
                ) : (
                  <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
                    {filteredBookings.map((booking) => {
                      const status =
                        bookingStatusConfig[booking.status];
                      const canComplete =
                        canCompleteBooking(booking);
                      const selected =
                        selectedBooking?.id === booking.id;

                      return (
                        <article
                          key={booking.id}
                          className={`transition-colors ${
                            selected
                              ? "bg-blue-50"
                              : "bg-white hover:bg-slate-50"
                          }`}
                        >
                          <button
                            type="button"
                            disabled={loadingDetails}
                            onClick={() =>
                              void loadBookingDetails(booking.id)
                            }
                            className="w-full px-5 py-4 text-left disabled:cursor-wait"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-black text-[#073b77]">
                                    #{booking.id}
                                  </span>
                                  <Badge
                                    className={`border-0 ${status.className}`}
                                  >
                                    {status.label}
                                  </Badge>
                                </div>
                                <p className="mt-2 truncate font-bold text-slate-800">
                                  {booking.customerName}
                                </p>
                                <p className="mt-1 truncate text-xs text-slate-400">
                                  Khách hàng #{booking.customerId}
                                </p>
                              </div>
                              <Eye
                                className={`mt-1 size-4 shrink-0 ${
                                  selected
                                    ? "text-[#246bfe]"
                                    : "text-slate-400"
                                }`}
                              />
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                  Sân
                                </p>
                                <p className="mt-1 truncate text-sm font-bold text-slate-700">
                                  {booking.courtName}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                  Thời gian
                                </p>
                                <p className="mt-1 text-sm font-bold text-slate-700">
                                  {formatDate(booking.bookingDate)}
                                </p>
                                <p className="mt-0.5 text-xs font-semibold text-[#073b77]">
                                  {formatTime(booking.startTime)} –{" "}
                                  {formatTime(booking.endTime)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                  Thanh toán
                                </p>
                                <p className="mt-1 text-sm font-black text-emerald-600">
                                  {formatCurrency(booking.paidAmount)}
                                  <span className="font-semibold text-slate-400">
                                    {" "}
                                    / {formatCurrency(booking.totalPrice)}
                                  </span>
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                  Cụm sân
                                </p>
                                <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                                  {booking.venueName}
                                </p>
                              </div>
                            </div>
                          </button>

                          {canComplete && (
                            <div className="flex justify-end border-t border-slate-100 px-5 py-3">
                              <Button
                                type="button"
                                size="sm"
                                disabled={
                                  completingId === booking.id
                                }
                                onClick={() =>
                                  void handleComplete(booking)
                                }
                                className="rounded-lg bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                              >
                                {completingId === booking.id ? (
                                  <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="size-4" />
                                )}
                                Hoàn thành
                              </Button>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <BookingDetails
                booking={selectedBooking}
                payments={payments}
                loading={loadingDetails}
                completing={completingId === selectedBooking?.id}
                onComplete={handleComplete}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

type StatisticCardProps = {
  icon: typeof CalendarCheck2;
  label: string;
  value: string;
  iconClassName: string;
};

function StatisticCard({
  icon: Icon,
  label,
  value,
  iconClassName,
}: StatisticCardProps) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-xl ${iconClassName}`}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-1 truncate text-xl font-black text-[#073b77]">
          {value}
        </p>
      </div>
    </article>
  );
}

type BookingDetailsProps = {
  booking: BookingResponse | null;
  payments: PaymentResponse[];
  loading: boolean;
  completing: boolean;
  onComplete: (booking: BookingResponse) => Promise<void>;
};

function BookingDetails({
  booking,
  payments,
  loading,
  completing,
  onComplete,
}: BookingDetailsProps) {
  if (loading) {
    return (
      <div className="flex h-[720px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <LoaderCircle className="size-6 animate-spin text-[#ff174f]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex h-[720px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 text-center shadow-sm">
        <span className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-[#246bfe]">
          <Eye className="size-6" />
        </span>
        <h2 className="mt-5 text-lg font-black text-[#073b77]">
          Chọn một lịch đặt
        </h2>
        <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-slate-500">
          Nhấn vào một booking trong danh sách để xem thông tin khách
          hàng, thời gian sân và các giao dịch thanh toán.
        </p>
      </div>
    );
  }

  const bookingStatus = bookingStatusConfig[booking.status];
  const canComplete = canCompleteBooking(booking);

  return (
    <section className="flex h-[720px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="font-extrabold text-[#073b77]">
            Chi tiết booking #{booking.id}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tạo lúc {formatDateTime(booking.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`border-0 ${bookingStatus.className}`}>
            {bookingStatus.label}
          </Badge>
          {canComplete && (
            <Button
              type="button"
              disabled={completing}
              onClick={() => void onComplete(booking)}
              className="rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700"
            >
              {completing ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Hoàn thành
            </Button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem
            label="Khách hàng"
            value={booking.customerName}
          />
          <DetailItem
            label="Sân đặt"
            value={`${booking.venueName} · ${booking.courtName}`}
          />
          <DetailItem
            label="Thời gian"
            value={`${formatDate(booking.bookingDate)}, ${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`}
          />
          <DetailItem
            label="Tổng tiền"
            value={formatCurrency(booking.totalPrice)}
          />
          <DetailItem
            label="Đã thanh toán"
            value={formatCurrency(booking.paidAmount)}
          />
          <DetailItem
            label="Còn lại"
            value={formatCurrency(booking.remainingAmount)}
          />
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h3 className="font-extrabold text-[#073b77]">
              Giao dịch thanh toán
            </h3>
          </div>

          {payments.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm font-semibold text-slate-500">
              Booking chưa có giao dịch thanh toán.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map((payment) => {
                const status = paymentStatusConfig[payment.status];

                return (
                  <article
                    key={payment.id}
                    className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-slate-800">
                          #{payment.id}
                        </span>
                        <Badge
                          className={`border-0 ${status.className}`}
                        >
                          {status.label}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-600">
                        {paymentMethodLabels[payment.paymentMethod]} ·{" "}
                        {paymentTypeLabels[payment.paymentType]}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {payment.transactionCode || "Chưa có mã giao dịch"}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="font-black text-[#073b77]">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {payment.paidAt
                          ? formatDateTime(payment.paidAt)
                          : formatDateTime(payment.createdAt)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-bold text-slate-700">{value}</p>
    </div>
  );
}
