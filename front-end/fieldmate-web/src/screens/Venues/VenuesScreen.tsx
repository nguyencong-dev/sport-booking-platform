"use client";

import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VenueCard } from "@/components/VenueCard/VenueCard";
import { sportTypeService } from "@/services/sport-type.service";
import { venueService } from "@/services/venue.service";
import type { SportTypeResponse } from "@/types/sport-type";
import type {
  VenueStatus,
  VenueSummaryResponse,
} from "@/types/venue";

type ApiErrorResponse = {
  message?: string;
};

const statusOptions: Array<{
  value: VenueStatus | "";
  label: string;
}> = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Tạm ngưng" },
  { value: "PENDING", label: "Chờ duyệt" },
];

function VenueGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-100 bg-white"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VenuesScreen() {
  const [venues, setVenues] = useState<VenueSummaryResponse[]>([]);
  const [sportTypes, setSportTypes] = useState<SportTypeResponse[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedSport, setSelectedSport] = useState<number | "">("");
  const [selectedStatus, setSelectedStatus] = useState<VenueStatus | "">("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVenues = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const pageData = await venueService.getAll({
        name: searchName,
        sportTypeId: selectedSport || undefined,
        status: selectedStatus || undefined,
        page,
      });

      setVenues(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể tải danh sách sân tập.",
        );
      } else {
        setError("Đã xảy ra lỗi khi tải danh sách sân tập.");
      }
    } finally {
      setLoading(false);
    }
  }, [page, searchName, selectedSport, selectedStatus]);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  useEffect(() => {
    let active = true;

    async function loadSportTypes() {
      try {
        const data = await sportTypeService.getAll();

        if (active) {
          setSportTypes(data);
        }
      } catch {
        if (active) {
          setSportTypes([]);
        }
      }
    }

    loadSportTypes();

    return () => {
      active = false;
    };
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setSearchName(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setSearchName("");
    setSelectedSport("");
    setSelectedStatus("");
    setPage(0);
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <section className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-[#ff174f]">
            <SlidersHorizontal className="size-4" />
            Khám phá sân tập
          </p>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-[#073b77] sm:text-4xl">
            Sân tập thể thao gần bạn
          </h1>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#073b77]">
                <Filter className="size-5 text-[#ff174f]" />
                Chọn lọc theo
              </h2>
              <button
                type="button"
                onClick={resetFilters}
                className="text-slate-400 transition-colors hover:text-[#ff174f]"
                aria-label="Đặt lại bộ lọc"
              >
                <RotateCcw className="size-4" />
              </button>
            </div>

            <fieldset>
              <legend className="mb-3 text-sm font-bold text-slate-900">
                Bộ môn thể thao
              </legend>
              <div className="space-y-1.5">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50">
                  <input
                    type="radio"
                    name="sport-type"
                    value=""
                    checked={selectedSport === ""}
                    onChange={() => {
                      setSelectedSport("");
                      setPage(0);
                    }}
                    className="size-4 accent-[#ff174f]"
                  />
                  Tất cả bộ môn
                </label>
                {sportTypes.map((sportType) => (
                  <label
                    key={sportType.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name="sport-type"
                      value={sportType.id}
                      checked={selectedSport === sportType.id}
                      onChange={() => {
                        setSelectedSport(sportType.id);
                        setPage(0);
                      }}
                      className="size-4 accent-[#ff174f]"
                    />
                    {sportType.name}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="my-6 h-px bg-slate-100" />

            <fieldset>
              <legend className="mb-3 text-sm font-bold text-slate-900">
                Trạng thái sân
              </legend>
              <div className="space-y-1.5">
                {statusOptions.map((status) => (
                  <label
                    key={status.value || "all"}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name="venue-status"
                      value={status.value}
                      checked={selectedStatus === status.value}
                      onChange={() => {
                        setSelectedStatus(status.value);
                        setPage(0);
                      }}
                      className="size-4 accent-[#ff174f]"
                    />
                    {status.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <Button
              type="button"
              onClick={loadVenues}
              className="mt-6 h-11 w-full rounded-xl bg-[#073b77] font-bold text-white hover:bg-[#052f61]"
            >
              Áp dụng
            </Button>
          </aside>

          <div className="min-w-0">
            <form
              onSubmit={handleSearch}
              className="mb-6 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
            >
              <Search className="ml-3 size-5 shrink-0 text-slate-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tìm kiếm tên sân tập..."
                aria-label="Tìm kiếm tên sân tập"
                className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 sm:text-base"
              />
              <Button
                type="submit"
                className="h-11 rounded-xl bg-[#ff174f] px-5 font-bold text-white hover:bg-[#e8003e]"
              >
                Tìm kiếm
              </Button>
            </form>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-[#073b77]">
                  Danh sách sân tập
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {loading
                    ? "Đang cập nhật dữ liệu..."
                    : `${totalElements} sân trên hệ thống`}
                </p>
              </div>
              {(searchName || selectedSport || selectedStatus) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#ff174f] hover:underline"
                >
                  <RotateCcw className="size-4" />
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {loading ? (
              <VenueGridSkeleton />
            ) : error ? (
              <Alert variant="destructive" className="bg-white p-4">
                <CircleAlert />
                <AlertTitle>Không thể tải dữ liệu</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : venues.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
                <h2 className="text-lg font-extrabold text-[#073b77]">
                  Không tìm thấy sân phù hợp
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Hãy thử thay đổi từ khóa hoặc bộ lọc đang chọn.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFilters}
                  className="mt-5 h-10 rounded-xl px-5 font-bold"
                >
                  Đặt lại bộ lọc
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {venues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>
            )}

            {!loading && !error && totalPages > 1 && (
              <nav
                aria-label="Phân trang danh sách sân"
                className="mt-10 flex items-center justify-center gap-2"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={page === 0}
                  onClick={() => changePage(page - 1)}
                  aria-label="Trang trước"
                  className="rounded-xl bg-white"
                >
                  <ChevronLeft />
                </Button>

                {Array.from({ length: totalPages }).map((_, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant={index === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => changePage(index)}
                    aria-label={`Trang ${index + 1}`}
                    aria-current={index === page ? "page" : undefined}
                    className={
                      index === page
                        ? "rounded-xl bg-[#ff174f] text-white hover:bg-[#e8003e]"
                        : "rounded-xl bg-white"
                    }
                  >
                    {index + 1}
                  </Button>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={page >= totalPages - 1}
                  onClick={() => changePage(page + 1)}
                  aria-label="Trang sau"
                  className="rounded-xl bg-white"
                >
                  <ChevronRight />
                </Button>
              </nav>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
