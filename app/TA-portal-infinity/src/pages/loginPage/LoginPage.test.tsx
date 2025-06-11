import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

// Helper to render inside a Router
const customRender = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("LoginPage", () => {
  it("renders headings and login form", () => {
    customRender(<LoginPage />);
    expect(screen.getByText(/Welcome to TA Allocation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  it("submits form and logs token on successful login", async () => {
    customRender(<LoginPage />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password@123" } });

    // Mock fetch
    const mockToken = "mocked-jwt-token";
     global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: mockToken }),
      })
    ) as unknown as typeof fetch;

    const consoleSpy = vi.spyOn(console, "log");

    fireEvent.submit(loginButton);

    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith("JWT token:", mockToken)
    );

    expect(localStorage.getItem("token")).toBe(mockToken);
  });
});
