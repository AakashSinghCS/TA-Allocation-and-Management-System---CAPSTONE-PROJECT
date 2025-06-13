import { createContext, useContext, useEffect, useState, type ReactNode,} from "react";
import type { AuthResponse } from "../interfaces/auth/AuthResponse";
import type { DecodedToken } from "../interfaces/auth/DecodedToken";

interface AuthContextType {
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
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
        .map((c) =>
          "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  );

  useEffect(() => {
    if (!token) return;

   
    const raw = parseJwt<{
      sub: string;
      userId: number;
      roles: string[];
      iat: number;
      exp?: number;
    }>(token);

    if (!raw || typeof raw.iat !== "number") {
      console.error("Could not parse JWT — clearing token");
      localStorage.removeItem("token");
      setToken(null);
      return;
    }

    const TTL_MS = 1000 * 60 * 60;     
    const issuedAtMs = raw.iat * 1000;
    const expiresAtMs =
      raw.exp !== undefined
        ? raw.exp * 1000
        : issuedAtMs + TTL_MS;

    const msLeft = expiresAtMs - Date.now();

    const decoded = {
      ...raw,
      get email() {
        return raw.sub;
      },
      get expiresAt() {
        return new Date(expiresAtMs);
      },
    } as DecodedToken;

    // Log for development only
    console.log("Decoded JWT:", decoded);
    console.log("JWT token:", token);
    console.log("Email:", decoded.email);
    console.log("User ID:", decoded.userId);
    console.log("Roles:", decoded.roles);
    console.log("Issued at:", new Date(issuedAtMs));
    console.log("Expires at:", decoded.expiresAt, `(in ${msLeft} ms)`);

    if (msLeft <= 0) {
      console.log("Token expired — clearing out");
      localStorage.removeItem("token");
      setToken(null);
    }
  }, [token]);

  const login = (data: AuthResponse) => {
    localStorage.setItem("token", data.token);
    setToken(data.token);
    console.log("Login successful, token set:", data.token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{ token, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
