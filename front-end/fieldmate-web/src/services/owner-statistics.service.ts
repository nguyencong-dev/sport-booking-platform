import { fieldmateClient, fieldmateEndpoints } from "@/configs/fieldmate-client";
import type { BookingStatisticsResponse, CourtRankingParams, CourtRankingResponse, PeakHourStatisticsResponse, PeriodStatisticsParams, RevenueStatisticsResponse, StatisticsFilterParams } from "@/types/owner-statistics";

export const ownerStatisticsService = {
  async getRevenue(params: PeriodStatisticsParams) {
    const response = await fieldmateClient.get<RevenueStatisticsResponse[]>(fieldmateEndpoints.ownerRevenueStatistics, { params });
    return response.data;
  },

  async getBookings(params: PeriodStatisticsParams) {
    const response = await fieldmateClient.get<BookingStatisticsResponse[]>(fieldmateEndpoints.ownerBookingStatistics, { params });
    return response.data;
  },

  async getPeakHours(params: StatisticsFilterParams) {
    const response = await fieldmateClient.get<PeakHourStatisticsResponse[]>(fieldmateEndpoints.ownerPeakHourStatistics, { params });
    return response.data;
  },

  async getCourtRanking(params: CourtRankingParams) {
    const response = await fieldmateClient.get<CourtRankingResponse[]>(fieldmateEndpoints.ownerCourtRanking, { params });
    return response.data;
  },
};
