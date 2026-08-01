"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CircleAlert,
  CircleCheck,
  Clock3,
  LoaderCircle,
  MapPin,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
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
import { paymentService } from "@/services/payment.service";
import type {
  BookingResponse,
  BookingStatus,
} from "@/types/booking";
import type {
  PaymentMethod,
  PaymentResponse,
  PaymentStatus,
  PaymentType,
} from "@/types/payment";

type PaymentReturnContext = {
  gateway: "momo" | "vnpay";
  paymentId: number;
};

type BookingDetailScreenProps = {
  bookingId: number;
  paymentReturn?: PaymentReturnContext | null;
};

type ApiErrorResponse = {
  message?: string;
};

const paymentMethods: Array<{
  value: PaymentMethod;
  label: string;
  imageUrl: string;
}> = [
  {
    value: "VNPAY",
    label: "VNPay",
    imageUrl:
      "https://res.cloudinary.com/dxek6c0tg/image/upload/v1785050409/vnpay-logo-vinadesign-25-12-57-55_t91pn4.jpg",
  },
  {
    value: "MOMO",
    label: "MoMo",
    imageUrl:
      "https://res.cloudinary.com/dxek6c0tg/image/upload/v1785050409/Logo-MoMo-Square_lifnyz.webp",
  },
];

const bookingStatusConfig: Record<
  BookingStatus,
  { label: string; className: string }
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

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Chờ thanh toán",
    className: "bg-amber-50 text-amber-700",
  },
  PAID: {
    label: "Đã thanh toán",
    className: "bg-emerald-50 text-emerald-700",
  },
  FAILED: {
    label: "Thất bại",
    className: "bg-red-50 text-red-700",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    className: "bg-blue-50 text-blue-700",
  },
  EXPIRED: {
    label: "Hết hạn",
    className: "bg-slate-100 text-slate-600",
  },
};

const paymentTypeLabels: Record<PaymentType, string> = {
  DEPOSIT: "Thanh toán cọc",
  REMAINING: "Thanh toán còn lại",
  FULL_PAYMENT: "Thanh toán toàn bộ",
};

const PAYMENT_RETURN_POLL_INTERVAL = 1_500;
const PAYMENT_RETURN_MAX_ATTEMPTS = 10;

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function BookingDetailScreen({
  bookingId,
  paymentReturn = null,
}: BookingDetailScreenProps) {
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();

  const [booking, setBooking] =
    useState<BookingResponse | null>(null);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("VNPAY");
  const [paymentType, setPaymentType] =
    useState<PaymentType>("DEPOSIT");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [checkingReturnedPayment, setCheckingReturnedPayment] =
    useState(false);
  const [returnedPaymentStatus, setReturnedPaymentStatus] =
    useState<PaymentStatus | null>(null);
  const [returnedPaymentError, setReturnedPaymentError] =
    useState("");

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace(`/login?redirect=/bookings/${bookingId}`);
    }
  }, [bookingId, isAuthenticated, ready, router]);

  useEffect(() => {
    if (
      !ready ||
      !isAuthenticated ||
      !paymentReturn ||
      !Number.isInteger(bookingId) ||
      bookingId <= 0
    ) {
      return;
    }

    const currentPaymentReturn = paymentReturn;
    let active = true;
    let timeoutId: number | undefined;

    async function pollReturnedPayment(attempt: number) {
      try {
        setCheckingReturnedPayment(true);
        setReturnedPaymentError("");

        const returnedPayment = await paymentService.getById(
          currentPaymentReturn.paymentId,
        );

        if (!active) {
          return;
        }

        if (returnedPayment.bookingId !== bookingId) {
          setReturnedPaymentError(
            "Giao dịch thanh toán không thuộc lịch đặt này.",
          );
          setCheckingReturnedPayment(false);
          return;
        }

        const [bookingData, paymentData] = await Promise.all([
          bookingService.getById(bookingId),
          paymentService.getByBookingId(bookingId),
        ]);

        if (!active) {
          return;
        }

        setBooking(bookingData);
        setPayments(paymentData);
        setReturnedPaymentStatus(returnedPayment.status);
        setPaymentType(
          bookingData.paidAmount < bookingData.requiredDeposit
            ? "DEPOSIT"
            : "REMAINING",
        );

        if (
          returnedPayment.status === "PENDING" &&
          attempt < PAYMENT_RETURN_MAX_ATTEMPTS - 1
        ) {
          timeoutId = window.setTimeout(
            () => void pollReturnedPayment(attempt + 1),
            PAYMENT_RETURN_POLL_INTERVAL,
          );
          return;
        }

        setCheckingReturnedPayment(false);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setReturnedPaymentError(
            requestError.response?.data?.message ??
              "Không thể kiểm tra kết quả thanh toán.",
          );
        } else {
          setReturnedPaymentError(
            "Không thể kiểm tra kết quả thanh toán.",
          );
        }

        setCheckingReturnedPayment(false);
      }
    }

    void pollReturnedPayment(0);

    return () => {
      active = false;

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [bookingId, isAuthenticated, paymentReturn, ready]);

  useEffect(() => {
    if (
      !ready ||
      !isAuthenticated ||
      !Number.isInteger(bookingId) ||
      bookingId <= 0
    ) {
      return;
    }

    let active = true;

    async function loadBookingDetail() {
      try {
        setLoading(true);
        setError("");

        const [bookingData, paymentData] = await Promise.all([
          bookingService.getById(bookingId),
          paymentService.getByBookingId(bookingId),
        ]);

        if (active) {
          setBooking(bookingData);
          setPayments(paymentData);
          setPaymentType(
            bookingData.paidAmount <
              bookingData.requiredDeposit
              ? "DEPOSIT"
              : "REMAINING",
          );
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 401
        ) {
          router.replace(`/login?redirect=/bookings/${bookingId}`);
          return;
        }

        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải chi tiết lịch đặt.",
          );
        } else {
          setError("Không thể tải chi tiết lịch đặt.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadBookingDetail();

    return () => {
      active = false;
    };
  }, [bookingId, isAuthenticated, ready, router]);

  const canContinuePayment =
    booking !== null &&
    booking.remainingAmount > 0 &&
    (booking.status === "PENDING" ||
      booking.status === "CONFIRMED");

  const availablePaymentTypes = useMemo(() => {
    if (!booking) {
      return [];
    }

    if (booking.paidAmount < booking.requiredDeposit) {
      return [
        {
          value: "DEPOSIT" as PaymentType,
          label: "Thanh toán cọc",
          amount:
            booking.requiredDeposit - booking.paidAmount,
        },
        {
          value: "FULL_PAYMENT" as PaymentType,
          label: "Thanh toán toàn bộ",
          amount: booking.remainingAmount,
        },
      ];
    }

    return [
      {
        value: "REMAINING" as PaymentType,
        label: "Thanh toán số tiền còn lại",
        amount: booking.remainingAmount,
      },
    ];
  }, [booking]);

  const selectedPaymentAmount =
    availablePaymentTypes.find(
      (type) => type.value === paymentType,
    )?.amount ?? booking?.remainingAmount ?? 0;

  async function handleContinuePayment() {
    if (!booking || !canContinuePayment) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payment = await paymentService.create(booking.id, {
        paymentMethod,
        paymentType,
      });

      const paymentUrl =
        payment.checkoutUrl ??
        payment.deeplink ??
        payment.qrCodeUrl;

      if (!paymentUrl) {
        setError("BE không trả về đường dẫn thanh toán.");
        return;
      }

      window.location.assign(paymentUrl);
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể tiếp tục thanh toán.",
        );
      } else {
        setError("Không thể tiếp tục thanh toán.");
      }
    } finally {
      setSubmitting(false);
    }
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

  if (!booking) {
    return (
      <main className="flex-1 bg-[#f6f8fb] px-4 py-12">
        <Alert
          variant="destructive"
          className="mx-auto max-w-2xl"
        >
          <CircleAlert />
          <AlertTitle>Không thể hiển thị lịch đặt</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </main>
    );
  }

  const status = bookingStatusConfig[booking.status];

  return (
    <main className="flex-1 bg-[#f6f8fb] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-black tracking-[-0.04em] text-[#073b77] sm:text-4xl">
            Chi tiết lịch đặt
          </h1>

          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/bookings" />}
            className="rounded-xl"
          >
            Quay lại
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <CircleAlert />
            <AlertTitle>Không thể xử lý</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {paymentReturn && returnedPaymentError && (
          <Alert variant="destructive" className="mb-6">
            <CircleAlert />
            <AlertTitle>
              Không thể kiểm tra thanh toán
            </AlertTitle>
            <AlertDescription>
              {returnedPaymentError}
            </AlertDescription>
          </Alert>
        )}

        {paymentReturn && checkingReturnedPayment && (
          <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
            <LoaderCircle className="animate-spin" />
            <AlertTitle>Đang xác nhận thanh toán</AlertTitle>
            <AlertDescription>
              FieldMate đang chờ kết quả chính thức từ{" "}
              {paymentReturn.gateway === "momo"
                ? "MoMo"
                : "VNPay"}
              .
            </AlertDescription>
          </Alert>
        )}

        {paymentReturn &&
          !checkingReturnedPayment &&
          returnedPaymentStatus === "PAID" && (
            <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-800">
              <CircleCheck />
              <AlertTitle>Thanh toán thành công</AlertTitle>
              <AlertDescription>
                Giao dịch đã được xác nhận và thông tin lịch
                đặt đã được cập nhật.
              </AlertDescription>
            </Alert>
          )}

        {paymentReturn &&
          !checkingReturnedPayment &&
          (returnedPaymentStatus === "FAILED" ||
            returnedPaymentStatus === "EXPIRED") && (
            <Alert variant="destructive" className="mb-6">
              <CircleAlert />
              <AlertTitle>
                Thanh toán không thành công
              </AlertTitle>
              <AlertDescription>
                Giao dịch đã thất bại hoặc hết hạn. Bạn có thể
                chọn phương thức thanh toán và thử lại.
              </AlertDescription>
            </Alert>
          )}

        {paymentReturn &&
          !checkingReturnedPayment &&
          returnedPaymentStatus === "PENDING" && (
            <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
              <CircleAlert />
              <AlertTitle>Giao dịch đang được xử lý</AlertTitle>
              <AlertDescription>
                FieldMate chưa nhận được kết quả cuối cùng. Vui
                lòng tải lại trang sau ít phút.
              </AlertDescription>
            </Alert>
          )}

        {paymentReturn &&
          !checkingReturnedPayment &&
          returnedPaymentStatus === "REFUNDED" && (
            <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-800">
              <CircleAlert />
              <AlertTitle>Giao dịch đã được hoàn tiền</AlertTitle>
              <AlertDescription>
                Khoản thanh toán này đã được hoàn lại.
              </AlertDescription>
            </Alert>
          )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
              <CardHeader className="gap-4 px-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ff174f]">
                    Mã lịch đặt #{booking.id}
                  </p>
                  <CardTitle className="mt-2 text-2xl font-black text-[#073b77]">
                    {booking.courtName}
                  </CardTitle>
                </div>

                <Badge
                  className={`w-fit rounded-full px-3 py-1 font-bold ring-1 ${status.className}`}
                >
                  {status.label}
                </Badge>
              </CardHeader>

              <CardContent className="px-6 pb-8 sm:px-8">
                <Separator />

                <div className="grid gap-5 py-6 sm:grid-cols-2">
                  <DetailItem
                    icon={MapPin}
                    label="Cụm sân"
                    value={booking.venueName}
                  />
                  <DetailItem
                    icon={CalendarDays}
                    label="Ngày đặt"
                    value={formatDate(booking.bookingDate)}
                  />
                  <DetailItem
                    icon={Clock3}
                    label="Khung giờ"
                    value={`${booking.startTime.slice(0, 5)} - ${booking.endTime.slice(0, 5)}`}
                  />
                  <DetailItem
                    icon={ReceiptText}
                    label="Ngày tạo"
                    value={formatDateTime(booking.createdAt)}
                  />
                </div>

                <div className="grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2">
                  <MoneyItem
                    label="Tổng tiền"
                    value={booking.totalPrice}
                  />
                  <MoneyItem
                    label="Tiền cọc"
                    value={booking.requiredDeposit}
                  />
                  <MoneyItem
                    label="Đã thanh toán"
                    value={booking.paidAmount}
                    className="text-emerald-600"
                  />
                  <MoneyItem
                    label="Còn lại"
                    value={booking.remainingAmount}
                    className="text-[#ff174f]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
              <CardHeader className="px-6 sm:px-8">
                <CardTitle className="text-xl font-black text-[#073b77]">
                  Giao dịch
                </CardTitle>
              </CardHeader>

              <CardContent className="px-6 pb-8 sm:px-8">
                {payments.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 py-10 text-center font-semibold text-slate-500">
                    Chưa có giao dịch
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => {
                      const paymentStatus =
                        paymentStatusConfig[payment.status];

                      return (
                        <div
                          key={payment.id}
                          className="rounded-2xl border border-slate-100 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-black text-[#073b77]">
                                {paymentTypeLabels[payment.paymentType]}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {payment.transactionCode}
                              </p>
                            </div>

                            <Badge
                              className={`rounded-full ${paymentStatus.className}`}
                            >
                              {paymentStatus.label}
                            </Badge>
                          </div>

                          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                            <div className="text-sm text-slate-500">
                              <p>{payment.paymentMethod}</p>
                              <p className="mt-1">
                                {formatDateTime(payment.createdAt)}
                              </p>
                            </div>
                            <p className="text-lg font-black text-[#ff174f]">
                              {currencyFormatter.format(payment.amount)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 lg:sticky lg:top-24">
            <CardHeader className="px-6">
              <CardTitle className="text-xl font-black text-[#073b77]">
                Thanh toán
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 px-6 pb-7">
              <div className="rounded-2xl bg-rose-50 p-5">
                <p className="text-sm font-semibold text-slate-500">
                  Số tiền thanh toán
                </p>
                <p className="mt-2 text-2xl font-black text-[#ff174f]">
                  {currencyFormatter.format(selectedPaymentAmount)}
                </p>
              </div>

              {canContinuePayment ? (
                <>
                  <div className="grid gap-3">
                    {availablePaymentTypes.map((type) => {
                      const selected =
                        paymentType === type.value;

                      return (
                        <button
                          key={type.value}
                          type="button"
                          disabled={submitting}
                          onClick={() =>
                            setPaymentType(type.value)
                          }
                          className={`rounded-2xl border p-4 text-left transition ${
                            selected
                              ? "border-[#ff174f] bg-rose-50 ring-2 ring-[#ff174f]/10"
                              : "border-slate-200 hover:border-rose-200"
                          }`}
                        >
                          <span className="block font-black text-[#073b77]">
                            {type.label}
                          </span>
                          <span className="mt-1 block font-black text-[#ff174f]">
                            {currencyFormatter.format(type.amount)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <Separator />

                  {paymentMethods.map((method) => {
                    const selected =
                      paymentMethod === method.value;

                    return (
                      <button
                        key={method.value}
                        type="button"
                        disabled={submitting}
                        onClick={() =>
                          setPaymentMethod(method.value)
                        }
                        className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                          selected
                            ? "border-[#ff174f] bg-rose-50 ring-2 ring-[#ff174f]/10"
                            : "border-slate-200 hover:border-rose-200"
                        }`}
                      >
                        <span className="size-11 overflow-hidden rounded-xl border bg-white">
                          <img
                            src={method.imageUrl}
                            alt={`Logo ${method.label}`}
                            className="h-full w-full object-contain"
                          />
                        </span>
                        <span className="font-black text-[#073b77]">
                          {method.label}
                        </span>
                      </button>
                    );
                  })}

                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={handleContinuePayment}
                    className="h-12 w-full rounded-xl bg-[#ff174f] font-bold text-white hover:bg-[#e8003e]"
                  >
                    {submitting ? (
                      <LoaderCircle className="size-5 animate-spin" />
                    ) : (
                      <WalletCards className="size-5" />
                    )}
                    {submitting
                      ? "Đang xử lý..."
                      : "Tiếp tục thanh toán"}
                  </Button>
                </>
              ) : (
                <div className="rounded-2xl bg-slate-50 py-6 text-center text-sm font-semibold text-slate-500">
                  {booking.remainingAmount <= 0
                    ? "Lịch đặt đã được thanh toán đầy đủ"
                    : "Không thể thanh toán lịch đặt này"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

type DetailItemProps = {
  icon: typeof MapPin;
  label: string;
  value: string;
};

function DetailItem({
  icon: Icon,
  label,
  value,
}: DetailItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#ff174f]">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xs font-semibold text-slate-500">
          {label}
        </p>
        <p className="mt-1 font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function MoneyItem({
  label,
  value,
  className = "text-slate-800",
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500">
        {label}
      </p>
      <p className={`mt-1 font-black ${className}`}>
        {currencyFormatter.format(value)}
      </p>
    </div>
  );
}
