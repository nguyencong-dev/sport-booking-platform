"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChartNoAxesCombined, CircleAlert, LoaderCircle, RefreshCcw } from "lucide-react";

import { CourtRankingChart } from "@/components/OwnerStatistics/CourtRankingChart";
import { PeakHourChart } from "@/components/OwnerStatistics/PeakHourChart";
import { RevenueChart } from "@/components/OwnerStatistics/RevenueChart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { courtService } from "@/services/court.service";
import { ownerStatisticsService } from "@/services/owner-statistics.service";
import { venueService } from "@/services/venue.service";
import type { CourtResponse } from "@/types/court";
import type { CourtRankingMetric, CourtRankingResponse, PeakHourStatisticsResponse, RevenueStatisticsResponse, StatisticsGranularity } from "@/types/owner-statistics";
import type { VenueSummaryResponse } from "@/types/venue";

type ApiErrorResponse = {
  message?: string;
};

type StatisticsData = {
  revenue: RevenueStatisticsResponse[];
  peakHours: PeakHourStatisticsResponse[];
  courtRanking: CourtRankingResponse[];
};

const emptyStatistics: StatisticsData = { revenue: [], peakHours: [], courtRanking: [] };

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const initialToDate = toDateInput(new Date());
const initialFromDate = (() => {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return toDateInput(date);
})();

const granularityLabels: Record<StatisticsGranularity, string> = { DAY: "Ngày", WEEK: "Tuần", MONTH: "Tháng" };
const metricLabels: Record<CourtRankingMetric, string> = { REVENUE: "Doanh thu", BOOKED_HOURS: "Số giờ được đặt" };

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) return error.response?.data?.message ?? fallback;
  return fallback;
}

async function getAllOwnerVenues() {
  const firstPage = await venueService.getMyVenues(0);
  const remainingPages = firstPage.totalPages > 1 ? await Promise.all(Array.from({ length: firstPage.totalPages - 1 }, (_, index) => venueService.getMyVenues(index + 1))) : [];
  return [...firstPage.content, ...remainingPages.flatMap((page) => page.content)];
}

async function getStatistics(from: string, to: string, granularity: StatisticsGranularity, metric: CourtRankingMetric, venueId: number | null, courtId: number | null): Promise<StatisticsData> {
  const commonParams = { from, to, venueId: venueId ?? undefined, courtId: courtId ?? undefined };
  const [revenue, peakHours, courtRanking] = await Promise.all([
    ownerStatisticsService.getRevenue({ ...commonParams, granularity }),
    ownerStatisticsService.getPeakHours(commonParams),
    ownerStatisticsService.getCourtRanking({ from, to, venueId: venueId ?? undefined, metric, limit: 5 }),
  ]);
  return { revenue, peakHours, courtRanking };
}

function ChartLoading() {
  return <div className="grid h-80 place-items-center"><LoaderCircle className="size-7 animate-spin text-[#ff174f]" /></div>;
}

export function OwnerStatisticsScreen() {
  const router = useRouter();
  const { user, ready, isAuthenticated } = useAuth();
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [appliedGranularity, setAppliedGranularity] = useState<StatisticsGranularity>("DAY");
  const [appliedMetric, setAppliedMetric] = useState<CourtRankingMetric>("REVENUE");
  const [appliedFilters, setAppliedFilters] = useState<{ from: string; to: string; venueId: number | null; courtId: number | null }>({ from: initialFromDate, to: initialToDate, venueId: null, courtId: null });
  const [venues, setVenues] = useState<VenueSummaryResponse[]>([]);
  const [courts, setCourts] = useState<CourtResponse[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
  const [statistics, setStatistics] = useState<StatisticsData>(emptyStatistics);
  const [loading, setLoading] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/owner-statistics");
      return;
    }
    if (user?.role !== "COURT_OWNER") {
      router.replace("/");
      return;
    }

    let active = true;
    const timeoutId = window.setTimeout(() => {
      async function initialize() {
        try {
          setLoading(true);
          setError("");
          const [ownerVenues, initialStatistics] = await Promise.all([getAllOwnerVenues(), getStatistics(initialFromDate, initialToDate, "DAY", "REVENUE", null, null)]);
          if (active) {
            setVenues(ownerVenues);
            setStatistics(initialStatistics);
          }
        } catch (requestError) {
          if (active) setError(getErrorMessage(requestError, "Không thể tải dữ liệu thống kê."));
        } finally {
          if (active) setLoading(false);
        }
      }
      void initialize();
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [isAuthenticated, ready, router, user]);

  async function handleVenueChange(value: string | null) {
    const venueId = value && value !== "ALL" ? Number(value) : null;
    setSelectedVenueId(venueId);
    setSelectedCourtId(null);
    setCourts([]);
    if (venueId === null) return;

    try {
      setLoadingCourts(true);
      setError("");
      setCourts(await courtService.getByVenueId(venueId));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể tải danh sách sân con."));
    } finally {
      setLoadingCourts(false);
    }
  }

  async function handleApplyFilters() {
    if (!fromDate || !toDate || fromDate > toDate) {
      setError("Khoảng thời gian không hợp lệ.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await getStatistics(fromDate, toDate, appliedGranularity, appliedMetric, selectedVenueId, selectedCourtId);
      setStatistics(result);
      setAppliedFilters({ from: fromDate, to: toDate, venueId: selectedVenueId, courtId: selectedCourtId });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể tải dữ liệu thống kê."));
    } finally {
      setLoading(false);
    }
  }

  async function handleRevenueGranularityChange(nextGranularity: StatisticsGranularity) {
    if (nextGranularity === appliedGranularity) return;

    try {
      setLoadingRevenue(true);
      setError("");
      const revenue = await ownerStatisticsService.getRevenue({ from: appliedFilters.from, to: appliedFilters.to, granularity: nextGranularity, venueId: appliedFilters.venueId ?? undefined, courtId: appliedFilters.courtId ?? undefined });
      setStatistics((currentStatistics) => ({ ...currentStatistics, revenue }));
      setAppliedGranularity(nextGranularity);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể tải thống kê doanh thu."));
    } finally {
      setLoadingRevenue(false);
    }
  }

  async function handleRankingMetricChange(nextMetric: CourtRankingMetric) {
    if (nextMetric === appliedMetric) return;

    try {
      setLoadingRanking(true);
      setError("");
      const courtRanking = await ownerStatisticsService.getCourtRanking({ from: appliedFilters.from, to: appliedFilters.to, venueId: appliedFilters.venueId ?? undefined, metric: nextMetric, limit: 5 });
      setStatistics((currentStatistics) => ({ ...currentStatistics, courtRanking }));
      setAppliedMetric(nextMetric);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Không thể tải xếp hạng sân."));
    } finally {
      setLoadingRanking(false);
    }
  }

  if (!ready || !user || user.role !== "COURT_OWNER") {
    return <main className="flex min-h-[calc(100vh-5rem)] flex-1 items-center justify-center bg-[#f6f8fb]"><LoaderCircle className="size-6 animate-spin text-[#ff174f]" /></main>;
  }

  return (
    <main className="min-h-screen flex-1 bg-[#f1f5f9]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#ff174f]">Quản trị chủ sân</p>
          <h1 className="mt-1 flex items-center gap-3 text-3xl font-black tracking-[-0.04em] text-[#073b77]"><ChartNoAxesCombined className="size-8" />Thống kê hoạt động</h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-white p-4">
            <CircleAlert />
            <AlertTitle>Không thể tải thống kê</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <FilterField label="Từ ngày">
              <input type="date" value={fromDate} max={toDate} onChange={(event) => setFromDate(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#073b77]" />
            </FilterField>
            <FilterField label="Đến ngày">
              <input type="date" value={toDate} min={fromDate} onChange={(event) => setToDate(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#073b77]" />
            </FilterField>
            <FilterField label="Cụm sân">
              <Select value={selectedVenueId === null ? "ALL" : String(selectedVenueId)} onValueChange={handleVenueChange}>
                <SelectTrigger className="h-11 min-h-11 w-full rounded-xl border-slate-200 px-3"><SelectValue>{(value) => value === "ALL" ? "Tất cả cụm sân" : venues.find((venue) => String(venue.id) === String(value))?.name ?? "Chọn cụm sân"}</SelectValue></SelectTrigger>
                <SelectContent><SelectItem value="ALL">Tất cả cụm sân</SelectItem>{venues.map((venue) => <SelectItem key={venue.id} value={String(venue.id)}>{venue.name}</SelectItem>)}</SelectContent>
              </Select>
            </FilterField>
            <FilterField label="Sân con">
              <Select value={selectedCourtId === null ? "ALL" : String(selectedCourtId)} onValueChange={(value) => setSelectedCourtId(value && value !== "ALL" ? Number(value) : null)} disabled={selectedVenueId === null || loadingCourts}>
                <SelectTrigger className="h-11 min-h-11 w-full rounded-xl border-slate-200 px-3"><SelectValue>{(value) => loadingCourts ? "Đang tải..." : value === "ALL" ? "Tất cả sân con" : courts.find((court) => String(court.id) === String(value))?.name ?? "Chọn sân con"}</SelectValue></SelectTrigger>
                <SelectContent><SelectItem value="ALL">Tất cả sân con</SelectItem>{courts.map((court) => <SelectItem key={court.id} value={String(court.id)}>{court.name}</SelectItem>)}</SelectContent>
              </Select>
            </FilterField>
            <div className="flex items-end">
              <Button type="button" disabled={loading} onClick={handleApplyFilters} className="h-11 w-full rounded-xl bg-[#ff174f] font-bold text-white hover:bg-[#e8003e]">
                {loading ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}Xem thống kê
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="xl:col-span-2">
            <StatisticsCard title="Doanh thu" action={
              <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                {Object.entries(granularityLabels).map(([value, label]) => {
                  const nextGranularity = value as StatisticsGranularity;
                  return <Button key={value} type="button" variant="ghost" size="sm" disabled={loading || loadingRevenue} onClick={() => handleRevenueGranularityChange(nextGranularity)} className={appliedGranularity === nextGranularity ? "rounded-lg bg-[#073b77] px-4 font-bold text-white hover:bg-[#073b77] hover:text-white" : "rounded-lg px-4 font-bold text-slate-600 hover:bg-white"}>{label}</Button>;
                })}
              </div>
            }>
              {loading || loadingRevenue ? <ChartLoading /> : <RevenueChart data={statistics.revenue} granularity={appliedGranularity} />}
            </StatisticsCard>
          </div>
          <div className="xl:col-span-2">
            <StatisticsCard title="Khung giờ">
              {loading ? <ChartLoading /> : <PeakHourChart data={statistics.peakHours} />}
            </StatisticsCard>
          </div>
          <div className="xl:col-span-2">
            <StatisticsCard title="Top sân" action={
              <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                {Object.entries(metricLabels).map(([value, label]) => {
                  const rankingMetric = value as CourtRankingMetric;
                  return <Button key={value} type="button" variant="ghost" size="sm" disabled={loading || loadingRanking} onClick={() => handleRankingMetricChange(rankingMetric)} className={appliedMetric === rankingMetric ? "rounded-lg bg-[#073b77] px-4 font-bold text-white hover:bg-[#073b77] hover:text-white" : "rounded-lg px-4 font-bold text-slate-600 hover:bg-white"}>{label}</Button>;
                })}
              </div>
            }>
              {loading || loadingRanking ? <ChartLoading /> : <CourtRankingChart data={statistics.courtRanking} metric={appliedMetric} />}
            </StatisticsCard>
          </div>
        </div>
      </div>
    </main>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="min-w-0"><span className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-500">{label}</span>{children}</label>;
}

function StatisticsCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-sm ring-1 ring-slate-200">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <CardTitle className="font-extrabold text-[#073b77]">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="p-5 sm:p-6">{children}</CardContent>
    </Card>
  );
}
