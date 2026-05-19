"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, RegisterRequest } from "../types";
import { api } from "../lib/api";
import {
  clearAuthStorage,
  getStoredToken,
  isStoredTokenUsable,
} from "../lib/authToken";
import { isAxiosError } from "axios";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isTokenValid: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

function isAuthSessionError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  if (status === 401 || status === 403) return true;
  if (status === 400) {
    const data = error.response?.data;
    const message =
      typeof data === "string"
        ? data
        : typeof data === "object" && data && "message" in data
          ? String((data as { message: unknown }).message)
          : "";
    return message.toLowerCase().includes("not authenticated");
  }
  return false;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!isStoredTokenUsable()) {
          if (getStoredToken()) {
            clearAuthStorage();
          }
          return;
        }

        const response = await api.get("/auth/me");
        if (response.data) {
          setUser(response.data);
        } else {
          clearAuthStorage();
        }
      } catch (error) {
        if (isAuthSessionError(error)) {
          clearAuthStorage();
          return;
        }
        console.error("Auth initialization error:", error);
        clearAuthStorage();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user: userData } = response.data;

    localStorage.setItem("token", token);
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
    setUser(userData);
  };

  const register = async (data: RegisterRequest) => {
    const response = await api.post("/auth/register", data);
    const { token, user: userData } = response.data;

    localStorage.setItem("token", token);
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
    setUser(userData);
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
  };

  const isTokenValid = (): boolean => {
    return isStoredTokenUsable();
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isTokenValid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
