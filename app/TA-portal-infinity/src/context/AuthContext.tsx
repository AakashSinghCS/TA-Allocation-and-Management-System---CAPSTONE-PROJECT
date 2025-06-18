import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthResponse } from "../interfaces/auth/AuthResponse";
import type { DecodedToken } from "../interfaces/auth/DecodedToken";

interface AuthContextType {
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  roles: string[];
  userId: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt<T = any>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const decoded = decodeURIComponent(
      json
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  const decoded = token ? parseJwt<DecodedToken>(token) : null;
  const isAuthenticated = Boolean(token);
  const roles = decoded?.roles || [];
  const userId = decoded?.userId || 0;

  useEffect(() => {
    if (!decoded) return;

    const TTL_MS = 1000 * 60 * 60;
    const issuedAtMs = decoded.iat * 1000;
    const expiresAtMs = decoded.exp ? decoded.exp * 1000 : issuedAtMs + TTL_MS;
    const msLeft = expiresAtMs - Date.now();

    if (msLeft <= 0) {
      console.log("Token expired — clearing out");
      localStorage.removeItem("token");
      setToken(null);
    }

    // Optional debug logs
    console.log("Decoded JWT:", decoded);
    console.log("Roles:", roles);
    console.log("User ID:", userId);
  }, [token]);

  const login = (data: AuthResponse) => {
    localStorage.setItem("token", data.token);
    setToken(data.token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, login, logout, isAuthenticated, roles, userId }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
