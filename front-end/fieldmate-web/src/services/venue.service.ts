import {
  fieldmateClient,
  fieldmateEndpoints,
} from "@/configs/fieldmate-client";
import type { PageResponse } from "@/types/pagination";
import type { VenueBookingScheduleResponse } from "@/types/booking";
import type {
  VenueDetailResponse,
  VenueStatus,
  VenueSummaryResponse,
  VenueUpsertRequest,
} from "@/types/venue";

type GetVenuesParams = {
  name?: string;
  address?: string;
  sportTypeId?: number;
  status?: VenueStatus;
  page?: number;
};

function createVenueFormData(data: VenueUpsertRequest) {
  const formData = new FormData();

  formData.append("name", data.name.trim());
  formData.append("address", data.address.trim());

  if (data.latitude !== undefined) {
    formData.append("latitude", String(data.latitude));
  }

  if (data.longitude !== undefined) {
    formData.append("longitude", String(data.longitude));
  }

  if (data.banner) {
    formData.append("banner", data.banner);
  }

  if (data.logo) {
    formData.append("logo", data.logo);
  }

  return formData;
}

export const venueService = {
  async getAll(params: GetVenuesParams = {}) {
    const response = await fieldmateClient.get<
      PageResponse<VenueSummaryResponse>
    >(
      fieldmateEndpoints.venues,
      {
        params: {
          name: params.name?.trim() || undefined,
          address: params.address?.trim() || undefined,
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
      fieldmateEndpoints.venue(venueId),
    );

    return response.data;
  },

  async getBookingSchedule(venueId: number, date: string) {
    const response =
      await fieldmateClient.get<VenueBookingScheduleResponse>(
        fieldmateEndpoints.venueBookingSchedule(venueId),
        {
          params: {
            date,
          },
        },
      );

    return response.data;
  },

  async getMyVenues(page = 0) {
    const response = await fieldmateClient.get<
      PageResponse<VenueSummaryResponse>
    >(fieldmateEndpoints.myVenues, {
      params: {
        page,
      },
    });

    return response.data;
  },

  async getPending() {
    const response = await fieldmateClient.get<VenueSummaryResponse[]>(
      fieldmateEndpoints.pendingVenues,
    );

    return response.data;
  },

  async create(data: VenueUpsertRequest) {
    const response = await fieldmateClient.post<VenueSummaryResponse>(
      fieldmateEndpoints.secureVenues,
      createVenueFormData(data),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },

  async update(venueId: number, data: VenueUpsertRequest) {
    const response = await fieldmateClient.put<VenueSummaryResponse>(
      fieldmateEndpoints.secureVenue(venueId),
      createVenueFormData(data),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },

  async remove(venueId: number) {
    await fieldmateClient.delete(
      fieldmateEndpoints.secureVenue(venueId),
    );
  },

  async updateStatus(venueId: number, status: VenueStatus) {
    const response = await fieldmateClient.patch<VenueSummaryResponse>(
      fieldmateEndpoints.venueStatus(venueId),
      undefined,
      {
        params: {
          status,
        },
      },
    );

    return response.data;
  },
};
