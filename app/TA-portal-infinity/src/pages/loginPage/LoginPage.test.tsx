import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

const customRender = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("LoginPage", () => {
  it("renders main headings", () => {
    customRender(<LoginPage />);
    expect(screen.getByText(/Welcome to TA Allocation/i)).toBeInTheDocument();
    expect(screen.getByText(/Management System/i)).toBeInTheDocument();
  });

  it("renders login form fields", () => {
    customRender(<LoginPage />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByText(/Please log in to continue/i)).toBeInTheDocument();
  });

  it("shows Forgot password link", () => {
    customRender(<LoginPage />);
    expect(screen.getByText(/Forgot password\?/i)).toBeInTheDocument();
  });

  it("accepts input and submits form", () => {
    customRender(<LoginPage />);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password@123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("Password@123");

    const consoleSpy = vi.spyOn(console, "log");
    fireEvent.submit(screen.getByRole("button", { name: /Login/i }));

    expect(consoleSpy).toHaveBeenCalledWith("Login attempted with:", {
      email: "test@example.com",
      password: "Password@123",
    });
  });
});
