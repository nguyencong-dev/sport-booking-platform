"use client";

import axios from "axios";
import Link from "next/link";
import { ArrowLeft, Power, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AdminError,
  AdminLoading,
  AdminPageHeader,
  AdminStatusBadge,
  formatDateTime,
} from "@/components/Admin/AdminPage";
import { ConfirmationDialog } from "@/components/ConfirmationDialog/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/user.service";
import type { UserResponse, UserRole } from "@/types/auth";

type ApiErrorResponse = {
  message?: string;
};

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Quản trị viên",
  COURT_OWNER: "Chủ sân",
  CUSTOMER: "Khách hàng",
};

export function AdminUserDetailScreen({
  userId,
}: {
  userId: number;
}) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        setError("");
        setUser(await userService.getById(userId));
      } catch (requestError) {
        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải thông tin người dùng.",
          );
        } else {
          setError("Đã xảy ra lỗi khi tải người dùng.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadUser();
  }, [userId]);

  async function handleToggleEnabled() {
    if (!user) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setUser(
        await userService.updateEnabled(user.id, !user.enabled),
      );
      setConfirmOpen(false);
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể cập nhật trạng thái người dùng.",
        );
      } else {
        setError("Đã xảy ra lỗi khi cập nhật người dùng.");
      }
    } finally {
      setUpdating(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Quản lý tài khoản"
        title="Chi tiết người dùng"
        action={
          <Button
            nativeButton={false}
            render={<Link href="/admin/users" />}
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
      ) : user ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 p-6">
            <span className="grid size-16 place-items-center overflow-hidden rounded-2xl bg-slate-100">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.lastName} ${user.firstName}`}
                  className="size-full object-cover"
                />
              ) : (
                <UserRound className="size-7 text-slate-400" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-black text-[#073b77]">
                {[user.lastName, user.firstName]
                  .filter(Boolean)
                  .join(" ")}
              </h2>
              <p className="mt-1 truncate text-sm font-medium text-slate-500">
                {user.email}
              </p>
            </div>
            <AdminStatusBadge
              label={user.enabled ? "Hoạt động" : "Đã khóa"}
              tone={user.enabled ? "green" : "red"}
            />
          </div>

          <dl className="grid gap-px bg-slate-100 sm:grid-cols-2">
            {[
              ["Mã người dùng", `#${user.id}`],
              ["Vai trò", roleLabels[user.role]],
              ["Số điện thoại", user.phoneNumber || "—"],
              ["Ngày tạo", formatDateTime(user.createdAt)],
              ["Cập nhật lần cuối", formatDateTime(user.updatedAt)],
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

          <div className="flex justify-end border-t border-slate-100 p-5">
            <Button
              type="button"
              variant={user.enabled ? "destructive" : "outline"}
              onClick={() => setConfirmOpen(true)}
              className="h-11 rounded-xl px-5 font-bold"
            >
              <Power className="size-4" />
              {user.enabled ? "Khóa tài khoản" : "Mở khóa tài khoản"}
            </Button>
          </div>
        </section>
      ) : null}

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={user?.enabled ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}
        description={
          user?.enabled
            ? "Người dùng sẽ không thể tiếp tục truy cập FieldMate."
            : "Người dùng sẽ được phép hoạt động trở lại."
        }
        confirmLabel={user?.enabled ? "Khóa tài khoản" : "Mở khóa"}
        variant={user?.enabled ? "destructive" : "success"}
        loading={updating}
        onConfirm={handleToggleEnabled}
      />
    </>
  );
}
