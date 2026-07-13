import axios from "axios";
import {
  clearAuthStorage,
  getStoredToken,
  isStoredTokenExpired,
} from "./authToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function isAuthMeRequest(url?: string): boolean {
  return !!url && url.includes("/auth/me");
}

function isStaleSessionResponse(status?: number, data?: unknown): boolean {
  if (status === 401 || status === 403) return true;
  if (status === 400 && typeof data === "string") {
    return data.toLowerCase().includes("not authenticated");
  }
  return false;
}

// Request interceptor to add auth token and validate expiration
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (!token) {
      return config;
    }

    if (isStoredTokenExpired()) {
      clearAuthStorage();
      return config;
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? "";
    if (isStaleSessionResponse(status, error.response?.data)) {
      const hadToken = !!getStoredToken();
      clearAuthStorage();

      if (isAuthMeRequest(requestUrl)) {
        return Promise.reject(error);
      }

      if (hadToken && typeof window !== "undefined") {
        import("react-hot-toast").then(({ default: toast }) => {
          toast.error("Your session has expired. Please log in again.");
        });

        setTimeout(() => {
          const path = window.location.pathname;
          if (!path.includes("/auth/") && !path.includes("/login")) {
            window.location.href = "/auth/login";
          }
        }, 1500);
      }

      return Promise.reject(error);
    }

    if (status && status >= 500) {
      console.error("API Error:", status, error.response?.data);
    }

    return Promise.reject(error);
  }
);
