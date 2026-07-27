import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type {
  BenefitRequest,
  BenefitResponse,
} from "@/types/benefit";

export const benefitService = {
  async create(venueId: number, data: BenefitRequest) {
    const response = await fieldmateClient.post<BenefitResponse>(
      `/secure/venues/${venueId}/benefits`,
      data,
    );

    return response.data;
  },

  async update(benefitId: number, data: BenefitRequest) {
    const response = await fieldmateClient.put<BenefitResponse>(
      `/secure/benefits/${benefitId}`,
      data,
    );

    return response.data;
  },

  async remove(benefitId: number) {
    await fieldmateClient.delete(`/secure/benefits/${benefitId}`);
  },
};
