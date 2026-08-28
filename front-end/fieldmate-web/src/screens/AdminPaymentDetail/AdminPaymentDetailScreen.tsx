"use client";

import axios from "axios";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AdminError,
  AdminLoading,
  AdminPageHeader,
  AdminStatusBadge,
  formatCurrency,
  formatDateTime,
} from "@/components/Admin/AdminPage";
import { Button } from "@/components/ui/button";
import { paymentService } from "@/services/payment.service";
import type {
  PaymentResponse,
  PaymentStatus,
} from "@/types/payment";

type ApiErrorResponse = {
  message?: string;
};

const statusConfig: Record<
  PaymentStatus,
  {
    label: string;
    tone: "green" | "amber" | "red" | "slate";
  }
> = {
  PENDING: { label: "Đang chờ", tone: "amber" },
  PAID: { label: "Đã thanh toán", tone: "green" },
  FAILED: { label: "Thất bại", tone: "red" },
  EXPIRED: { label: "Hết hạn", tone: "slate" },
};

export function AdminPaymentDetailScreen({
  paymentId,
}: {
  paymentId: number;
}) {
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPayment() {
      try {
        setLoading(true);
        setError("");
        setPayment(await paymentService.getById(paymentId));
      } catch (requestError) {
        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải chi tiết thanh toán.",
          );
        } else {
          setError("Đã xảy ra lỗi khi tải thanh toán.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadPayment();
  }, [paymentId]);

  const status = payment ? statusConfig[payment.status] : null;

  return (
    <>
      <AdminPageHeader
        eyebrow="Giám sát giao dịch"
        title={`Thanh toán #${paymentId}`}
        action={
          <Button
            nativeButton={false}
            render={
              <Link
                href={
                  payment
                    ? `/admin/bookings/${payment.bookingId}`
                    : "/admin/bookings"
                }
              />
            }
            variant="outline"
            className="h-11 rounded-xl px-4 font-bold"
          >
            <ArrowLeft className="size-4" />
            Quay lại booking
          </Button>
        }
      />

      <AdminError message={error} />

      {loading ? (
        <section className="rounded-2xl border border-slate-200 bg-white">
          <AdminLoading />
        </section>
      ) : payment && status ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6">
            <div>
              <h2 className="text-xl font-black text-[#073b77]">
                {payment.transactionCode || `#${payment.id}`}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Booking #{payment.bookingId}
              </p>
            </div>
            <AdminStatusBadge
              label={status.label}
              tone={status.tone}
            />
          </div>

          <dl className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ["Số tiền", formatCurrency(payment.amount)],
              ["Phương thức", payment.paymentMethod],
              ["Loại thanh toán", payment.paymentType],
              ["Ngày tạo", formatDateTime(payment.createdAt)],
              ["Ngày thanh toán", formatDateTime(payment.paidAt)],
            ].map(([label, value]) => (
              <div key={label} className="bg-white p-5">
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </dt>
                <dd className="mt-2 font-bold text-slate-700">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </>
  );
}
