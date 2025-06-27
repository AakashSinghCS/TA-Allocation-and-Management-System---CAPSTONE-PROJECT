import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import type { AuthResponse } from "../interfaces/auth/AuthResponse";
import { act } from "react-dom/test-utils";

function buildJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${header}.${body}.signature`;
}

const fakePayload = {
  sub: "user@example.com",
  userId: 123,
  roles: ["ROLE_STUDENT"],
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
};

const fakeToken = buildJwt(fakePayload);

const TestComponent = () => {
  const { login, logout, token, isAuthenticated, userRoles, userId } = useAuth();

  return (
    <div>
      <button onClick={() => login({ token: fakeToken } as AuthResponse)}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <div>Token: {token}</div>
      <div>Auth: {isAuthenticated ? "true" : "false"}</div>
      <div>Role: {userRoles.join(", ")}</div>
      <div>UserID: {userId}</div>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initially not authenticated", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByText("Auth: false")).toBeInTheDocument();
    expect(screen.getByText("Token:")).toBeInTheDocument();
    expect(screen.getByText("Role:")).toBeInTheDocument();
    expect(screen.getByText("UserID: 0")).toBeInTheDocument();
  });

  it("logs in and sets token, role, and userId", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByText("Login").click();
    });

    await waitFor(() => {
      expect(screen.getByText(`Token: ${fakeToken}`)).toBeInTheDocument();
      expect(screen.getByText("Auth: true")).toBeInTheDocument();
      expect(screen.getByText("Role: STUDENT")).toBeInTheDocument();
      expect(screen.getByText("UserID: 123")).toBeInTheDocument();
    });
  });

  it("logs out and clears token", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // login
    act(() => {
      screen.getByText("Login").click();
    });

    await waitFor(() => {
      expect(screen.getByText("Auth: true")).toBeInTheDocument();
    });

    // logout
    act(() => {
      screen.getByText("Logout").click();
    });

    await waitFor(() => {
      expect(screen.getByText("Auth: false")).toBeInTheDocument();
      expect(screen.getByText("Token:")).toBeInTheDocument();
      expect(screen.getByText("Role:")).toBeInTheDocument();
      expect(screen.getByText("UserID: 0")).toBeInTheDocument();
    });
  });
});
