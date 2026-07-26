import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type { UserResponse } from "@/types/auth";

export const userService = {
  async getCurrentUser(): Promise<UserResponse> {
    const response =
      await fieldmateClient.get<UserResponse>("/secure/users/me");

    return response.data;
  },
};
