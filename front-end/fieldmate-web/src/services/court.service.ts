import {
  fieldmateClient,
  fieldmateEndpoints,
} from "@/configs/fieldmate-client";
import type {
  CourtRequest,
  CourtResponse,
  CourtStatus,
} from "@/types/court";

export const courtService = {
  async getByVenueId(venueId: number) {
    const response = await fieldmateClient.get<CourtResponse[]>(
      fieldmateEndpoints.venueCourts(venueId),
    );

    return response.data;
  },

  async getById(courtId: number) {
    const response = await fieldmateClient.get<CourtResponse>(
      fieldmateEndpoints.court(courtId),
    );

    return response.data;
  },

  async create(venueId: number, data: CourtRequest) {
    const response = await fieldmateClient.post<CourtResponse>(
      fieldmateEndpoints.secureVenueCourts(venueId),
      data,
    );

    return response.data;
  },

  async update(courtId: number, data: CourtRequest) {
    const response = await fieldmateClient.put<CourtResponse>(
      fieldmateEndpoints.secureCourt(courtId),
      data,
    );

    return response.data;
  },

  async updateStatus(courtId: number, status: CourtStatus) {
    const response = await fieldmateClient.patch<CourtResponse>(
      fieldmateEndpoints.courtStatus(courtId),
      undefined,
      {
        params: { status },
      },
    );

    return response.data;
  },

  async remove(courtId: number) {
    await fieldmateClient.delete(
      fieldmateEndpoints.secureCourt(courtId),
    );
  },
};
