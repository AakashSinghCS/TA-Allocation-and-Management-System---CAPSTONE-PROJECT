import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Signup/i })).toBeInTheDocument();
  });

  it("accepts input and validates matching passwords", () => {
    renderWithRouter(<SignUpPage />);
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "Keith" } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Keith" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: "STUDENT" } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "Password@123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "Password@123" } });

    expect(screen.getByLabelText(/First Name/i)).toHaveValue("Keith");
    expect(screen.getByLabelText(/Role/i)).toHaveValue("STUDENT");
  });

  it("shows error if passwords do not match", () => {
    renderWithRouter(<SignUpPage />);
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "Password@123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "WrongPassword" } });

    fireEvent.submit(screen.getByRole("button", { name: /Signup/i }));
    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it("submits form when valid", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          firstName: "Lindsay",
          lastName: "Will",
          email: "jane@example.com",
          role: "INSTRUCTOR",
          createdAt: new Date(),
        }),
      })
    ));

    renderWithRouter(<SignUpPage />);

    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "Lindsay" } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Will" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: "INSTRUCTOR" } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "Strong@123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "Strong@123" } });

    fireEvent.submit(screen.getByRole("button", { name: /Signup/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Signup success. User:", expect.any(Object));
    });

    consoleSpy.mockRestore();
  });
});
