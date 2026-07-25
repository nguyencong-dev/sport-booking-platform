import axios from "axios";
import { API_CONFIG } from "@/configs/api.config";

if (!API_CONFIG.fieldmateURL) {
    throw new Error("NEXT_PUBLIC_FIELDMATE_API_URL chưa được cấu hình");
}

export const fieldmateClient = axios.create({
    baseURL: API_CONFIG.fieldmateURL,
    timeout: API_CONFIG.timeout,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

fieldmateClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});
