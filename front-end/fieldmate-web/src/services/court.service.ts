import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type { CourtRequest, CourtResponse } from "@/types/court";

export const courtService = {
  async getByVenueId(venueId: number) {
    const response = await fieldmateClient.get<CourtResponse[]>(
      `/venues/${venueId}/courts`,
    );

    return response.data;
  },

  async getById(courtId: number) {
    const response = await fieldmateClient.get<CourtResponse>(
      `/courts/${courtId}`,
    );

    return response.data;
  },

  async create(venueId: number, data: CourtRequest) {
    const response = await fieldmateClient.post<CourtResponse>(
      `/secure/venues/${venueId}/courts`,
      data,
    );

    return response.data;
  },

  async update(courtId: number, data: CourtRequest) {
    const response = await fieldmateClient.put<CourtResponse>(
      `/secure/courts/${courtId}`,
      data,
    );

    return response.data;
  },

  async remove(courtId: number) {
    await fieldmateClient.delete(`/secure/courts/${courtId}`);
  },
};
