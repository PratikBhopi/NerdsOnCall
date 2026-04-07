"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, LoginRequest, RegisterRequest } from "../types";
import { api } from "../lib/api";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("AuthContext: Initializing auth, token exists:", !!token);

        if (token) {
          // Check if token is expired before making API call
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const now = Math.floor(Date.now() / 1000);

            console.log("AuthContext: Token payload:", payload);
            console.log(
              "AuthContext: Token expires at:",
              payload.exp,
              "Current time:",
              now
            );

            if (payload.exp && payload.exp < now) {
              // Token is expired, clear it
              console.log("AuthContext: Token is expired, clearing...");
              localStorage.removeItem("token");
              document.cookie =
                "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              return;
            }
          } catch (tokenError) {
            // Invalid token format, clear it
            console.log(
              "AuthContext: Invalid token format, clearing...",
              tokenError
            );
            localStorage.removeItem("token");
            document.cookie =
              "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            return;
          }

          console.log("AuthContext: Making API call to /auth/me");
          const response = await api.get("/auth/me");
          console.log("AuthContext: User data received:", response.data);
          setUser(response.data);
        } else {
          console.log("AuthContext: No token found");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("token");
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } finally {
        console.log("AuthContext: Setting loading to false");
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem("token", token);
      // Also set cookie for middleware
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await api.post("/auth/register", data);
      const { token, user: userData } = response.data;

      localStorage.setItem("token", token);
      // Also set cookie for middleware
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    // Clear cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
  };

  // Check if the current token is valid (not expired)
  const isTokenValid = (): boolean => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      // Check if token is expired (with 5 minute buffer)
      return payload.exp > currentTime + 300;
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    setUser,
    login,
    register,
    logout,
    loading,
    isTokenValid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
