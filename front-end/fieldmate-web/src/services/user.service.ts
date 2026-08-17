import {
  fieldmateClient,
  fieldmateEndpoints,
} from "@/configs/fieldmate-client";
import type {
  UpdateUserRequest,
  UserResponse,
} from "@/types/auth";
import type { PageResponse } from "@/types/pagination";

type GetUsersParams = {
  email?: string;
  enabled?: boolean;
  page?: number;
};

export const userService = {
  async getCurrentUser(): Promise<UserResponse> {
    const response =
      await fieldmateClient.get<UserResponse>(
        fieldmateEndpoints.currentUser,
      );

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
        fieldmateEndpoints.currentUser,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

    return response.data;
  },

  async getAll(
    params: GetUsersParams = {},
  ): Promise<PageResponse<UserResponse>> {
    const response = await fieldmateClient.get<
      PageResponse<UserResponse>
    >(fieldmateEndpoints.users, {
      params: {
        email: params.email?.trim() || undefined,
        enabled: params.enabled,
        page: params.page ?? 0,
      },
    });

    return response.data;
  },

  async getById(userId: number): Promise<UserResponse> {
    const response = await fieldmateClient.get<UserResponse>(
      fieldmateEndpoints.user(userId),
    );

    return response.data;
  },

  async updateEnabled(
    userId: number,
    enabled: boolean,
  ): Promise<UserResponse> {
    const response = await fieldmateClient.patch<UserResponse>(
      fieldmateEndpoints.userEnabled(userId),
      undefined,
      {
        params: {
          enabled,
        },
      },
    );

    return response.data;
  },
};
