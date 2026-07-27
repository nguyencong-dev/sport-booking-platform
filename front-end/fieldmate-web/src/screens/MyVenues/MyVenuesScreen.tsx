"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Edit3,
  LoaderCircle,
  MapPin,
  Plus,
  Power,
  Trash2,
} from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { venueService } from "@/services/venue.service";
import type {
  VenueStatus,
  VenueSummaryResponse,
} from "@/types/venue";

type ApiErrorResponse = {
  message?: string;
};

const statusConfig: Record<
  VenueStatus,
  {
    label: string;
    className: string;
  }
> = {
  ACTIVE: {
    label: "Đang hoạt động",
    className: "bg-emerald-500 text-white",
  },
  INACTIVE: {
    label: "Tạm ngưng",
    className: "bg-slate-500 text-white",
  },
  PENDING: {
    label: "Chờ duyệt",
    className: "bg-amber-500 text-white",
  },
  REJECTED: {
    label: "Bị từ chối",
    className: "bg-red-500 text-white",
  },
};

export function MyVenuesScreen() {
  const router = useRouter();
  const { user, ready, isAuthenticated } = useAuth();
  const [venues, setVenues] = useState<VenueSummaryResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function loadVenues(targetPage: number) {
    try {
      setLoading(true);
      setError("");

      const pageData = await venueService.getMyVenues(targetPage);

      setVenues(pageData.content);
      setPage(pageData.number);
      setTotalPages(pageData.totalPages);
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể tải danh sách sân.",
        );
      } else {
        setError("Đã xảy ra lỗi khi tải danh sách sân.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login?redirect=/my-venues");
      return;
    }

    if (user?.role !== "COURT_OWNER") {
      router.replace("/");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadVenues(0);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isAuthenticated, ready, router, user]);

  async function handleDelete(venue: VenueSummaryResponse) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa sân "${venue.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(venue.id);
      setError("");
      await venueService.remove(venue.id);

      const nextPage = venues.length === 1 && page > 0 ? page - 1 : page;
      await loadVenues(nextPage);
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể xóa sân.",
        );
      } else {
        setError("Đã xảy ra lỗi khi xóa sân.");
      }
    } finally {
      setActionId(null);
    }
  }

  async function handleStatusChange(venue: VenueSummaryResponse) {
    const nextStatus: VenueStatus =
      venue.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      setActionId(venue.id);
      setError("");

      const updatedVenue = await venueService.updateStatus(
        venue.id,
        nextStatus,
      );

      setVenues((currentVenues) =>
        currentVenues.map((currentVenue) =>
          currentVenue.id === updatedVenue.id
            ? updatedVenue
            : currentVenue,
        ),
      );
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể cập nhật trạng thái sân.",
        );
      } else {
        setError("Đã xảy ra lỗi khi cập nhật trạng thái sân.");
      }
    } finally {
      setActionId(null);
    }
  }

  if (!ready || !user || user.role !== "COURT_OWNER") {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] flex-1 items-center justify-center bg-[#f6f8fb]">
        <LoaderCircle className="size-6 animate-spin text-[#ff174f]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex-1 bg-[#f1f5f9]">
      <div className="mx-auto w-full max-w-[1440px]">
        <section className="min-w-0 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#ff174f]">
                Quản trị chủ sân
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#073b77]">
                Quản lý sân tập
              </h1>
            </div>

            <Button
              nativeButton={false}
              render={<Link href="/my-venues/new" />}
              className="h-11 rounded-xl bg-[#ff174f] px-5 font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-[#e8003e]"
            >
              <Plus className="size-4" />
              Thêm sân
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-white p-4">
              <CircleAlert />
              <AlertTitle>Không thể thực hiện</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-extrabold text-[#073b77]">
                Danh sách sân
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-24">
                <LoaderCircle className="size-7 animate-spin text-[#ff174f]" />
              </div>
            ) : venues.length === 0 ? (
              <p className="py-20 text-center font-semibold text-slate-500">
                Bạn chưa có sân tập nào
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-bold">Sân tập</th>
                      <th className="px-5 py-4 font-bold">Địa chỉ</th>
                      <th className="px-5 py-4 font-bold">Trạng thái</th>
                      <th className="px-5 py-4 text-right font-bold">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {venues.map((venue) => {
                      const status = statusConfig[venue.status];
                      const canChangeStatus =
                        venue.status === "ACTIVE" ||
                        venue.status === "INACTIVE";

                      return (
                        <tr
                          key={venue.id}
                          className="transition-colors hover:bg-slate-50/80"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                {venue.banner ? (
                                  <img
                                    src={venue.banner}
                                    alt={venue.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="grid h-full place-items-center text-[#073b77]">
                                    <Building2 className="size-5" />
                                  </div>
                                )}
                              </div>
                              <span className="max-w-56 font-extrabold text-[#073b77]">
                                {venue.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex max-w-72 items-start gap-2 text-sm text-slate-500">
                              <MapPin className="mt-0.5 size-4 shrink-0 text-[#ff174f]" />
                              <span className="line-clamp-2">
                                {venue.address}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <Badge
                              className={`border-0 ${status.className}`}
                            >
                              {status.label}
                            </Badge>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              {canChangeStatus && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  disabled={actionId === venue.id}
                                  onClick={() =>
                                    handleStatusChange(venue)
                                  }
                                  title={
                                    venue.status === "ACTIVE"
                                      ? "Tạm ngưng"
                                      : "Bật hoạt động"
                                  }
                                  className="rounded-lg"
                                >
                                  <Power className="size-4" />
                                </Button>
                              )}

                              <Button
                                nativeButton={false}
                                variant="outline"
                                size="icon"
                                render={
                                  <Link
                                    href={`/my-venues/${venue.id}/edit`}
                                  />
                                }
                                title="Chỉnh sửa"
                                className="rounded-lg text-[#073b77]"
                              >
                                <Edit3 className="size-4" />
                              </Button>

                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                disabled={actionId === venue.id}
                                onClick={() => handleDelete(venue)}
                                title="Xóa sân"
                                className="rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!loading && totalPages > 1 && (
            <nav
              aria-label="Phân trang sân của tôi"
              className="mt-6 flex items-center justify-center gap-2"
            >
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={page === 0}
                onClick={() => loadVenues(page - 1)}
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
                onClick={() => loadVenues(page + 1)}
                className="rounded-xl bg-white"
              >
                <ChevronRight />
              </Button>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
