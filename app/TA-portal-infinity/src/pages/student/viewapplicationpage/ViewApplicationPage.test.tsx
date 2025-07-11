import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../../context/AuthContext";
import ViewApplicationPage from "./ViewApplicationPage";

// Mock localStorage for token
beforeEach(() => {
  window.localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGVzIjpbIlNUVURFTlQiXSwiaWF0IjoxNjg4ODg4ODg4LCJleHAiOjQ3ODg4ODg4ODh9.signature");
});
afterEach(() => {
  window.localStorage.clear();
});

describe("ViewApplicationPage minimal render", () => {
  it("renders the page title", () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <ViewApplicationPage />
        </MemoryRouter>
      </AuthProvider>
    );
    expect(screen.getByText("My Applications")).toBeInTheDocument();
  });

  it("shows filters and no applications by default", async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <ViewApplicationPage />
        </MemoryRouter>
      </AuthProvider>
    );
    expect(screen.getByText("Filters")).toBeInTheDocument();
    // Accept any of the intuitive empty states (multiple elements may match)
    const emptyStateEls = screen.getAllByText((content) =>
      typeof content === 'string' &&
      (content.includes('No applications found') ||
       content.includes('No TA applications match your current filters'))
    );
    expect(emptyStateEls.length).toBeGreaterThan(0);
  });

  it("can type in filters and reset them", async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <ViewApplicationPage />
        </MemoryRouter>
      </AuthProvider>
    );
    const yearInput = screen.getByPlaceholderText("e.g. 2025");
    fireEvent.change(yearInput, { target: { value: "2025" } });
    expect(yearInput).toHaveValue("2025");
    const resetBtn = screen.getByText("Reset");
    fireEvent.click(resetBtn);
    expect(yearInput).toHaveValue("");
  });

  it("shows error if token is missing", async () => {
    window.localStorage.clear();
    render(
      <AuthProvider>
        <MemoryRouter>
          <ViewApplicationPage />
        </MemoryRouter>
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("Authentication token is missing")).toBeInTheDocument();
    });
  });
});
