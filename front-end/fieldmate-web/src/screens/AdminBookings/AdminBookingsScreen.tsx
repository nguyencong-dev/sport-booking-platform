"use client";

import axios from "axios";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminPageHeader,
  AdminStatusBadge,
  formatCurrency,
  formatDateTime,
} from "@/components/Admin/AdminPage";
import { Button } from "@/components/ui/button";
import { bookingService } from "@/services/booking.service";
import type {
  BookingResponse,
  BookingStatus,
} from "@/types/booking";

type ApiErrorResponse = {
  message?: string;
};

const statusConfig: Record<
  BookingStatus,
  {
    label: string;
    tone: "green" | "amber" | "red" | "blue" | "slate";
  }
> = {
  PENDING: { label: "Chờ thanh toán", tone: "amber" },
  CONFIRMED: { label: "Đã xác nhận", tone: "blue" },
  CANCELLED: { label: "Đã hủy", tone: "red" },
  COMPLETED: { label: "Hoàn thành", tone: "green" },
  EXPIRED: { label: "Hết hạn", tone: "slate" },
};

export function AdminBookingsScreen() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(0);
      setSearch(searchInput.trim());
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      try {
        setLoading(true);
        setError("");

        const pageData = await bookingService.getAll({
          search,
          status: status === "ALL" ? undefined : status,
          page,
        });

        if (!active) {
          return;
        }

        if (pageData.totalPages > 0 && page >= pageData.totalPages) {
          setPage(pageData.totalPages - 1);
          return;
        }

        setBookings(pageData.content);
        setTotalPages(pageData.totalPages);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải danh sách booking.",
          );
        } else {
          setError("Đã xảy ra lỗi khi tải booking.");
        }
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
  }, [page, search, status]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Giám sát giao dịch"
        title="Lịch đặt sân"
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Mã, khách hàng, sân..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium outline-none focus:border-[#ff174f] focus:ring-3 focus:ring-rose-100"
              />
            </div>
            <select
              value={status}
              onChange={(event) => {
                setPage(0);
                setStatus(event.target.value as BookingStatus | "ALL");
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 outline-none focus:border-[#ff174f]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(statusConfig).map(
                ([statusValue, config]) => (
                  <option key={statusValue} value={statusValue}>
                    {config.label}
                  </option>
                ),
              )}
            </select>
          </div>
        }
      />

      <AdminError message={error} />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <AdminLoading />
        ) : bookings.length === 0 ? (
          <AdminEmpty label="Không tìm thấy booking phù hợp." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Booking</th>
                  <th className="px-5 py-4">Khách hàng</th>
                  <th className="px-5 py-4">Sân</th>
                  <th className="px-5 py-4">Thời gian</th>
                  <th className="px-5 py-4">Tổng tiền</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => {
                  const bookingStatus = statusConfig[booking.status];

                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="font-black text-[#073b77]">
                          #{booking.id}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-400">
                          {formatDateTime(booking.createdAt)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-700">
                        {booking.customerName}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-700">
                          {booking.venueName}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-400">
                          {booking.courtName}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-600">
                        <p>{booking.bookingDate}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {booking.startTime} – {booking.endTime}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm font-black text-slate-700">
                        {formatCurrency(booking.totalPrice)}
                      </td>
                      <td className="px-5 py-4">
                        <AdminStatusBadge
                          label={bookingStatus.label}
                          tone={bookingStatus.tone}
                        />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          nativeButton={false}
                          render={
                            <Link
                              href={`/admin/bookings/${booking.id}`}
                            />
                          }
                          variant="outline"
                          className="h-9 rounded-lg"
                        >
                          <Eye className="size-4" />
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {!loading && totalPages > 1 && (
        <nav
          aria-label="Phân trang booking"
          className="mt-6 flex items-center justify-center gap-2"
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={page === 0}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-xl bg-white"
          >
            <ChevronLeft />
          </Button>

          <span className="px-3 text-sm font-bold text-[#073b77]">
            {page + 1}/{totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-xl bg-white"
          >
            <ChevronRight />
          </Button>
        </nav>
      )}
    </>
  );
}
