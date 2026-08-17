import {
  fieldmateClient,
  fieldmateEndpoints,
} from "@/configs/fieldmate-client";
import type {
  SportTypeRequest,
  SportTypeResponse,
} from "@/types/sport-type";

export const sportTypeService = {
  async getAll() {
    const response =
      await fieldmateClient.get<SportTypeResponse[]>(
        fieldmateEndpoints.sportTypes,
      );

    return response.data;
  },

  async create(request: SportTypeRequest) {
    const response = await fieldmateClient.post<SportTypeResponse>(
      fieldmateEndpoints.secureSportTypes,
      request,
    );

    return response.data;
  },

  async update(sportTypeId: number, request: SportTypeRequest) {
    const response = await fieldmateClient.put<SportTypeResponse>(
      fieldmateEndpoints.secureSportType(sportTypeId),
      request,
    );

    return response.data;
  },

  async remove(sportTypeId: number) {
    await fieldmateClient.delete(
      fieldmateEndpoints.secureSportType(sportTypeId),
    );
  },
};
