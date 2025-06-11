import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

// Declare mockNavigate at the module level so it's in scope
const mockNavigate = vi.fn();

// Mock useNavigate at the module level so it's available before imports
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to wrap with router context
const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders login headings, email and password fields, and login button", () => {
    renderWithRouter(<LoginPage />);
    expect(
      screen.getByText(/Welcome to TA Allocation/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Management System/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Please log in to continue/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Forgot password/i)).toBeInTheDocument();
  });

  it("accepts input in email and password fields", () => {
    renderWithRouter(<LoginPage />);
    const emailInput = screen.getByLabelText(/Email/i);
    const passInput = screen.getByLabelText(/Password/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passInput, { target: { value: "Password@123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passInput).toHaveValue("Password@123");
  });

  it("shows error on invalid email on blur or submit", () => {
    renderWithRouter(<LoginPage />);
    const emailInput = screen.getByLabelText(/Email/i);

    // Simulate invalid input and blur
    fireEvent.change(emailInput, { target: { value: "bademail" } });
    fireEvent.blur(emailInput);

    // Simulate native validation (optional, if browser supports)
    fireEvent.invalid(emailInput);

    expect(
      screen.getByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
  });

  it("shows error on invalid password on blur or submit", () => {
    renderWithRouter(<LoginPage />);
    const passInput = screen.getByLabelText(/Password/i);

    fireEvent.change(passInput, { target: { value: "short" } });
    fireEvent.blur(passInput);
    fireEvent.invalid(passInput);

    expect(
      screen.getByText(
        /Password must be at least 8 characters and include uppercase, number, and special character/i
      )
    ).toBeInTheDocument();
  });

  it("submits form and handles successful login", async () => {
    // Spy on localStorage.setItem
    const localStorageSpy = vi.spyOn(localStorage.__proto__, "setItem");
    // Mock alert
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    // Mock fetch for successful login
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: "FAKE_JWT_TOKEN" }),
      })
    ));

    renderWithRouter(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "user@ubc.ca" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "Password@123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      // Check for localStorage
      expect(localStorageSpy).toHaveBeenCalledWith("token", "FAKE_JWT_TOKEN");
      // Check for navigation
      expect(mockNavigate).toHaveBeenCalledWith("/");
      // Check for alert
      expect(alertSpy).toHaveBeenCalledWith("Login successful!");
    });

    localStorageSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it("shows alert for invalid login credentials", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    // Mock fetch for failed login
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve("Invalid credentials"),
      })
    ));

    renderWithRouter(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "wrong@ubc.ca" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "WrongPass@123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Invalid email or password.");
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });

  it("shows alert for server error", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    // Mock fetch to throw error
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("Server error"))));

    renderWithRouter(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "error@ubc.ca" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "Password@123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Server error. Please try again later.");
    });

    alertSpy.mockRestore();
  });
});
