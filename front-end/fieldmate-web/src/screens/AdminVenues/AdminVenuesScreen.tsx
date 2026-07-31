"use client";

import axios from "axios";
import Link from "next/link";
import { Check, ExternalLink, MapPin, X } from "lucide-react";
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

type VenueDecision = {
  venue: VenueSummaryResponse;
  status: Extract<VenueStatus, "ACTIVE" | "REJECTED">;
};

export function AdminVenuesScreen() {
  const [venues, setVenues] = useState<VenueSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [decision, setDecision] = useState<VenueDecision | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVenues() {
      try {
        setLoading(true);
        setError("");
        setVenues(await venueService.getPending());
      } catch (requestError) {
        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải danh sách sân chờ duyệt.",
          );
        } else {
          setError("Đã xảy ra lỗi khi tải danh sách sân.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadVenues();
  }, []);

  async function handleDecision() {
    if (!decision) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      await venueService.updateStatus(
        decision.venue.id,
        decision.status,
      );
      setVenues((currentVenues) =>
        currentVenues.filter(
          (venue) => venue.id !== decision.venue.id,
        ),
      );
      setDecision(null);
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể cập nhật trạng thái sân.",
        );
      } else {
        setError("Đã xảy ra lỗi khi duyệt sân.");
      }
    } finally {
      setUpdating(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Kiểm duyệt nội dung"
        title="Sân chờ duyệt"
      />

      <AdminError message={error} />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <AdminLoading />
        ) : venues.length === 0 ? (
          <AdminEmpty label="Hiện không có sân nào đang chờ duyệt." />
        ) : (
          <div className="divide-y divide-slate-100">
            {venues.map((venue) => (
              <article
                key={venue.id}
                className="flex flex-col gap-5 p-5 md:flex-row md:items-center"
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
                    <AdminStatusBadge label="Chờ duyệt" tone="amber" />
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

                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setDecision({
                        venue,
                        status: "REJECTED",
                      })
                    }
                    className="h-10 flex-1 rounded-xl border-red-200 font-bold text-red-600 hover:bg-red-50 md:flex-none"
                  >
                    <X className="size-4" />
                    Từ chối
                  </Button>
                  <Button
                    type="button"
                    onClick={() =>
                      setDecision({
                        venue,
                        status: "ACTIVE",
                      })
                    }
                    className="h-10 flex-1 rounded-xl bg-emerald-600 px-4 font-bold text-white hover:bg-emerald-700 md:flex-none"
                  >
                    <Check className="size-4" />
                    Phê duyệt
                  </Button>
                </div>
              </article>
            ))}
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
            ? "Phê duyệt sân?"
            : "Từ chối sân?"
        }
        description={
          decision?.status === "ACTIVE"
            ? `${decision.venue.name} sẽ được chuyển sang trạng thái hoạt động.`
            : `${decision?.venue.name ?? "Sân"} sẽ bị từ chối và không hiển thị công khai.`
        }
        confirmLabel={
          decision?.status === "ACTIVE" ? "Phê duyệt" : "Từ chối"
        }
        variant={
          decision?.status === "ACTIVE" ? "success" : "destructive"
        }
        loading={updating}
        onConfirm={handleDecision}
      />
    </>
  );
}
