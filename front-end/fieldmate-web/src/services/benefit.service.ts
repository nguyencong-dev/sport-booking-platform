import {
  fieldmateClient,
  fieldmateEndpoints,
} from "@/configs/fieldmate-client";
import type {
  BenefitRequest,
  BenefitResponse,
} from "@/types/benefit";

export const benefitService = {
  async create(venueId: number, data: BenefitRequest) {
    const response = await fieldmateClient.post<BenefitResponse>(
      fieldmateEndpoints.secureVenueBenefits(venueId),
      data,
    );

    return response.data;
  },

  async update(benefitId: number, data: BenefitRequest) {
    const response = await fieldmateClient.put<BenefitResponse>(
      fieldmateEndpoints.secureBenefit(benefitId),
      data,
    );

    return response.data;
  },

  async remove(benefitId: number) {
    await fieldmateClient.delete(
      fieldmateEndpoints.secureBenefit(benefitId),
    );
  },
};
