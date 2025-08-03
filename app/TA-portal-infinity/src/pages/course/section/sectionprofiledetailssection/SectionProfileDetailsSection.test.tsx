import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SectionProfileDetailsSection from "./SectionProfileDetailsSection";
import { sectionProfileFields } from "../../../../interfaces/section/Section";
import { sectionFieldLabels } from "../../../../interfaces/section/Section";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Mock useAuth so userRoles includes COORDINATOR
vi.mock("../../../../context/AuthContext", () => ({
  useAuth: () => ({ userRoles: ["COORDINATOR"] as const }),
}));

// 2. Mock showToastConfirmation and toast functions
vi.mock("../../../../utility/confirmation/toastConfirmation", () => ({
  showToastConfirmation: vi.fn().mockResolvedValue(true),
  showToastError: vi.fn(),
  showToastSuccess: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => null,
}));

// Mock showToastSuccess and showToastError
vi.mock("../../../../utility/toastutils/toastutils", () => ({
  showToastSuccess: vi.fn(),
  showToastError: vi.fn(),
}));

// Mock validation functions
vi.mock("../../../../utility/validation/section/validateSectionProfile", () => ({
  validateSectionProfile: vi.fn().mockReturnValue({
    ok: true,
    sanitized: {},
    errors: []
  }),
}));

// 3. Create spies for all API functions
const mockFetchUpdateSched = vi.fn();
const mockFetchAddSched    = vi.fn();
const mockFetchSection     = vi.fn();
const mockFetchUpdateDetails = vi.fn();
const mockFetchDelete      = vi.fn();

// 4. Mock each API module to forward args to our spies
vi.mock("../../../../api/section/sectionschedule/fetchUpdateSectionSchedule", () => ({
  fetchUpdateSectionSchedule: (...args: any[]) =>
    mockFetchUpdateSched(...args),
}));
vi.mock("../../../../api/section/sectionschedule/fetchAddSectionSchedule", () => ({
  fetchAddSectionSchedule: (...args: any[]) =>
    mockFetchAddSched(...args),
}));
vi.mock("../../../../api/section/fetchSectionIncludeInstructorId", () => ({
  fetchSectionIncludeInstructorId: (...args: any[]) => mockFetchSection(...args),
}));
vi.mock("../../../../api/section/fetchUpdateSectionDetails", () => ({
  fetchUpdateSectionDetails: (...args: any[]) =>
    mockFetchUpdateDetails(...args),
}));
vi.mock("../../../../api/section/fetchDeleteSection", () => ({
  fetchDeleteSection: (...args: any[]) => mockFetchDelete(...args),
}));

// 5. Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


describe("SectionProfileDetailsSection", () => {
  // Minimal “section” shape: we only care about sectionDetails.sectionId and id
  const baseSection = {
    id: 123,
    course:{id: 456},
    sectionSchedule: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Whenever we re-fetch, return the same object
    mockFetchSection.mockResolvedValue(baseSection);
    // Delete resolves true
    mockFetchDelete.mockResolvedValue(true);
  });

  it("toggles into edit mode when Edit Details is clicked", async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
      <MemoryRouter>      <SectionProfileDetailsSection
        section={baseSection as any}
        fields={sectionProfileFields}
        labels={sectionFieldLabels}
      /></MemoryRouter>
      </QueryClientProvider>

    );

    // coordinator sees Edit Details
    const editBtn = screen.getByRole("button", { name: /edit details/i });
    fireEvent.click(editBtn);

    // should render the EditSectionProfileSection form, which has a Save button
    expect(
      await screen.findByRole("button", { name: /save/i })
    ).toBeInTheDocument();
  });

  it("calls delete API and navigates back when Delete is clicked", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
      <MemoryRouter><SectionProfileDetailsSection
        section={baseSection as any}
        fields={sectionProfileFields}
        labels={sectionFieldLabels}
      /></MemoryRouter>
      </QueryClientProvider>
      
    );

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    // wait for our async deleteCourse to finish
    await waitFor(() => {
      expect(mockFetchDelete).toHaveBeenCalledWith(123);
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });
});
