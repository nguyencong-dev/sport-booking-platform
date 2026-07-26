"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CircleAlert, LoaderCircle } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HeroBanner } from "@/components/HeroBanner/HeroBanner";
import {
  VenueSearch,
  type VenueSearchFilters,
} from "@/components/VenueSearch/VenueSearch";
import { VenueList } from "@/components/VenueList/VenueList";
import { venueService } from "@/services/venue.service";
import type {
  VenueStatus,
  VenueSummaryResponse,
} from "@/types/venue";

type ApiErrorResponse = {
  message?: string;
};

const HOME_VENUE_STATUS: VenueStatus = "ACTIVE";

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
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [activeFilters, setActiveFilters] = useState<VenueSearchFilters>({
    name: "",
  });

  useEffect(() => {
    let active = true;

    async function loadVenues() {
      try {
        setLoading(true);
        setError("");

        const pageData = await venueService.getAll({
          status: HOME_VENUE_STATUS,
          page: 0,
        });

        if (active) {
          setVenues(pageData.content);
          setCurrentPage(pageData.number);
          setHasMore(!pageData.last);
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
      setLoadMoreError("");

      const pageData = await venueService.getAll({
        name: filters.name,
        address: filters.address,
        sportTypeId: filters.sportTypeId,
        status: HOME_VENUE_STATUS,
        page: 0,
      });

      setVenues(pageData.content);
      setCurrentPage(pageData.number);
      setHasMore(!pageData.last);
      setActiveFilters(filters);
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

  async function handleLoadMore() {
    if (loadingMore || !hasMore) {
      return;
    }

    try {
      setLoadingMore(true);
      setLoadMoreError("");

      const pageData = await venueService.getAll({
        name: activeFilters.name,
        address: activeFilters.address,
        sportTypeId: activeFilters.sportTypeId,
        status: HOME_VENUE_STATUS,
        page: currentPage + 1,
      });

      setVenues((currentVenues) => {
        const venuesById = new Map(
          currentVenues.map((venue) => [venue.id, venue]),
        );

        pageData.content.forEach((venue) => {
          venuesById.set(venue.id, venue);
        });

        return Array.from(venuesById.values());
      });
      setCurrentPage(pageData.number);
      setHasMore(!pageData.last);
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setLoadMoreError(
          requestError.response?.data?.message ??
            "Không thể tải thêm sân.",
        );
      } else {
        setLoadMoreError("Đã xảy ra lỗi khi tải thêm sân.");
      }
    } finally {
      setLoadingMore(false);
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
              Cụm sân hoạt động
            </h2>
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
          <>
            <VenueList venues={venues} />

            {hasMore && venues.length > 0 && (
              <div className="mt-7 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loadingMore}
                  onClick={handleLoadMore}
                  className="h-11 min-w-40 rounded-xl border-[#073b77] px-6 font-bold text-[#073b77] hover:bg-[#073b77] hover:text-white"
                >
                  {loadingMore && (
                    <LoaderCircle className="size-4 animate-spin" />
                  )}
                  {loadingMore ? "Đang tải..." : "Xem thêm sân"}
                </Button>
              </div>
            )}

            {loadMoreError && (
              <p className="mt-3 text-center text-sm text-destructive">
                {loadMoreError}
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
