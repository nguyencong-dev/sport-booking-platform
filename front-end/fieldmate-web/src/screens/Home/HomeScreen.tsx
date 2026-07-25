"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CircleAlert } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { HeroBanner } from "@/components/HeroBanner/HeroBanner";
import {
  VenueSearch,
  type VenueSearchFilters,
} from "@/components/VenueSearch/VenueSearch";
import { VenueList } from "@/components/VenueList/VenueList";
import { venueService } from "@/services/venue.service";
import type { VenueSummaryResponse } from "@/types/venue";

type ApiErrorResponse = {
  message?: string;
};

function VenueListSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-xl border bg-card"
        >
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-4 p-5">
            <div className="flex gap-3">
              <Skeleton className="size-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomeScreen() {
  const [venues, setVenues] = useState<VenueSummaryResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadVenues() {
      try {
        setLoading(true);
        setError("");

        const pageData = await venueService.getAll();

        if (active) {
          setVenues(pageData.content);
          setTotalElements(pageData.totalElements);
        }
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
          setError("Đã xảy ra lỗi không xác định.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadVenues();

    return () => {
      active = false;
    };
  }, []);

  async function handleSearch(filters: VenueSearchFilters) {
    try {
      setLoading(true);
      setError("");

      const pageData = await venueService.getAll({
        name: filters.name,
        sportTypeId: filters.sportTypeId,
        page: 0,
      });
      let data = pageData.content;

      if (filters.address) {
        const normalizedAddress = filters.address
          .trim()
          .toLocaleLowerCase("vi");

        data = data.filter(
          (venue) =>
            venue.address
              .trim()
              .toLocaleLowerCase("vi")
              .includes(normalizedAddress),
        );
      }

      setVenues(data);
      setTotalElements(
        filters.address ? data.length : pageData.totalElements,
      );
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể tìm kiếm sân theo điều kiện đã chọn.",
        );
      } else {
        setError("Đã xảy ra lỗi khi tìm kiếm sân.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1">
      <HeroBanner />
      <VenueSearch
        searching={loading}
        onSearch={handleSearch}
      />

      <section
        id="venue-list"
        className="mx-auto w-full max-w-[1280px] scroll-mt-24 px-4 pb-14 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8"
      >
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.03em] text-[#073b77] sm:text-3xl">
              Sân tập nổi bật
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading
                ? "Đang cập nhật dữ liệu..."
                : `${totalElements} sân trên hệ thống`}
            </p>
          </div>
          <Link
            href="/venues"
            className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-[#073b77] transition-colors hover:text-[#ff174f]"
          >
            Xem tất cả sân
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <VenueListSkeleton />
        ) : error ? (
          <Alert variant="destructive" className="mx-auto max-w-2xl p-4">
            <CircleAlert />
            <AlertTitle>Không thể tải dữ liệu</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <VenueList venues={venues} />
        )}
      </section>
    </main>
  );
}
