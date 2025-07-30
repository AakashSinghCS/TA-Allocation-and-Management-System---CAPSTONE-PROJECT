
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../../context/AuthContext";
import ViewApplicationPage from "./ViewApplicationPage";

beforeEach(() => {
  window.localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGVzIjpbIlNUVURFTlQiXSwiaWF0IjoxNjg4ODg4ODg4LCJleHAiOjQ3ODg4ODg4ODh9.signature");
});
afterEach(() => {
  window.localStorage.clear();
});

describe("ViewApplicationPage render", () => {
  it("shows waiting offer message if no allocation or offers", async () => {
    const mockApplications = [
      {
        id: 1,
        preferences: ["COSC 101"],
        wantRemote: true,
        wantWorkingHours: 10,
        timeSubmitted: new Date().toISOString(),
        student: { firstName: "John", lastName: "Doe", id: 1 },
        // No allocation, no offers
      },
    ];
    const originalFetch = global.fetch;
    // @ts-ignore
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve(mockApplications), ok: true });
    render(
      <AuthProvider>
        <MemoryRouter>
          <ViewApplicationPage />
        </MemoryRouter>
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByText(/Application submitted. Waiting for offer.../i)).toBeInTheDocument();
    });
    global.fetch = originalFetch;
  });

  it("shows filters and no applications by default", async () => {
    // No applications returned
    const originalFetch = global.fetch;
    // @ts-ignore
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve([]), ok: true });
    render(
      <AuthProvider>
        <MemoryRouter>
          <ViewApplicationPage />
        </MemoryRouter>
      </AuthProvider>
    );
    expect(screen.getByText("Filters")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/No applications found/i)).toBeInTheDocument();
      expect(screen.getByText(/No TA applications match your current filters/i)).toBeInTheDocument();
    });
    global.fetch = originalFetch;
  });

  it("handles missing student info gracefully", async () => {
    const mockApplications = [
      {
        id: 1,
        preferences: ["COSC 101"],
        wantRemote: true,
        wantWorkingHours: 10,
        timeSubmitted: new Date().toISOString(),
        allocation: { status: "CONFIRMED", section: { instructor: "Prof. Smith" } },
      },
    ];
    const originalFetch = global.fetch;
    // @ts-ignore
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve(mockApplications), ok: true });
    render(
      <AuthProvider>
        <MemoryRouter>
          <ViewApplicationPage />
        </MemoryRouter>
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByText(/Student information is missing/i)).toBeInTheDocument();
    });
    global.fetch = originalFetch;
  });

  it("shows loading state while fetching applications", async () => {
    // Simulate loading by rendering and checking for loading text
    // Use a fetch that never resolves to keep loading
    const originalFetch = global.fetch;
    // @ts-ignore
    global.fetch = () => new Promise(() => {});
    render(
      <AuthProvider>
        <MemoryRouter>
          <ViewApplicationPage />
        </MemoryRouter>
      </AuthProvider>
    );
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    global.fetch = originalFetch;
  });

  it("can type in filters and reset them", async () => {
    const originalFetch = global.fetch;
    // @ts-ignore
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve([]), ok: true });
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
    global.fetch = originalFetch;
  });


  it("shows filter button and reset button", async () => {
    const originalFetch = global.fetch;
    // @ts-ignore
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve([]), ok: true });
    render(
      <AuthProvider>
        <MemoryRouter>
          <ViewApplicationPage />
        </MemoryRouter>
      </AuthProvider>
    );
    expect(screen.getByText("Filter")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
    global.fetch = originalFetch;
  });
});
