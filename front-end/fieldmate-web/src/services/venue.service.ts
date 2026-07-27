import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type { PageResponse } from "@/types/pagination";
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
      "/venues",
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
      `/venues/${venueId}`,
    );

    return response.data;
  },

  async getMyVenues(page = 0) {
    const response = await fieldmateClient.get<
      PageResponse<VenueSummaryResponse>
    >("/secure/venues/me", {
      params: {
        page,
      },
    });

    return response.data;
  },

  async create(data: VenueUpsertRequest) {
    const response = await fieldmateClient.post<VenueSummaryResponse>(
      "/secure/venues",
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
      `/secure/venues/${venueId}`,
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
    await fieldmateClient.delete(`/secure/venues/${venueId}`);
  },

  async updateStatus(venueId: number, status: VenueStatus) {
    const response = await fieldmateClient.patch<VenueSummaryResponse>(
      `/secure/venues/${venueId}/status`,
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
