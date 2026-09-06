"use client";

import axios from "axios";
import Link from "next/link";
import {
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  RotateCcw,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminPageHeader,
  AdminStatusBadge,
} from "@/components/Admin/AdminPage";
import { ConfirmationDialog } from "@/components/ConfirmationDialog/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { venueService } from "@/services/venue.service";
import type {
  VenueStatus,
  VenueSummaryResponse,
} from "@/types/venue";

type ApiErrorResponse = {
  message?: string;
};

type VenueStatusFilter = "ALL" | VenueStatus;
type VenueAction = "APPROVE" | "REJECT" | "SUSPEND" | "RESTORE";

type VenueDecision = {
  venue: VenueSummaryResponse;
  action: VenueAction;
};

type DecisionPresentation = {
  status: Extract<VenueStatus, "ACTIVE" | "REJECTED">;
  title: string;
  description: string;
  confirmLabel: string;
  variant: "destructive" | "success";
  icon: LucideIcon;
};

const statusPresentation = {
  PENDING: { label: "Chờ duyệt", tone: "amber" },
  ACTIVE: { label: "Đang hoạt động", tone: "green" },
  INACTIVE: { label: "Chủ sân tạm ngưng", tone: "slate" },
  REJECTED: { label: "Bị từ chối/đình chỉ", tone: "red" },
} as const satisfies Record<
  VenueStatus,
  {
    label: string;
    tone: "green" | "amber" | "red" | "blue" | "slate";
  }
>;

const emptyLabels: Record<VenueStatusFilter, string> = {
  ALL: "Hiện chưa có sân nào trong hệ thống.",
  PENDING: "Hiện không có sân nào đang chờ duyệt.",
  ACTIVE: "Hiện không có sân nào đang hoạt động.",
  INACTIVE: "Hiện không có sân nào do chủ sân tạm ngưng.",
  REJECTED: "Hiện không có sân nào bị từ chối hoặc đình chỉ.",
};

function getDecisionPresentation(
  decision: VenueDecision,
): DecisionPresentation {
  const venueName = decision.venue.name;

  switch (decision.action) {
    case "APPROVE":
      return {
        status: "ACTIVE",
        title: "Phê duyệt sân?",
        description: `${venueName} sẽ được chuyển sang trạng thái hoạt động và có thể nhận lượt đặt mới.`,
        confirmLabel: "Phê duyệt",
        variant: "success",
        icon: Check,
      };
    case "REJECT":
      return {
        status: "REJECTED",
        title: "Từ chối sân?",
        description: `${venueName} sẽ bị từ chối và không thể nhận lượt đặt.`,
        confirmLabel: "Từ chối",
        variant: "destructive",
        icon: X,
      };
    case "SUSPEND":
      return {
        status: "REJECTED",
        title: "Đình chỉ sân?",
        description: `${venueName} sẽ không thể nhận lượt đặt mới và chủ sân không thể tự mở lại. Các lượt đặt hiện có vẫn được giữ nguyên.`,
        confirmLabel: "Đình chỉ",
        variant: "destructive",
        icon: Ban,
      };
    case "RESTORE":
      return {
        status: "ACTIVE",
        title: "Mở lại sân?",
        description: `${venueName} sẽ hoạt động trở lại và có thể nhận lượt đặt mới.`,
        confirmLabel: "Mở lại",
        variant: "success",
        icon: RotateCcw,
      };
  }
}

export function AdminVenuesScreen() {
  const [venues, setVenues] = useState<VenueSummaryResponse[]>([]);
  const [statusFilter, setStatusFilter] =
    useState<VenueStatusFilter>("PENDING");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [decision, setDecision] = useState<VenueDecision | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadVenues() {
      try {
        setLoading(true);
        setError("");

        const pageData = await venueService.getAll({
          status: statusFilter === "ALL" ? undefined : statusFilter,
          page,
        });

        if (!active) {
          return;
        }

        if (pageData.totalPages > 0 && page >= pageData.totalPages) {
          setPage(pageData.totalPages - 1);
          return;
        }

        if (pageData.totalPages === 0 && page !== 0) {
          setPage(0);
          return;
        }

        setVenues(pageData.content);
        setTotalPages(pageData.totalPages);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải danh sách sân.",
          );
        } else {
          setError("Đã xảy ra lỗi khi tải danh sách sân.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadVenues();

    return () => {
      active = false;
    };
  }, [page, refreshKey, statusFilter]);

  const decisionPresentation = decision
    ? getDecisionPresentation(decision)
    : null;

  async function handleDecision() {
    if (!decision || !decisionPresentation) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      await venueService.updateStatus(
        decision.venue.id,
        decisionPresentation.status,
      );
      setDecision(null);
      setRefreshKey((current) => current + 1);
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
      setUpdating(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Kiểm duyệt và vận hành"
        title="Quản lý sân"
        description="Phê duyệt sân mới, theo dõi trạng thái và đình chỉ sân khi cần thiết."
        action={
          <select
            aria-label="Lọc sân theo trạng thái"
            value={statusFilter}
            onChange={(event) => {
              setPage(0);
              setStatusFilter(event.target.value as VenueStatusFilter);
            }}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#ff174f] focus:ring-3 focus:ring-rose-100 sm:w-auto"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Chủ sân tạm ngưng</option>
            <option value="REJECTED">Bị từ chối/đình chỉ</option>
          </select>
        }
      />

      <AdminError message={error} />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <AdminLoading label="Đang tải danh sách sân..." />
        ) : venues.length === 0 ? (
          <AdminEmpty label={emptyLabels[statusFilter]} />
        ) : (
          <div className="divide-y divide-slate-100">
            {venues.map((venue) => {
              const currentStatus = statusPresentation[venue.status];

              return (
                <article
                  key={venue.id}
                  className="flex flex-col gap-5 p-5 transition hover:bg-slate-50/70 md:flex-row md:items-center"
                >
                  <div className="h-36 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 md:h-28 md:w-44">
                    {venue.banner ? (
                      <img
                        src={venue.banner}
                        alt={venue.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="grid size-full place-items-center">
                        <MapPin className="size-6 text-slate-400" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-black text-[#073b77]">
                        {venue.name}
                      </h2>
                      <AdminStatusBadge
                        label={currentStatus.label}
                        tone={currentStatus.tone}
                      />
                    </div>
                    <p className="mt-2 flex items-start gap-2 text-sm font-medium leading-6 text-slate-500">
                      <MapPin className="mt-1 size-4 shrink-0" />
                      {venue.address}
                    </p>
                    <Button
                      nativeButton={false}
                      render={
                        <Link
                          href={`/venues/${venue.id}`}
                          target="_blank"
                        />
                      }
                      variant="link"
                      className="mt-2 h-auto p-0 font-bold text-[#246bfe]"
                    >
                      Xem trang sân
                      <ExternalLink className="size-3.5" />
                    </Button>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {venue.status === "PENDING" && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setDecision({ venue, action: "REJECT" })
                          }
                          className="h-10 flex-1 rounded-xl border-red-200 font-bold text-red-600 hover:bg-red-50 md:flex-none"
                        >
                          <X className="size-4" />
                          Từ chối
                        </Button>
                        <Button
                          type="button"
                          onClick={() =>
                            setDecision({ venue, action: "APPROVE" })
                          }
                          className="h-10 flex-1 rounded-xl bg-emerald-600 px-4 font-bold text-white hover:bg-emerald-700 md:flex-none"
                        >
                          <Check className="size-4" />
                          Phê duyệt
                        </Button>
                      </>
                    )}

                    {(venue.status === "ACTIVE" ||
                      venue.status === "INACTIVE") && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setDecision({ venue, action: "SUSPEND" })
                        }
                        className="h-10 flex-1 rounded-xl border-red-200 font-bold text-red-600 hover:bg-red-50 md:flex-none"
                      >
                        <Ban className="size-4" />
                        Đình chỉ
                      </Button>
                    )}

                    {venue.status === "REJECTED" && (
                      <Button
                        type="button"
                        onClick={() =>
                          setDecision({ venue, action: "RESTORE" })
                        }
                        className="h-10 flex-1 rounded-xl bg-emerald-600 px-4 font-bold text-white hover:bg-emerald-700 md:flex-none"
                      >
                        <RotateCcw className="size-4" />
                        Mở lại
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {!loading && totalPages > 1 && (
        <nav
          aria-label="Phân trang danh sách sân"
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
        open={Boolean(decision)}
        onOpenChange={(open) => {
          if (!open) {
            setDecision(null);
          }
        }}
        title={decisionPresentation?.title ?? "Cập nhật trạng thái sân?"}
        description={decisionPresentation?.description ?? ""}
        confirmLabel={decisionPresentation?.confirmLabel ?? "Xác nhận"}
        variant={decisionPresentation?.variant}
        icon={decisionPresentation?.icon}
        loading={updating}
        onConfirm={handleDecision}
      />
    </>
  );
}
