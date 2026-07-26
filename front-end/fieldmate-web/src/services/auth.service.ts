import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from "@/types/auth";

export const authService = {
  async login(request: LoginRequest) {
    const response = await fieldmateClient.post<AuthResponse>(
      "/auth/login",
      request,
    );

    return response.data;
  },

  async register(request: RegisterRequest) {
    const formData = new FormData();

    formData.append("email", request.email.trim());
    formData.append("password", request.password);
    formData.append("phoneNumber", request.phoneNumber.trim());
    formData.append("firstName", request.firstName.trim());
    formData.append("lastName", request.lastName.trim());

    if (request.avatar) {
      formData.append("avatar", request.avatar);
    }

    const response = await fieldmateClient.post<UserResponse>(
      "/auth/register",
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
