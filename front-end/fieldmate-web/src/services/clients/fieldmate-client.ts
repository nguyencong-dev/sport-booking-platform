import axios from "axios";
import cookies from "react-cookies";

import { API_CONFIG } from "@/configs/api.config";

if (!API_CONFIG.fieldmateURL) {
  throw new Error("NEXT_PUBLIC_FIELDMATE_API_URL chưa được cấu hình");
}

export const fieldmateClient = axios.create({
  baseURL: API_CONFIG.fieldmateURL,
  timeout: API_CONFIG.timeout,
  headers: {
    Accept: "application/json",
  },
});

fieldmateClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = cookies.load("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

fieldmateClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url === "/auth/login";

    if (
      typeof window !== "undefined" &&
      error.response?.status === 401 &&
      !isLoginRequest
    ) {
      cookies.remove("token", {
        path: "/",
      });

      window.location.replace("/login");
    }

    return Promise.reject(error);
  },
);
