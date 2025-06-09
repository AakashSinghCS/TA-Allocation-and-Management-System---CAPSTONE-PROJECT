import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import LoginPage from "./LoginPage";

describe("LoginPage", () => {
  it("renders main headings", () => {
    render(<LoginPage />);
    expect(screen.getByText(/Welcome to TA Allocation/i)).toBeInTheDocument();
    expect(screen.getByText(/Management System/i)).toBeInTheDocument();
  });

  it("renders login form fields", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/Username\/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByText(/Please log in to continue/i)).toBeInTheDocument();
  });

  it("renders header navigation buttons", () => {
    render(<LoginPage />);
    ["Home", "About", "Contact", "Sign In", "Sign Up"].forEach((label) => {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    });
  });

  it("shows Forgot password link", () => {
    render(<LoginPage />);
    expect(screen.getByText(/Forgot password\?/i)).toBeInTheDocument();
  });

  it("accepts input and submits form", () => {
    render(<LoginPage />);
    const usernameInput = screen.getByLabelText(/Username\/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(usernameInput).toHaveValue("testuser");
    expect(passwordInput).toHaveValue("password123");

    const consoleSpy = vi.spyOn(console, "log");
    fireEvent.submit(screen.getByRole("button", { name: /Login/i }));
    expect(consoleSpy).toHaveBeenCalledWith(
      "Login attempted with:",
      { username: "testuser", password: "password123" }
    );
  });
});
