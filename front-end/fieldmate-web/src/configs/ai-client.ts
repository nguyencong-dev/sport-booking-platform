import axios from "axios";
import cookies from "react-cookies";

import { API_CONFIG } from "@/configs/api.config";

export const aiEndpoints = {
  chat: "/chat",
  conversations: "/conversations",
  conversation: (conversationId: number) =>
    `/conversations/${conversationId}`,
  conversationMessages: (conversationId: number) =>
    `/conversations/${conversationId}/messages`,
  documents: "/admin/documents",
  document: (documentId: number) =>
    `/admin/documents/${documentId}`,
  uploadDocument: "/admin/documents/upload",
  restoreDocument: (documentId: number) =>
    `/admin/documents/${documentId}/restore`,
  permanentlyDeleteDocument: (documentId: number) =>
    `/admin/documents/${documentId}/permanent`,
  reindexDocument: (documentId: number) =>
    `/admin/documents/${documentId}/reindex`,
  retryDocument: (documentId: number) =>
    `/admin/documents/${documentId}/retry`,
} as const;

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
