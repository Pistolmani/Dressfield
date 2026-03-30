"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import api, { setAccessToken } from "./api";
import type { User, LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleAuthResponse = useCallback((data: AuthResponse) => {
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  useEffect(() => {
    api
      .post<AuthResponse>("/api/auth/refresh")
      .then(({ data }) => handleAuthResponse(data))
      .catch(() => {
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [handleAuthResponse]);

  const login = useCallback(
    async (data: LoginRequest) => {
      const { data: res } = await api.post<AuthResponse>("/api/auth/login", data);
      handleAuthResponse(res);
    },
    [handleAuthResponse]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const { data: res } = await api.post<AuthResponse>("/api/auth/register", data);
      handleAuthResponse(res);
    },
    [handleAuthResponse]
  );

  const logout = useCallback(async () => {
    await api.post("/api/auth/logout");
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAdmin: user?.role === "Admin" }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
