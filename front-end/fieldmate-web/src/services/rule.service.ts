import {
  fieldmateClient,
  fieldmateEndpoints,
} from "@/configs/fieldmate-client";
import type { RuleRequest, RuleResponse } from "@/types/rule";

export const ruleService = {
  async create(venueId: number, data: RuleRequest) {
    const response = await fieldmateClient.post<RuleResponse>(
      fieldmateEndpoints.secureVenueRules(venueId),
      data,
    );

    return response.data;
  },

  async update(ruleId: number, data: RuleRequest) {
    const response = await fieldmateClient.put<RuleResponse>(
      fieldmateEndpoints.secureRule(ruleId),
      data,
    );

    return response.data;
  },

  async remove(ruleId: number) {
    await fieldmateClient.delete(fieldmateEndpoints.secureRule(ruleId));
  },
};
