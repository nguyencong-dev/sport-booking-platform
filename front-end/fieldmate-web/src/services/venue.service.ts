import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type { PageResponse } from "@/types/pagination";
import type {
  VenueDetailResponse,
  VenueStatus,
  VenueSummaryResponse,
} from "@/types/venue";

type GetVenuesParams = {
  name?: string;
  sportTypeId?: number;
  status?: VenueStatus;
  page?: number;
};

export const venueService = {
  async getAll(params: GetVenuesParams = {}) {
    const response = await fieldmateClient.get<
      PageResponse<VenueSummaryResponse>
    >(
      "/venues",
      {
        params: {
          name: params.name?.trim() || undefined,
          sportTypeId: params.sportTypeId,
          status: params.status,
          page: params.page ?? 0,
        },
      },
    );

    return response.data;
  },

  async getById(venueId: number) {
    const response = await fieldmateClient.get<VenueDetailResponse>(
      `/venues/${venueId}`,
    );

    return response.data;
  },
};
