"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import {
  KeyRound,
  LoaderCircle,
  Save,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { PAYMENT_PROVIDER_LOGOS } from "@/configs/payment.config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { paymentAccountService } from "@/services/payment-account.service";
import type {
  PaymentAccountResponse,
  PaymentProvider,
} from "@/types/payment-account";

type PaymentAccountFormMode = "create" | "edit";

type PaymentAccountFormScreenProps = {
  mode: PaymentAccountFormMode;
  accountId?: number;
};

type ApiErrorResponse = {
  message?: string;
  fieldErrors?: Record<string, string>;
};

export function PaymentAccountFormScreen({
  mode,
  accountId,
}: PaymentAccountFormScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, ready, isAuthenticated } = useAuth();
  const [provider, setProvider] = useState<PaymentProvider>(() =>
    searchParams.get("provider") === "VNPAY" ? "VNPAY" : "MOMO",
  );
  const [partnerCode, setPartnerCode] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [tmnCode, setTmnCode] = useState("");
  const [hashSecret, setHashSecret] = useState("");
  const [existingAccounts, setExistingAccounts] = useState<
    PaymentAccountResponse[]
  >([]);
  const [checkingExistingAccounts, setCheckingExistingAccounts] =
    useState(mode === "create");
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login?redirect=/payment-accounts");
      return;
    }

    if (user?.role !== "COURT_OWNER") {
      router.replace("/");
    }
  }, [isAuthenticated, ready, router, user]);

  useEffect(() => {
    if (mode !== "create" || !ready || user?.role !== "COURT_OWNER") {
      return;
    }

    let active = true;

    async function loadExistingAccounts() {
      try {
        setCheckingExistingAccounts(true);
        const accounts = await paymentAccountService.getMyAccounts();

        if (!active) {
          return;
        }

        setExistingAccounts(accounts);

        const providerIsIntegrated = accounts.some(
          (account) => account.provider === provider,
        );
        const availableProvider = (["MOMO", "VNPAY"] as PaymentProvider[]).find(
          (paymentProvider) =>
            !accounts.some((account) => account.provider === paymentProvider),
        );

        if (providerIsIntegrated && availableProvider) {
          setProvider(availableProvider);
        }
      } catch (requestError) {
        if (active) {
          if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
            setError(
              requestError.response?.data?.message ??
                "Không thể kiểm tra tài khoản thanh toán hiện có.",
            );
          } else {
            setError("Không thể kiểm tra tài khoản thanh toán hiện có.");
          }
        }
      } finally {
        if (active) {
          setCheckingExistingAccounts(false);
        }
      }
    }

    void loadExistingAccounts();

    return () => {
      active = false;
    };
  }, [mode, provider, ready, user]);

  useEffect(() => {
    if (
      mode !== "edit" ||
      !accountId ||
      !ready ||
      user?.role !== "COURT_OWNER"
    ) {
      return;
    }

    const currentAccountId = accountId;
    let active = true;

    async function loadAccount() {
      try {
        setLoading(true);
        setError("");
        const account = await paymentAccountService.getById(currentAccountId);

        if (!active) {
          return;
        }

        setProvider(account.provider);
        setPartnerCode(account.partnerCode ?? "");
        setTmnCode(account.tmnCode ?? "");
      } catch (requestError) {
        if (active) {
          if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
            setError(
              requestError.response?.data?.message ??
                "Không thể tải tài khoản thanh toán.",
            );
          } else {
            setError("Không thể tải tài khoản thanh toán.");
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadAccount();

    return () => {
      active = false;
    };
  }, [accountId, mode, ready, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      mode === "create" &&
      existingAccounts.some((account) => account.provider === provider)
    ) {
      setError("Phương thức thanh toán này đã được tích hợp.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (provider === "MOMO") {
        if (!partnerCode.trim() || !accessKey.trim() || !secretKey.trim()) {
          setError("Vui lòng nhập đầy đủ thông tin MoMo.");
          return;
        }

        const request = {
          partnerCode: partnerCode.trim(),
          accessKey: accessKey.trim(),
          secretKey: secretKey.trim(),
        };

        if (mode === "edit" && accountId) {
          await paymentAccountService.updateMomo(accountId, request);
        } else {
          await paymentAccountService.createMomo(request);
        }
      } else {
        if (!tmnCode.trim() || !hashSecret.trim()) {
          setError("Vui lòng nhập đầy đủ thông tin VNPay.");
          return;
        }

        const request = {
          tmnCode: tmnCode.trim(),
          hashSecret: hashSecret.trim(),
        };

        if (mode === "edit" && accountId) {
          await paymentAccountService.updateVnPay(accountId, request);
        } else {
          await paymentAccountService.createVnPay(request);
        }
      }

      router.push("/payment-accounts");
      router.refresh();
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        const fieldErrors = requestError.response?.data?.fieldErrors;
        const firstFieldError = fieldErrors && Object.values(fieldErrors)[0];

        setError(
          firstFieldError ??
            requestError.response?.data?.message ??
            "Không thể lưu tài khoản thanh toán.",
        );
      } else {
        setError("Không thể lưu tài khoản thanh toán.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready || !user || user.role !== "COURT_OWNER" || loading) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] flex-1 items-center justify-center bg-[#f1f5f9]">
        <LoaderCircle className="size-6 animate-spin text-[#ff174f]" />
      </main>
    );
  }

  const isEdit = mode === "edit";
  const momoIntegrated = existingAccounts.some(
    (account) => account.provider === "MOMO",
  );
  const vnPayIntegrated = existingAccounts.some(
    (account) => account.provider === "VNPAY",
  );
  const allProvidersIntegrated = momoIntegrated && vnPayIntegrated;

  return (
    <main className="flex-1 bg-[#f1f5f9] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-8 text-3xl font-black tracking-[-0.04em] text-[#073b77]">
          {isEdit ? "Chỉnh sửa tài khoản thanh toán" : "Thêm tài khoản thanh toán"}
        </h1>

        <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
          <CardHeader className="px-6 pt-7 sm:px-8">
            <CardTitle className="text-xl font-black text-[#073b77]">
              Thông tin cổng thanh toán
            </CardTitle>
          </CardHeader>

          <CardContent className="px-6 pb-8 sm:px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <ProviderOption
                  active={provider === "MOMO"}
                  disabled={
                    isEdit || submitting || checkingExistingAccounts || momoIntegrated
                  }
                  icon={
                    <img
                      src={PAYMENT_PROVIDER_LOGOS.MOMO}
                      alt="MoMo"
                      className="size-7 rounded-md object-contain"
                    />
                  }
                  label="MoMo"
                  onClick={() => setProvider("MOMO")}
                />
                <ProviderOption
                  active={provider === "VNPAY"}
                  disabled={
                    isEdit || submitting || checkingExistingAccounts || vnPayIntegrated
                  }
                  icon={
                    <img
                      src={PAYMENT_PROVIDER_LOGOS.VNPAY}
                      alt="VNPay"
                      className="size-7 rounded-md object-contain"
                    />
                  }
                  label="VNPay"
                  onClick={() => setProvider("VNPAY")}
                />
              </div>

              {!isEdit && allProvidersIntegrated && (
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                  Bạn đã tích hợp cả MoMo và VNPay. Hãy quay lại để chỉnh sửa tài khoản hiện có.
                </p>
              )}

              {provider === "MOMO" ? (
                <>
                  <TextField label="Partner Code" value={partnerCode} onChange={setPartnerCode} disabled={submitting} />
                  <TextField label="Access Key" value={accessKey} onChange={setAccessKey} disabled={submitting} secret />
                  <TextField label="Secret Key" value={secretKey} onChange={setSecretKey} disabled={submitting} secret />
                </>
              ) : (
                <>
                  <TextField label="TMN Code" value={tmnCode} onChange={setTmnCode} disabled={submitting} />
                  <TextField label="Hash Secret" value={hashSecret} onChange={setHashSecret} disabled={submitting} secret />
                </>
              )}

              {isEdit && (
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                  Nhập lại các khóa bảo mật để cập nhật tài khoản. Sau khi cập nhật, tài khoản sẽ chuyển về trạng thái chờ duyệt.
                </p>
              )}

              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {error}
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Button type="button" variant="outline" disabled={submitting} onClick={() => router.push("/payment-accounts")} className="h-12 rounded-xl font-bold">
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting || checkingExistingAccounts || allProvidersIntegrated} className="h-12 rounded-xl bg-[#ff174f] font-bold text-white hover:bg-[#e8003e]">
                  {submitting ? <LoaderCircle className="size-5 animate-spin" /> : <Save className="size-5" />}
                  {submitting ? "Đang lưu..." : "Lưu tài khoản"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

type ProviderOptionProps = {
  active: boolean;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

function ProviderOption({ active, disabled, icon, label, onClick }: ProviderOptionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
        active
          ? "border-[#ff174f] bg-rose-50 ring-1 ring-[#ff174f]"
          : "border-slate-200 hover:border-slate-300"
      } disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {icon}
      <span className="font-extrabold text-[#073b77]">{label}</span>
    </button>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  disabled: boolean;
  secret?: boolean;
  onChange: (value: string) => void;
};

function TextField({ label, value, disabled, secret = false, onChange }: TextFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
      <div className="flex h-12 items-center rounded-xl border border-slate-200 px-4 focus-within:border-[#073b77] focus-within:ring-2 focus-within:ring-[#073b77]/10">
        <KeyRound className="size-5 shrink-0 text-slate-400" />
        <input
          type={secret ? "password" : "text"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          maxLength={secret ? 500 : 100}
          required
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-800 outline-none"
        />
      </div>
    </div>
  );
}
