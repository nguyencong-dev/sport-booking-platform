"use client";

import axios from "axios";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Power,
  Search,
} from "lucide-react";
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
import { userService } from "@/services/user.service";
import type { UserResponse, UserRole } from "@/types/auth";

type ApiErrorResponse = {
  message?: string;
};

type EnabledFilter = "ALL" | "ACTIVE" | "LOCKED";

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Quản trị viên",
  COURT_OWNER: "Chủ sân",
  CUSTOMER: "Khách hàng",
};

export function AdminUsersScreen() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [email, setEmail] = useState("");
  const [enabledFilter, setEnabledFilter] =
    useState<EnabledFilter>("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedUser, setSelectedUser] =
    useState<UserResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(0);
      setEmail(emailInput.trim());
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [emailInput]);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const pageData = await userService.getAll({
          email,
          enabled:
            enabledFilter === "ALL"
              ? undefined
              : enabledFilter === "ACTIVE",
          page,
        });

        if (!active) {
          return;
        }

        if (pageData.totalPages > 0 && page >= pageData.totalPages) {
          setPage(pageData.totalPages - 1);
          return;
        }

        setUsers(pageData.content);
        setTotalPages(pageData.totalPages);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải danh sách người dùng.",
          );
        } else {
          setError("Đã xảy ra lỗi khi tải người dùng.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      active = false;
    };
  }, [email, enabledFilter, page, refreshKey]);

  async function handleToggleEnabled() {
    if (!selectedUser) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      await userService.updateEnabled(
        selectedUser.id,
        !selectedUser.enabled,
      );
      setSelectedUser(null);
      setRefreshKey((current) => current + 1);
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
        title="Người dùng"
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <select
              value={enabledFilter}
              onChange={(event) => {
                setPage(0);
                setEnabledFilter(event.target.value as EnabledFilter);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#ff174f] focus:ring-3 focus:ring-rose-100"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="LOCKED">Đã khóa</option>
            </select>

            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={emailInput}
                onChange={(event) => setEmailInput(event.target.value)}
                placeholder="Tìm theo email..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium outline-none transition focus:border-[#ff174f] focus:ring-3 focus:ring-rose-100"
              />
            </div>
          </div>
        }
      />

      <AdminError message={error} />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <AdminLoading />
        ) : users.length === 0 ? (
          <AdminEmpty label="Không tìm thấy người dùng phù hợp." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Người dùng</th>
                  <th className="px-5 py-4">Vai trò</th>
                  <th className="px-5 py-4">Số điện thoại</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4">Ngày tạo</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">
                        {[user.lastName, user.firstName]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {user.email}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                      {roleLabels[user.role]}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600">
                      {user.phoneNumber || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <AdminStatusBadge
                        label={user.enabled ? "Hoạt động" : "Đã khóa"}
                        tone={user.enabled ? "green" : "red"}
                      />
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-500">
                      {formatDateTime(user.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          nativeButton={false}
                          render={
                            <Link href={`/admin/users/${user.id}`} />
                          }
                          variant="outline"
                          className="h-9 rounded-lg"
                        >
                          <Eye className="size-4" />
                          Chi tiết
                        </Button>
                        <Button
                          type="button"
                          variant={
                            user.enabled ? "destructive" : "outline"
                          }
                          onClick={() => setSelectedUser(user)}
                          className="h-9 rounded-lg"
                        >
                          <Power className="size-4" />
                          {user.enabled ? "Khóa" : "Mở khóa"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {!loading && totalPages > 1 && (
        <nav
          aria-label="Phân trang người dùng"
          className="mt-6 flex items-center justify-center gap-2"
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={page === 0}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-xl bg-white"
          >
            <ChevronLeft />
          </Button>

          <span className="px-3 text-sm font-bold text-[#073b77]">
            {page + 1}/{totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-xl bg-white"
          >
            <ChevronRight />
          </Button>
        </nav>
      )}

      <ConfirmationDialog
        open={Boolean(selectedUser)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUser(null);
          }
        }}
        title={
          selectedUser?.enabled
            ? "Khóa tài khoản?"
            : "Mở khóa tài khoản?"
        }
        description={
          selectedUser?.enabled
            ? `Tài khoản ${selectedUser.email} sẽ không thể tiếp tục sử dụng hệ thống.`
            : `Tài khoản ${selectedUser?.email ?? ""} sẽ được phép hoạt động trở lại.`
        }
        confirmLabel={
          selectedUser?.enabled ? "Khóa tài khoản" : "Mở khóa"
        }
        variant={selectedUser?.enabled ? "destructive" : "success"}
        loading={updating}
        onConfirm={handleToggleEnabled}
      />
    </>
  );
}
