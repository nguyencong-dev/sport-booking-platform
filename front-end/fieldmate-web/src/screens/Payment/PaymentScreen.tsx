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
import { useEffect, useMemo, useState, type ElementType } from "react";

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
import { useAuth } from "@/contexts/AuthContext";
import {
  bookingDraftService,
  type BookingDraft,
} from "@/services/booking-draft.service";
import { bookingService } from "@/services/booking.service";
import { courtService } from "@/services/court.service";
import { paymentService } from "@/services/payment.service";
import type { CourtResponse } from "@/types/court";
import type {
  PaymentMethod,
  PaymentType,
} from "@/types/payment";

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

const paymentTypes: Array<{
  value: PaymentType;
  label: string;
}> = [
  {
    value: "DEPOSIT",
    label: "Thanh toán cọc 30%",
  },
  {
    value: "FULL_PAYMENT",
    label: "Thanh toán toàn bộ",
  },
];

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function getDurationHours(startTime: string, endTime: string) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  return Math.max(0, (end - start) / 60);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function PaymentScreen() {
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();

  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [court, setCourt] = useState<CourtResponse | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("VNPAY");
  const [paymentType, setPaymentType] =
    useState<PaymentType>("DEPOSIT");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/login?redirect=/payment");
    }
  }, [isAuthenticated, ready, router]);

  useEffect(() => {
    if (!ready || !isAuthenticated) {
      return;
    }

    let active = true;

    async function loadCheckout() {
      const savedDraft = bookingDraftService.load();

      if (!savedDraft) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const courtData = await courtService.getById(
          savedDraft.courtId,
        );

        if (active) {
          setDraft(savedDraft);
          setCourt(courtData);
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải thông tin thanh toán.",
          );
        } else {
          setError("Không thể tải thông tin thanh toán.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCheckout();

    return () => {
      active = false;
    };
  }, [isAuthenticated, ready]);

  const durationHours = useMemo(() => {
    if (!draft) {
      return 0;
    }

    return getDurationHours(
      draft.startTime,
      draft.endTime,
    );
  }, [draft]);

  const estimatedTotal = court
    ? court.pricePerHour * durationHours
    : 0;

  const estimatedDeposit = estimatedTotal * 0.3;
  const paymentAmount =
    paymentType === "FULL_PAYMENT"
      ? estimatedTotal
      : estimatedDeposit;

  async function handlePayment() {
    if (!draft || !court) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      let bookingId = draft.bookingId;

      if (!bookingId) {
        const booking = await bookingService.create({
          courtId: draft.courtId,
          bookingDate: draft.bookingDate,
          startTime: draft.startTime,
          endTime: draft.endTime,
        });

        bookingId = booking.id;

        bookingDraftService.save({
          ...draft,
          bookingId,
        });
      }

      const payment = await paymentService.create(
        bookingId,
        {
          paymentMethod,
          paymentType,
        },
      );

      const paymentUrl =
        payment.checkoutUrl ??
        payment.deeplink ??
        payment.qrCodeUrl;

      if (!paymentUrl) {
        setError("BE không trả về đường dẫn thanh toán.");
        return;
      }

      bookingDraftService.remove();
      window.location.assign(paymentUrl);
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        if (requestError.response?.status === 401) {
          router.replace("/login?redirect=/payment");
          return;
        }

        setError(
          requestError.response?.data?.message ??
            "Không thể khởi tạo thanh toán.",
        );
      } else {
        setError("Không thể khởi tạo thanh toán.");
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

  if (!draft || !court) {
    return (
      <main className="flex-1 bg-[#f6f8fb] px-4 py-12">
        <Card className="mx-auto max-w-xl rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
          <CardContent className="flex flex-col items-center py-14 text-center">
            <CalendarDays className="size-10 text-[#ff174f]" />

            <h1 className="mt-5 text-xl font-black text-[#073b77]">
              Không có thông tin đặt sân
            </h1>

            {error && (
              <p className="mt-3 text-sm font-semibold text-red-600">
                {error}
              </p>
            )}

            <Button
              type="button"
              onClick={() => router.push("/venues")}
              className="mt-6 rounded-xl bg-[#ff174f] text-white hover:bg-[#e8003e]"
            >
              Chọn sân
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#f6f8fb] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="mb-8 text-3xl font-black tracking-[-0.04em] text-[#073b77] sm:text-4xl">
          Thanh toán
        </h1>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
            <CardHeader className="px-6 pt-7 sm:px-8">
              <CardTitle className="text-xl font-black text-[#073b77]">
                Thanh toán
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 px-6 pb-8 sm:px-8">
              <h3 className="font-black text-[#073b77]">
                Hình thức thanh toán
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                {paymentTypes.map((type) => {
                  const selected = paymentType === type.value;
                  const amount =
                    type.value === "FULL_PAYMENT"
                      ? estimatedTotal
                      : estimatedDeposit;

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setPaymentType(type.value)}
                      disabled={submitting}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-[#ff174f] bg-rose-50 ring-2 ring-[#ff174f]/10"
                          : "border-slate-200 bg-white hover:border-rose-200"
                      }`}
                    >
                      <span className="block font-black text-[#073b77]">
                        {type.label}
                      </span>
                      <span className="mt-2 block text-lg font-black text-[#ff174f]">
                        {currencyFormatter.format(amount)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <Separator />

              <h3 className="font-black text-[#073b77]">
                Phương thức thanh toán
              </h3>

              {paymentMethods.map((method) => {
                const selected =
                  paymentMethod === method.value;

                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() =>
                      setPaymentMethod(method.value)
                    }
                    disabled={submitting}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
                      selected
                        ? "border-[#ff174f] bg-rose-50 ring-2 ring-[#ff174f]/10"
                        : "border-slate-200 bg-white hover:border-rose-200"
                    }`}
                  >
                    <span
                      className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white"
                    >
                      <img
                        src={method.imageUrl}
                        alt={`Logo ${method.label}`}
                        className="h-full w-full object-contain"
                      />
                    </span>

                    <span className="font-black text-[#073b77]">
                      {method.label}
                    </span>

                    <span
                      className={`ml-auto size-5 rounded-full border-2 ${
                        selected
                          ? "border-[#ff174f] bg-[#ff174f] ring-4 ring-rose-100"
                          : "border-slate-300"
                      }`}
                    />
                  </button>
                );
              })}

              {error && (
                <Alert variant="destructive">
                  <CircleAlert />
                  <AlertTitle>
                    Không thể thanh toán
                  </AlertTitle>
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="button"
                onClick={handlePayment}
                disabled={submitting}
                className="h-12 w-full rounded-xl bg-[#ff174f] text-base font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-[#e8003e]"
              >
                {submitting && (
                  <LoaderCircle className="size-5 animate-spin" />
                )}

                {submitting
                  ? "Đang xử lý..."
                  : `Thanh toán ${currencyFormatter.format(
                      paymentAmount,
                    )}`}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 lg:sticky lg:top-24">
            <CardHeader className="px-6">
              <CardTitle className="text-xl font-black text-[#073b77]">
                Thông tin đặt sân
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5 px-6 pb-7">
              <CheckoutItem
                icon={MapPin}
                label="Cụm sân"
                value={court.venueName}
              />

              <CheckoutItem
                icon={Volleyball}
                label="Sân"
                value={court.name}
              />

              <CheckoutItem
                icon={CalendarDays}
                label="Ngày đặt"
                value={formatDate(draft.bookingDate)}
              />

              <CheckoutItem
                icon={Clock3}
                label="Khung giờ"
                value={`${draft.startTime} - ${draft.endTime}`}
              />

              <Separator />

              <SummaryItem
                label="Đơn giá"
                value={`${currencyFormatter.format(
                  court.pricePerHour,
                )}/giờ`}
              />

              <SummaryItem
                label="Thời lượng"
                value={`${durationHours} giờ`}
              />

              <SummaryItem
                label="Tổng tiền"
                value={currencyFormatter.format(
                  estimatedTotal,
                )}
                valueClassName="text-[#073b77]"
              />

              <SummaryItem
                label={
                  paymentType === "FULL_PAYMENT"
                    ? "Thanh toán toàn bộ"
                    : "Thanh toán cọc 30%"
                }
                value={currencyFormatter.format(
                  paymentAmount,
                )}
                valueClassName="text-[#ff174f]"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

type CheckoutItemProps = {
  icon: ElementType;
  label: string;
  value: string;
};

function CheckoutItem({
  icon: Icon,
  label,
  value,
}: CheckoutItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#ff174f]">
        <Icon className="size-5" />
      </span>

      <div>
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
