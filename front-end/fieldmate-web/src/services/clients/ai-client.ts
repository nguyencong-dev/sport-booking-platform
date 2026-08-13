import axios from "axios";
import cookies from "react-cookies";

import { API_CONFIG } from "@/configs/api.config";

if (!API_CONFIG.aiServiceURL) {
  throw new Error("NEXT_PUBLIC_AI_API_URL chưa được cấu hình");
}

export const aiClient = axios.create({
  baseURL: API_CONFIG.aiServiceURL,
  timeout: API_CONFIG.aiTimeout,
  headers: {
    Accept: "application/json",
  },
});

aiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = cookies.load("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

aiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error.response?.status === 401
    ) {
      cookies.remove("token", {
        path: "/",
      });

      window.location.replace("/login");
    }

    return Promise.reject(error);
  },
);
