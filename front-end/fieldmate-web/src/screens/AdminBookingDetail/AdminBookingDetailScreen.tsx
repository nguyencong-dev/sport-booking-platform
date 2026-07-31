"use client";

import axios from "axios";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
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
import { paymentService } from "@/services/payment.service";
import type {
  BookingResponse,
  BookingStatus,
} from "@/types/booking";
import type {
  PaymentResponse,
  PaymentStatus,
} from "@/types/payment";

type ApiErrorResponse = {
  message?: string;
};

const bookingStatusLabels: Record<BookingStatus, string> = {
  PENDING: "Chờ thanh toán",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn thành",
  EXPIRED: "Hết hạn",
};

const paymentStatusConfig: Record<
  PaymentStatus,
  {
    label: string;
    tone: "green" | "amber" | "red" | "slate";
  }
> = {
  PENDING: { label: "Đang chờ", tone: "amber" },
  PAID: { label: "Đã thanh toán", tone: "green" },
  FAILED: { label: "Thất bại", tone: "red" },
  REFUNDED: { label: "Đã hoàn tiền", tone: "slate" },
  EXPIRED: { label: "Hết hạn", tone: "slate" },
};

export function AdminBookingDetailScreen({
  bookingId,
}: {
  bookingId: number;
}) {
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        setError("");
        const [bookingData, paymentData] = await Promise.all([
          bookingService.getById(bookingId),
          paymentService.getByBookingId(bookingId),
        ]);
        setBooking(bookingData);
        setPayments(paymentData);
      } catch (requestError) {
        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải chi tiết booking.",
          );
        } else {
          setError("Đã xảy ra lỗi khi tải booking.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadDetail();
  }, [bookingId]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Giám sát giao dịch"
        title={`Booking #${bookingId}`}
        action={
          <Button
            nativeButton={false}
            render={<Link href="/admin/bookings" />}
            variant="outline"
            className="h-11 rounded-xl px-4 font-bold"
          >
            <ArrowLeft className="size-4" />
            Quay lại
          </Button>
        }
      />

      <AdminError message={error} />

      {loading ? (
        <section className="rounded-2xl border border-slate-200 bg-white">
          <AdminLoading />
        </section>
      ) : booking ? (
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-black text-[#073b77]">
                  {booking.venueName}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {booking.courtName}
                </p>
              </div>
              <AdminStatusBadge
                label={bookingStatusLabels[booking.status]}
                tone={
                  booking.status === "COMPLETED"
                    ? "green"
                    : booking.status === "CANCELLED"
                      ? "red"
                      : booking.status === "CONFIRMED"
                        ? "blue"
                        : booking.status === "PENDING"
                          ? "amber"
                          : "slate"
                }
              />
            </div>

            <dl className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Khách hàng", booking.customerName],
                [
                  "Thời gian",
                  `${booking.bookingDate}, ${booking.startTime} – ${booking.endTime}`,
                ],
                ["Tổng tiền", formatCurrency(booking.totalPrice)],
                [
                  "Đã thanh toán",
                  formatCurrency(booking.paidAmount),
                ],
                [
                  "Tiền đặt cọc",
                  formatCurrency(booking.requiredDeposit),
                ],
                [
                  "Còn lại",
                  formatCurrency(booking.remainingAmount),
                ],
                ["Ngày tạo", formatDateTime(booking.createdAt)],
                [
                  "Cập nhật",
                  formatDateTime(booking.updatedAt),
                ],
              ].map(([label, value]) => (
                <div key={label} className="bg-white p-5">
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {label}
                  </dt>
                  <dd className="mt-2 text-sm font-bold text-slate-700">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-black text-[#073b77]">
                Lịch sử thanh toán
              </h2>
            </div>
            {payments.length === 0 ? (
              <AdminEmpty label="Booking chưa có giao dịch thanh toán." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Mã giao dịch</th>
                      <th className="px-5 py-4">Phương thức</th>
                      <th className="px-5 py-4">Loại</th>
                      <th className="px-5 py-4">Số tiền</th>
                      <th className="px-5 py-4">Trạng thái</th>
                      <th className="px-5 py-4">Thời gian</th>
                      <th className="px-5 py-4 text-right">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((payment) => {
                      const paymentStatus =
                        paymentStatusConfig[payment.status];

                      return (
                        <tr key={payment.id}>
                          <td className="px-5 py-4 text-sm font-bold text-slate-700">
                            {payment.transactionCode || `#${payment.id}`}
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                            {payment.paymentMethod}
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                            {payment.paymentType}
                          </td>
                          <td className="px-5 py-4 text-sm font-black text-slate-700">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-5 py-4">
                            <AdminStatusBadge
                              label={paymentStatus.label}
                              tone={paymentStatus.tone}
                            />
                          </td>
                          <td className="px-5 py-4 text-sm font-medium text-slate-500">
                            {formatDateTime(
                              payment.paidAt ?? payment.createdAt,
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Button
                              nativeButton={false}
                              render={
                                <Link
                                  href={`/admin/payments/${payment.id}`}
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
        </div>
      ) : null}
    </>
  );
}
