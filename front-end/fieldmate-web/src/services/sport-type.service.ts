import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type { SportTypeResponse } from "@/types/sport-type";

export const sportTypeService = {
  async getAll() {
    const response =
      await fieldmateClient.get<SportTypeResponse[]>("/sport-types");

    return response.data;
  },
};
