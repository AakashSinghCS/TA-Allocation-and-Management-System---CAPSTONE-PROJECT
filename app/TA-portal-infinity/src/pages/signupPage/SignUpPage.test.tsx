import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import SignUpPage from "./SignUpPage";
import { MemoryRouter } from "react-router-dom"; 

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("SignUpPage", () => {
  it("renders all form fields and headings", () => {
    renderWithRouter(<SignUpPage />);
    expect(screen.getByText(/Create an Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Signup/i })).toBeInTheDocument();
  });

  it("accepts input and validates matching passwords", () => {
    renderWithRouter(<SignUpPage />);
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: "1234567890" } });
    fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: "student" } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "Password@123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "Password@123" } });

    expect(screen.getByLabelText(/Full Name/i)).toHaveValue("John Doe");
    expect(screen.getByLabelText(/Role/i)).toHaveValue("student");
  });

  it("shows error if passwords do not match", () => {
    renderWithRouter(<SignUpPage />);
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "Password@123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "WrongPassword" } });

    fireEvent.submit(screen.getByRole("button", { name: /Signup/i }));
    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it("submits form when valid", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    renderWithRouter(<SignUpPage />);
    
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Jane Smith" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: "instructor" } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "Strong@123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "Strong@123" } });

    fireEvent.submit(screen.getByRole("button", { name: /Signup/i }));

    expect(consoleSpy).toHaveBeenCalledWith("Signup attempted with:", {
      fullName: "Jane Smith",
      email: "jane@example.com",
      phoneNumber: "9876543210",
      role: "instructor",
      password: "Strong@123",
      confirmPassword: "Strong@123",
    });

    consoleSpy.mockRestore();
  });
});
