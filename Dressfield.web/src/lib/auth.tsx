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
import { getServerCart, syncServerCart } from "@/lib/cart-api";
import { mapServerCartToLocal, mergeCarts } from "@/lib/cart-merge";
import { setCartSyncSuppressed, useCartStore } from "@/stores/cart-store";
import type { User, LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
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

  const hydrateCartAfterAuth = useCallback(async (mode: "merge" | "replace") => {
    setCartSyncSuppressed(true);

    try {
      const serverCart = await getServerCart();
      const localItems = useCartStore.getState().items;
      const serverItemsAsLocal = mapServerCartToLocal(serverCart.items);

      if (mode === "replace") {
        useCartStore.getState().setItems(serverItemsAsLocal);
        return;
      }

      const merged = mergeCarts(localItems, serverCart.items);
      useCartStore.getState().setItems(merged);
      await syncServerCart(merged);
    } catch {
      // Keep local cart as the fallback source of truth when sync fails.
    } finally {
      setCartSyncSuppressed(false);
    }
  }, []);

  useEffect(() => {
    api
      .post<AuthResponse>("/api/auth/refresh")
      .then(async ({ data }) => {
        handleAuthResponse(data);
        await hydrateCartAfterAuth("replace");
      })
      .catch(() => {
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [handleAuthResponse, hydrateCartAfterAuth]);

  const login = useCallback(
    async (data: LoginRequest) => {
      const { data: res } = await api.post<AuthResponse>("/api/auth/login", data);
      handleAuthResponse(res);
      await hydrateCartAfterAuth("merge");
    },
    [handleAuthResponse, hydrateCartAfterAuth]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const { data: res } = await api.post<AuthResponse>("/api/auth/register", data);
      handleAuthResponse(res);
      await hydrateCartAfterAuth("merge");
    },
    [handleAuthResponse, hydrateCartAfterAuth]
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const { data: res } = await api.post<AuthResponse>("/api/auth/google", { idToken });
      handleAuthResponse(res);
      await hydrateCartAfterAuth("merge");
    },
    [handleAuthResponse, hydrateCartAfterAuth]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Best effort logout. Clear local auth state even if the request fails.
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, logout, isAdmin: user?.role === "Admin" }}
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
