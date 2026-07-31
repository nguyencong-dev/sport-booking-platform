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
  formatDateTime,
} from "@/components/Admin/AdminPage";
import { Button } from "@/components/ui/button";
import { paymentAccountService } from "@/services/payment-account.service";
import type {
  PaymentAccountResponse,
  PaymentAccountStatus,
} from "@/types/payment-account";

type ApiErrorResponse = {
  message?: string;
};

const statusConfig: Record<
  PaymentAccountStatus,
  {
    label: string;
    tone: "green" | "amber" | "red" | "slate";
  }
> = {
  PENDING: { label: "Chờ duyệt", tone: "amber" },
  ACTIVE: { label: "Hoạt động", tone: "green" },
  INACTIVE: { label: "Không hoạt động", tone: "slate" },
  SUSPENDED: { label: "Đình chỉ", tone: "red" },
};

export function AdminPaymentAccountDetailScreen({
  accountId,
}: {
  accountId: number;
}) {
  const [account, setAccount] =
    useState<PaymentAccountResponse | null>(null);
  const [nextStatus, setNextStatus] =
    useState<PaymentAccountStatus>("PENDING");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAccount() {
      try {
        setLoading(true);
        setError("");
        const accountData =
          await paymentAccountService.getById(accountId);
        setAccount(accountData);
        setNextStatus(accountData.status);
      } catch (requestError) {
        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải tài khoản thanh toán.",
          );
        } else {
          setError("Đã xảy ra lỗi khi tải tài khoản.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadAccount();
  }, [accountId]);

  async function handleUpdateStatus() {
    if (!account || nextStatus === account.status) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      const updated = await paymentAccountService.updateStatus(
        account.id,
        nextStatus,
      );
      setAccount(updated);
      setNextStatus(updated.status);
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể cập nhật trạng thái tài khoản.",
        );
      } else {
        setError("Đã xảy ra lỗi khi cập nhật tài khoản.");
      }
    } finally {
      setUpdating(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Kiểm soát thanh toán"
        title={`Tài khoản #${accountId}`}
        action={
          <Button
            nativeButton={false}
            render={<Link href="/admin/payment-accounts" />}
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
      ) : account ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6">
            <div>
              <h2 className="text-xl font-black text-[#073b77]">
                {account.provider}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {account.partnerCode ??
                  account.tmnCode ??
                  "Chưa có mã định danh"}
              </p>
            </div>
            <AdminStatusBadge
              label={statusConfig[account.status].label}
              tone={statusConfig[account.status].tone}
            />
          </div>

          <dl className="grid gap-px bg-slate-100 sm:grid-cols-2">
            {[
              ["Mã tài khoản", `#${account.id}`],
              ["Nhà cung cấp", account.provider],
              [
                "Partner code / TMN code",
                account.partnerCode ?? account.tmnCode ?? "—",
              ],
              ["Ngày tạo", formatDateTime(account.createdAt)],
              ["Cập nhật lần cuối", formatDateTime(account.updatedAt)],
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

          <div className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-end sm:justify-end">
            <label className="text-sm font-bold text-slate-700">
              Trạng thái
              <select
                value={nextStatus}
                onChange={(event) =>
                  setNextStatus(
                    event.target.value as PaymentAccountStatus,
                  )
                }
                className="mt-2 block h-11 min-w-56 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-[#ff174f]"
              >
                {Object.entries(statusConfig).map(
                  ([status, config]) => (
                    <option key={status} value={status}>
                      {config.label}
                    </option>
                  ),
                )}
              </select>
            </label>
            <Button
              type="button"
              disabled={updating || nextStatus === account.status}
              onClick={() => void handleUpdateStatus()}
              className="h-11 rounded-xl bg-[#ff174f] px-5 font-bold text-white hover:bg-[#e8003e]"
            >
              Lưu trạng thái
            </Button>
          </div>
        </section>
      ) : null}
    </>
  );
}
