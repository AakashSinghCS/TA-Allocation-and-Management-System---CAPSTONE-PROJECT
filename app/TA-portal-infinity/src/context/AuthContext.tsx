
import { createContext, useContext, useEffect, useState, type ReactNode,} from "react";
import type { AuthResponse } from "../interfaces/auth/AuthResponse";
import type { DecodedToken } from "../interfaces/auth/DecodedToken";
import type { UserRole } from "../interfaces/enum/UserRole";


interface AuthContextType {
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  userRoles: UserRole[];
  userId: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function parseJwt<T = any>(token: string): T | null {
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
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  );

  // raw claims roles include "ROLE_" 
  const raw = token
    ? parseJwt<{
        sub: string;
        userId: number;
        roles: string[];   // raw roles from JWT
        iat: number;
        exp: number;
      }>(token)
    : null;

  // Strip "ROLE_" prefix and cast to UserRole
  const normalizedRoles: UserRole[] = raw?.roles
    .map(r => r.replace(/^ROLE_/, "") as UserRole) ?? [];

  // Building your DecodedToken with clean roles
  const decoded: DecodedToken | null = raw
    ? {
        sub: raw.sub,
        userId: raw.userId,
        roles: normalizedRoles,
        issuedAt: raw.iat,
        expiration: raw.exp,
      }
    : null;

  const isAuthenticated = Boolean(token);
  const userRoles = decoded?.roles ?? [];
  const userId = decoded?.userId ?? 0;

  useEffect(() => {
    if (!decoded) return;
    const expiresAtMs = decoded.expiration * 1000;
    if (Date.now() >= expiresAtMs) {
      localStorage.removeItem("token");
      setToken(null);
    }
  }, [token, decoded]);

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
      value={{ token, login, logout, isAuthenticated, userRoles, userId }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
