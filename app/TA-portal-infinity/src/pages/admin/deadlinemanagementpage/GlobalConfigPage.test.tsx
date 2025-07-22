import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DeadlineManagementPage from "./GlobalConfigPage";
import * as AuthContext from "../../../context/AuthContext";
import * as FetchDeadline from "../../../api/admin/FetchDeadline";
import type { DeadlineDto } from "../../../interfaces/admin/Deadline";

// Setup: Mock the modules
vi.mock("../../../context/AuthContext");
vi.mock("../../../api/admin/FetchDeadline");

describe("DeadlineManagementPage", () => {
  beforeEach(() => {
    // Mock useAuth
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({
      token: "test-token",
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
      userRoles: [],
      userId: 1,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders deadlines and allows updating them", async () => {
    const mockDeadline: DeadlineDto = {
      name: "student_application_deadline",
      startTime: "2025-08-01T00:00:00",
      endTime: "2025-08-31T23:59:59",
    };

    // Mock fetchDeadlines
    vi.spyOn(FetchDeadline, "fetchDeadlines").mockResolvedValue([mockDeadline]);

    // Mock updateDeadline
    vi.spyOn(FetchDeadline, "updateDeadline").mockResolvedValue({
      ...mockDeadline,
      endTime: "2025-09-30T23:59:59",
    });

    render(<DeadlineManagementPage />);

    // Should show loading initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for deadlines to load
    expect(
      await screen.findByText(/STUDENT APPLICATION DEADLINE/i)
    ).toBeInTheDocument();

    // There should be input fields with the original datetime values
    const startInput = screen.getByDisplayValue("2025-08-01T00:00");
    const endInput = screen.getByDisplayValue("2025-08-31T23:59");

    // Change the end date
    fireEvent.change(endInput, {
      target: { value: "2025-09-30T23:59" },
    });

    // Click Save for the specific deadline using aria-label
    const saveButton = screen.getByLabelText("save-deadline-student_application_deadline");
    fireEvent.click(saveButton);

    // Confirm updateDeadline was called
    await waitFor(() => {
      expect(FetchDeadline.updateDeadline).toHaveBeenCalledWith(
        "student_application_deadline",
        expect.objectContaining({
          name: "student_application_deadline",
          startTime: expect.stringContaining("2025-08-01"),
          endTime: expect.any(String),
        }),
        "test-token"
      );
    });
  });

  it("shows error when fetch fails", async () => {
    vi.spyOn(FetchDeadline, "fetchDeadlines").mockRejectedValue(new Error("Failed"));

    render(<DeadlineManagementPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for error to show
    expect(await screen.findByText(/failed to load deadlines/i)).toBeInTheDocument();
  });
  
  it("alerts when update fails", async () => {
    const mockDeadline: DeadlineDto = {
      name: "student_application_deadline",
      startTime: "2025-08-01T00:00:00",
      endTime: "2025-08-31T23:59:59",
    };
    // Mock fetchDeadlines and failing updateDeadline
    vi.spyOn(FetchDeadline, "fetchDeadlines").mockResolvedValue([mockDeadline]);
    vi.spyOn(FetchDeadline, "updateDeadline").mockRejectedValue(new Error("Update failed"));
  

    render(<DeadlineManagementPage />);
    // Wait for deadlines to load
    expect(await screen.findByText(/student application deadline/i)).toBeInTheDocument();
    // Change end date and click save
    const endInput = screen.getByDisplayValue("2025-08-31T23:59");
    fireEvent.change(endInput, { target: { value: "2025-09-30T23:59" } });
    fireEvent.click(screen.getByLabelText("save-deadline-student_application_deadline"));

    // Wait for the toast error message to appear
    expect(await screen.findByText(/error updating deadline/i)).toBeInTheDocument();
  });
});
