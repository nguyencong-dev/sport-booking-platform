"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Edit3,
  LoaderCircle,
  Power,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAYMENT_PROVIDER_LOGOS } from "@/configs/payment.config";
import { useAuth } from "@/contexts/AuthContext";
import { paymentAccountService } from "@/services/payment-account.service";
import type {
  PaymentAccountResponse,
  PaymentAccountStatus,
  PaymentProvider,
} from "@/types/payment-account";

type ApiErrorResponse = {
  message?: string;
};

const statusConfig: Record<
  PaymentAccountStatus,
  { label: string; className: string }
> = {
  ACTIVE: { label: "Đang hoạt động", className: "bg-emerald-500 text-white" },
  INACTIVE: { label: "Tạm ngưng", className: "bg-slate-500 text-white" },
  PENDING: { label: "Chờ duyệt", className: "bg-amber-500 text-white" },
  SUSPENDED: { label: "Đình chỉ", className: "bg-red-500 text-white" },
};

const providerCards: Array<{
  provider: PaymentProvider;
  name: string;
  benefits: string[];
  accentClassName: string;
}> = [
  {
    provider: "MOMO",
    name: "Ví MoMo",
    accentClassName: "border-[#ff4b83]",
    benefits: [
      "Phổ biến với người dùng Việt Nam",
      "Thanh toán nhanh qua ứng dụng MoMo",
      "Hỗ trợ thanh toán bằng QR Code",
      "Nhận trạng thái giao dịch tự động",
      "Dùng cho thanh toán tiền cọc hoặc toàn bộ",
      "Bảo mật bằng thông tin merchant riêng",
    ],
  },
  {
    provider: "VNPAY",
    name: "VNPay",
    accentClassName: "border-[#0b5ea8]",
    benefits: [
      "Hỗ trợ thanh toán qua ứng dụng ngân hàng",
      "Thanh toán thuận tiện bằng QR VNPay",
      "Tương thích với nhiều ngân hàng nội địa",
      "Nhận trạng thái giao dịch tự động",
      "Dùng cho thanh toán tiền cọc hoặc toàn bộ",
      "Bảo mật bằng TMN Code và Hash Secret",
    ],
  },
];

export function PaymentAccountsScreen() {
  const router = useRouter();
  const { user, ready, isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState<PaymentAccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function loadAccounts() {
    try {
      setLoading(true);
      setError("");
      setAccounts(await paymentAccountService.getMyAccounts());
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể tải tài khoản thanh toán.",
        );
      } else {
        setError("Không thể tải tài khoản thanh toán.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready) return;

    if (!isAuthenticated) {
      router.replace("/login?redirect=/payment-accounts");
      return;
    }

    if (user?.role !== "COURT_OWNER") {
      router.replace("/");
      return;
    }

    const timeoutId = window.setTimeout(() => void loadAccounts(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, ready, router, user]);

  async function handleStatusChange(account: PaymentAccountResponse) {
    try {
      setActionId(account.id);
      setError("");
      const updatedAccount =
        account.status === "ACTIVE"
          ? await paymentAccountService.deactivate(account.id)
          : await paymentAccountService.activate(account.id);

      setAccounts((currentAccounts) =>
        currentAccounts.map((currentAccount) =>
          currentAccount.id === updatedAccount.id
            ? updatedAccount
            : currentAccount,
        ),
      );
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể cập nhật trạng thái tài khoản.",
        );
      } else {
        setError("Không thể cập nhật trạng thái tài khoản.");
      }
    } finally {
      setActionId(null);
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
      <section className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#ff174f]">
            Quản trị chủ sân
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#073b77]">
            Tài khoản thanh toán
          </h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-white p-4">
            <CircleAlert />
            <AlertTitle>Không thể thực hiện</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <LoaderCircle className="size-7 animate-spin text-[#ff174f]" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {providerCards.map((providerCard) => (
              <PaymentProviderCard
                key={providerCard.provider}
                {...providerCard}
                account={accounts.find(
                  (account) => account.provider === providerCard.provider,
                )}
                actionId={actionId}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

type PaymentProviderCardProps = (typeof providerCards)[number] & {
  account?: PaymentAccountResponse;
  actionId: number | null;
  onStatusChange: (account: PaymentAccountResponse) => Promise<void>;
};

function PaymentProviderCard({
  provider,
  name,
  benefits,
  accentClassName,
  account,
  actionId,
  onStatusChange,
}: PaymentProviderCardProps) {
  const status = account ? statusConfig[account.status] : null;
  const canChangeStatus =
    account?.status === "ACTIVE" || account?.status === "INACTIVE";
  const accountCode =
    account?.provider === "MOMO" ? account.partnerCode : account?.tmnCode;

  return (
    <article
      className={`flex min-h-[470px] flex-col rounded-3xl border-2 bg-white p-6 shadow-sm sm:p-7 ${accentClassName}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-slate-50 ring-1 ring-slate-100">
            <img
              src={PAYMENT_PROVIDER_LOGOS[provider]}
              alt={name}
              className="size-9 rounded-lg object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#073b77]">{name}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {account ? accountCode : "Chưa tích hợp"}
            </p>
          </div>
        </div>
        {status && (
          <Badge className={`border-0 ${status.className}`}>{status.label}</Badge>
        )}
      </div>

      <ul className="mt-7 grid gap-3 border-y border-slate-100 py-6 text-sm font-semibold text-slate-600">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#16a34a]" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap gap-3 pt-6">
        {account ? (
          <>
            <Button
              nativeButton={false}
              variant="outline"
              render={<Link href={`/payment-accounts/${account.id}/edit`} />}
              className="h-11 rounded-xl font-bold"
            >
              <Edit3 className="size-4" />
              Chỉnh sửa
            </Button>

            {canChangeStatus && (
              <Button
                type="button"
                variant="outline"
                disabled={actionId === account.id}
                onClick={() => void onStatusChange(account)}
                className="h-11 rounded-xl font-bold text-slate-700"
              >
                {actionId === account.id ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : account.status === "ACTIVE" ? (
                  <Power className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                {account.status === "ACTIVE" ? "Ngưng thanh toán" : "Bật lại"}
              </Button>
            )}
          </>
        ) : (
          <Button
            nativeButton={false}
            render={<Link href={`/payment-accounts/new?provider=${provider}`} />}
            className="h-11 rounded-xl bg-[#ff174f] px-5 font-bold text-white hover:bg-[#e8003e]"
          >
            Tích hợp ngay
          </Button>
        )}
      </div>
    </article>
  );
}
