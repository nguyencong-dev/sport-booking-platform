import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type { RuleRequest, RuleResponse } from "@/types/rule";

export const ruleService = {
  async create(venueId: number, data: RuleRequest) {
    const response = await fieldmateClient.post<RuleResponse>(
      `/secure/venues/${venueId}/rules`,
      data,
    );

    return response.data;
  },

  async update(ruleId: number, data: RuleRequest) {
    const response = await fieldmateClient.put<RuleResponse>(
      `/secure/rules/${ruleId}`,
      data,
    );

    return response.data;
  },

  async remove(ruleId: number) {
    await fieldmateClient.delete(`/secure/rules/${ruleId}`);
  },
};
