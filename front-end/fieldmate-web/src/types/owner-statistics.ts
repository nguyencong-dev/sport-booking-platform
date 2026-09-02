export type StatisticsGranularity = "DAY" | "WEEK" | "MONTH";

export type CourtRankingMetric = "REVENUE" | "BOOKING_COUNT" | "BOOKED_HOURS";

export type StatisticsFilterParams = {
  from: string;
  to: string;
  venueId?: number;
  courtId?: number;
};

export type PeriodStatisticsParams = StatisticsFilterParams & {
  granularity: StatisticsGranularity;
};

export type CourtRankingParams = Omit<StatisticsFilterParams, "courtId"> & {
  metric: CourtRankingMetric;
  limit: number;
};

export type RevenueStatisticsResponse = {
  periodStart: string;
  revenue: number;
};

export type BookingStatisticsResponse = {
  periodStart: string;
  bookingCount: number;
};

export type PeakHourStatisticsResponse = {
  dayOfWeek: number;
  hourOfDay: number;
  bookedHours: number;
};

export type CourtRankingResponse = {
  courtId: number;
  courtName: string;
  venueName: string;
  value: number;
};
