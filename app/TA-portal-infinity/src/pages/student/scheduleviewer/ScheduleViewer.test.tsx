import { render, screen } from "@testing-library/react";
import { vi, describe, beforeEach, it, expect } from "vitest";
import StudentSchedulePage from "./ScheduleViewer";
import { fetchStudentAllocationHistory } from "../../../api/allocation/fetchStudentAllocationHistory";
import { fetchSectionSchedule } from "../../../api/section/fetchSectionSchedule";

vi.mock("../../../api/allocation/fetchStudentAllocationHistory", () => ({
  fetchStudentAllocationHistory: vi.fn(),
}));

vi.mock("../../../api/section/fetchSectionSchedule", () => ({
  fetchSectionSchedule: vi.fn(),
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ userId: 123, token: "fake-token" }),
}));

describe("StudentSchedulePage", () => {
  beforeEach(() => {
    vi.mocked(fetchStudentAllocationHistory).mockResolvedValue([
      { id: 1, status: "CONFIRMED", section: { id: 1 }, numberOfHours: 2 },
    ]);
    vi.mocked(fetchSectionSchedule).mockResolvedValue([
      { day: "Monday", startTime: "09:00", endTime: "10:00" },
      { day: "Wednesday", startTime: "11:00", endTime: "12:00" },
    ]);
  });

  it("shows loading state", () => {
    vi.mocked(fetchStudentAllocationHistory).mockReturnValue(new Promise(() => {}));
    render(<StudentSchedulePage />);
    expect(screen.getByText(/Loading schedule/i)).toBeInTheDocument();
  });

  it("renders empty state when no allocations", async () => {
    vi.mocked(fetchStudentAllocationHistory).mockResolvedValueOnce([]);
    render(<StudentSchedulePage />);
    // Should display at least one empty state message
    const relaxMessages = await screen.findAllByText(/Sit back, relax/i);
    expect(relaxMessages.length).toBeGreaterThan(0);
    // Check both empty messages are shown
    expect(screen.getByText(/No upcoming schedules/i)).toBeInTheDocument();
    expect(screen.getByText(/No Confirmed Allocations yet/i)).toBeInTheDocument();
  });

  it("renders calendar view with schedule grid", async () => {
    render(<StudentSchedulePage />);
    // Calendar header should be displayed
    expect(await screen.findByText(/Schedule - Calendar View/i)).toBeInTheDocument();
    // Calendar grid should render
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it("includes export buttons", async () => {
    render(<StudentSchedulePage />);
    // Wait for export CSV button to appear
    expect(await screen.findByText(/Export CSV/i)).toBeInTheDocument();
    expect(screen.getByText(/Export to Calendar/i)).toBeInTheDocument();
  });

  it("gracefully handles API errors", async () => {
    vi.mocked(fetchStudentAllocationHistory).mockRejectedValue(new Error("API Down"));
    render(<StudentSchedulePage />);
    // Should show message for no confirmed allocations
    expect(await screen.findByText(/No Confirmed Allocations yet/i)).toBeInTheDocument();
  });
});
