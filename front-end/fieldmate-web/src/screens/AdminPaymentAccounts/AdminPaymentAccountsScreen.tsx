"use client";

import axios from "axios";
import Link from "next/link";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminPageHeader,
  AdminStatusBadge,
  formatDateTime,
} from "@/components/Admin/AdminPage";
import { ConfirmationDialog } from "@/components/ConfirmationDialog/ConfirmationDialog";
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

type StatusDecision = {
  account: PaymentAccountResponse;
  status: PaymentAccountStatus;
};

export function AdminPaymentAccountsScreen() {
  const [accounts, setAccounts] = useState<PaymentAccountResponse[]>([]);
  const [filter, setFilter] =
    useState<PaymentAccountStatus | "ALL">("ALL");
  const [decision, setDecision] = useState<StatusDecision | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAccounts() {
      try {
        setLoading(true);
        setError("");
        setAccounts(
          await paymentAccountService.getAll(
            filter === "ALL" ? undefined : filter,
          ),
        );
      } catch (requestError) {
        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải tài khoản thanh toán.",
          );
        } else {
          setError("Đã xảy ra lỗi khi tải tài khoản thanh toán.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadAccounts();
  }, [filter]);

  async function handleStatusUpdate() {
    if (!decision) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      const updated = await paymentAccountService.updateStatus(
        decision.account.id,
        decision.status,
      );
      setAccounts((current) =>
        current
          .map((account) =>
            account.id === updated.id ? updated : account,
          )
          .filter(
            (account) =>
              filter === "ALL" || account.status === filter,
          ),
      );
      setDecision(null);
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
        title="Tài khoản thanh toán"
        action={
          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value as PaymentAccountStatus | "ALL",
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 outline-none focus:border-[#ff174f]"
          >
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(statusConfig).map(
              ([status, config]) => (
                <option key={status} value={status}>
                  {config.label}
                </option>
              ),
            )}
          </select>
        }
      />

      <AdminError message={error} />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <AdminLoading />
        ) : accounts.length === 0 ? (
          <AdminEmpty label="Không có tài khoản thanh toán phù hợp." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Tài khoản</th>
                  <th className="px-5 py-4">Nhà cung cấp</th>
                  <th className="px-5 py-4">Mã định danh</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4">Ngày tạo</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((account) => {
                  const status = statusConfig[account.status];

                  return (
                    <tr
                      key={account.id}
                      className="hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4 font-black text-[#073b77]">
                        #{account.id}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-700">
                        {account.provider}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-600">
                        {account.partnerCode ??
                          account.tmnCode ??
                          "—"}
                      </td>
                      <td className="px-5 py-4">
                        <AdminStatusBadge
                          label={status.label}
                          tone={status.tone}
                        />
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-500">
                        {formatDateTime(account.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            nativeButton={false}
                            render={
                              <Link
                                href={`/admin/payment-accounts/${account.id}`}
                              />
                            }
                            variant="outline"
                            className="h-9 rounded-lg"
                          >
                            <Eye className="size-4" />
                            Chi tiết
                          </Button>
                          {account.status === "PENDING" && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  setDecision({
                                    account,
                                    status: "SUSPENDED",
                                  })
                                }
                                className="h-9 rounded-lg border-red-200 font-bold text-red-600 hover:bg-red-50"
                              >
                                Từ chối
                              </Button>
                              <Button
                                type="button"
                                onClick={() =>
                                  setDecision({
                                    account,
                                    status: "ACTIVE",
                                  })
                                }
                                className="h-9 rounded-lg bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                              >
                                Phê duyệt
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmationDialog
        open={Boolean(decision)}
        onOpenChange={(open) => {
          if (!open) {
            setDecision(null);
          }
        }}
        title={
          decision?.status === "ACTIVE"
            ? "Phê duyệt tài khoản?"
            : "Đình chỉ tài khoản?"
        }
        description={`Tài khoản #${decision?.account.id ?? ""} sẽ chuyển sang trạng thái ${decision?.status === "ACTIVE" ? "hoạt động" : "đình chỉ"}.`}
        confirmLabel={
          decision?.status === "ACTIVE" ? "Phê duyệt" : "Đình chỉ"
        }
        variant={
          decision?.status === "ACTIVE" ? "success" : "destructive"
        }
        loading={updating}
        onConfirm={handleStatusUpdate}
      />
    </>
  );
}
