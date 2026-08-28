"use client";

import axios from "axios";
import Link from "next/link";
import { ArrowLeft, Power, ShieldCheck, UserRound } from "lucide-react";
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
  const [selectedRole, setSelectedRole] = useState<UserRole>("CUSTOMER");
  const [loading, setLoading] = useState(true);
  const [updatingEnabled, setUpdatingEnabled] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [roleConfirmOpen, setRoleConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        setError("");
        const loadedUser = await userService.getById(userId);
        setUser(loadedUser);
        setSelectedRole(loadedUser.role);
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
      setUpdatingEnabled(true);
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
      setUpdatingEnabled(false);
    }
  }

  async function handleUpdateRole() {
    if (!user || selectedRole === user.role) {
      return;
    }

    try {
      setUpdatingRole(true);
      setError("");
      const updatedUser = await userService.updateRole(user.id, {
        role: selectedRole,
      });
      setUser(updatedUser);
      setSelectedRole(updatedUser.role);
      setRoleConfirmOpen(false);
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể cập nhật vai trò người dùng.",
        );
      } else {
        setError("Đã xảy ra lỗi khi phân quyền người dùng.");
      }
    } finally {
      setUpdatingRole(false);
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

          <div className="border-t border-slate-100 p-5">
            <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 font-black text-[#073b77]">
                    <ShieldCheck className="size-5" />
                    Phân quyền người dùng
                  </h3>
                  {user.role === "ADMIN" && (
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Không thể thay đổi vai trò của tài khoản quản trị viên.
                    </p>
                  )}
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                  <select
                    value={selectedRole}
                    disabled={user.role === "ADMIN" || updatingRole}
                    onChange={(event) => setSelectedRole(event.target.value as UserRole)}
                    className="h-11 min-w-52 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#ff174f] focus:ring-3 focus:ring-rose-100"
                  >
                    {user.role === "ADMIN" && <option value="ADMIN">Quản trị viên</option>}
                    {user.role !== "ADMIN" && <option value="CUSTOMER">Khách hàng</option>}
                    {user.role !== "ADMIN" && <option value="COURT_OWNER">Chủ sân</option>}
                  </select>

                  <Button
                    type="button"
                    disabled={user.role === "ADMIN" || selectedRole === user.role || updatingRole}
                    onClick={() => setRoleConfirmOpen(true)}
                    className="h-11 rounded-xl bg-[#073b77] px-5 font-bold text-white hover:bg-[#052d5c]"
                  >
                    <ShieldCheck className="size-4" />
                    Cập nhật vai trò
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
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
        loading={updatingEnabled}
        onConfirm={handleToggleEnabled}
      />

      <ConfirmationDialog
        open={roleConfirmOpen}
        onOpenChange={setRoleConfirmOpen}
        title="Thay đổi vai trò?"
        description={`Vai trò của ${user?.email ?? "người dùng"} sẽ được thay đổi từ ${user ? roleLabels[user.role] : ""} thành ${roleLabels[selectedRole]}.`}
        confirmLabel="Cập nhật vai trò"
        variant="warning"
        icon={ShieldCheck}
        loading={updatingRole}
        onConfirm={handleUpdateRole}
      />
    </>
  );
}
