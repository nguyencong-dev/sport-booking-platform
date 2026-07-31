import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type {
  SportTypeRequest,
  SportTypeResponse,
} from "@/types/sport-type";

export const sportTypeService = {
  async getAll() {
    const response =
      await fieldmateClient.get<SportTypeResponse[]>("/sport-types");

    return response.data;
  },

  async create(request: SportTypeRequest) {
    const response = await fieldmateClient.post<SportTypeResponse>(
      "/secure/sport-types",
      request,
    );

    return response.data;
  },

  async update(sportTypeId: number, request: SportTypeRequest) {
    const response = await fieldmateClient.put<SportTypeResponse>(
      `/secure/sport-types/${sportTypeId}`,
      request,
    );

    return response.data;
  },

  async remove(sportTypeId: number) {
    await fieldmateClient.delete(
      `/secure/sport-types/${sportTypeId}`,
    );
  },
};
