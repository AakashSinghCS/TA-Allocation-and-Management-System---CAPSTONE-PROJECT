
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

const VALID_TOKEN =
  "AAA." +
  // base64url of {"sub":"x","userId":1,"roles":[],"iat":1,"exp":9999999999}
  "eyJzdWIiOiJ4IiwidXNlcklkIjoxLCJyb2xlcyI6W10sImlhdCI6MSwiZXhwIjo5OTk5OTk5OTk5OX0." +
  "CCC";

const TestComponent = () => {
  const { token, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="token">{token || ""}</span>
      <span data-testid="auth">{isAuthenticated ? "true" : "false"}</span>
      <button data-testid="login-btn" onClick={() => login({ token: VALID_TOKEN })}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe("AuthContext & useAuth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("throws if used outside of AuthProvider", () => {
    
    const origErr = console.error;
    console.error = vi.fn();

    expect(() => render(<TestComponent />)).toThrow(
      "useAuth must be used within an AuthProvider"
    );

    console.error = origErr;
  });

  it("defaults to no token and isAuthenticated=false", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId("token")).toHaveTextContent("");
    expect(screen.getByTestId("auth")).toHaveTextContent("false");
  });

  it("login() stores a valid token and flips isAuthenticated to true", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId("login-btn"));

    // After login, the token should be set in localStorage
    expect(localStorage.getItem("token")).toBe(VALID_TOKEN);

    // The context should reflect the new token and authentication state
    expect(screen.getByTestId("token")).toHaveTextContent(VALID_TOKEN);
    expect(screen.getByTestId("auth")).toHaveTextContent("true");
  });

  it("logout() clears the token and flips isAuthenticated to false", () => {
    // First, simulate a login to set up the context
    localStorage.setItem("token", VALID_TOKEN);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("token")).toHaveTextContent(VALID_TOKEN);
    expect(screen.getByTestId("auth")).toHaveTextContent("true");

    fireEvent.click(screen.getByTestId("logout-btn"));

    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByTestId("token")).toHaveTextContent("");
    expect(screen.getByTestId("auth")).toHaveTextContent("false");
  });
});
