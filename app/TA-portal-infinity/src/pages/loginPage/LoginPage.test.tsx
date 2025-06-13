import React from "react";
import {render, screen, fireEvent, waitFor, act,} from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";
import { AuthProvider } from "../../context/AuthContext";

// mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <AuthProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </AuthProvider>
  );

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal("alert", vi.fn());
  });

  it("renders headings, inputs, forgot link and login button", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText(/Welcome to TA Allocation/i)).toBeInTheDocument();
    expect(screen.getByText(/Management System/i)).toBeInTheDocument();
    expect(screen.getByText(/Please log in to continue/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/Forgot password/i)).toBeInTheDocument();
  });

  it("accepts input values", () => {
    renderWithProviders(<LoginPage />);
    const email = screen.getByLabelText(/Email/i);
    const pass = screen.getByLabelText(/Password/i);

    fireEvent.change(email, { target: { value: "foo@bar.com" } });
    fireEvent.change(pass, { target: { value: "Secret@123" } });

    expect(email).toHaveValue("foo@bar.com");
    expect(pass).toHaveValue("Secret@123");
  });

  it("shows validation errors when inputs fire invalid events", async () => {
    renderWithProviders(<LoginPage />);
    const email = screen.getByLabelText(/Email/i);
    const pass = screen.getByLabelText(/Password/i);

    // set invalid values
    fireEvent.change(email, { target: { value: "notanemail" } });
    fireEvent.change(pass, { target: { value: "short" } });

    // fire invalid events
    await act(async () => {
      fireEvent.invalid(email, { target: { value: "notanemail" } });
      fireEvent.invalid(pass, { target: { value: "short" } });
    });

    expect(
      await screen.findByText(/please enter a valid email address/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(
        /Password must be at least 8 characters and include uppercase, number, and special character/i
      )
    ).toBeInTheDocument();
  });

  it("handles successful login: stores token, shows message, and redirects", async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: "JWT_TOKEN" }),
      })
    ));

    renderWithProviders(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "user@ubc.ca" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "Password@123" },
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /login/i }));
    });

    expect(
      await screen.findByText(/login successful! redirecting/i, {}, { timeout: 3000 })
    ).toBeInTheDocument();
    expect(setItemSpy).toHaveBeenCalledWith("token", "JWT_TOKEN");

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    }, { timeout: 3000 });

    setItemSpy.mockRestore();
  }, 10000);

  it("alerts on invalid credentials and does not redirect", async () => {
    const alertMock = vi.spyOn(window, "alert");
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve("Bad creds"),
      })
    ));

    renderWithProviders(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "wrong@ubc.ca" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "WrongPass@123" },
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /login/i }));
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Invalid email or password.");
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("alerts on server error", async () => {
    const alertMock = vi.spyOn(window, "alert");
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("Network"))));

    renderWithProviders(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "err@ubc.ca" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "Password@123" },
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /login/i }));
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        "Server error. Please try again later."
      );
    });
  });
});
