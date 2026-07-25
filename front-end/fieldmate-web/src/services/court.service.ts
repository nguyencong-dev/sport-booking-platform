import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type { CourtResponse } from "@/types/court";

export const courtService = {
  async getByVenueId(venueId: number) {
    const response = await fieldmateClient.get<CourtResponse[]>(
      `/venues/${venueId}/courts`,
    );

    return response.data;
  },
};
