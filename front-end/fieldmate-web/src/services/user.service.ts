import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type {
  UpdateUserRequest,
  UserResponse,
} from "@/types/auth";

export const userService = {
  async getCurrentUser(): Promise<UserResponse> {
    const response =
      await fieldmateClient.get<UserResponse>("/secure/users/me");

    return response.data;
  },

  async updateCurrentUser(
    request: UpdateUserRequest,
  ): Promise<UserResponse> {
    const formData = new FormData();

    formData.append("firstName", request.firstName.trim());
    formData.append("lastName", request.lastName.trim());
    formData.append("phoneNumber", request.phoneNumber.trim());

    if (request.avatar) {
      formData.append("avatar", request.avatar);
    }

    const response =
      await fieldmateClient.put<UserResponse>(
        "/secure/users/me",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

    return response.data;
  },
};
