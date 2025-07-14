
import { render, screen } from "@testing-library/react";
import StudentSchedulePage from "./ScheduleViewer";
import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { fetchStudentAllocationHistory } from "../../../api/allocation/fetchStudentAllocationHistory";

vi.mock("../../../api/allocation/fetchStudentAllocationHistory", () => ({
  fetchStudentAllocationHistory: async () => [
    {
      id: 1,
      status: "CONFIRMED",
      section: {
        id: 1,
        semester: "W1",
        year: 2026,
        section: "002",
        type: "TUTORIAL",
        course: {
          deptCode: "COSC",
          courseNum: "499",
        },
        instructor: { firstName: "John", lastName: "Doe" },
      },
      numberOfHours: 10,
    },
  ],
}));

vi.mock("../../../api/section/fetchSectionSchedule", () => ({
  fetchSectionSchedule: async () => [
    { day: "Monday", startTime: "10:00", endTime: "11:00" },
    { day: "Wednesday", startTime: "10:00", endTime: "11:00" },
  ],
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ userId: 123, token: "fake-token" }),
}));

describe("StudentSchedulePage", () => {
  it("renders loading then schedule table", async () => {
    render(<StudentSchedulePage />);
    expect(screen.getByText(/Loading schedule/i)).toBeInTheDocument();
    const courseCells = await screen.findAllByText(/COSC 499/i);
    expect(courseCells.length).toBeGreaterThan(0);
    expect(screen.getByText(/Monday/i)).toBeInTheDocument();
    expect(screen.getByText(/Wednesday/i)).toBeInTheDocument();
    expect(screen.getByText(/10:00 - 11:00/i)).toBeInTheDocument();
    expect(screen.getByText(/CONFIRMED/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });

  it("shows empty state when no allocations", async () => {
    vi.mocked(fetchStudentAllocationHistory).mockResolvedValueOnce([]);
    const { rerender } = render(<StudentSchedulePage />);
    expect(screen.getByText(/Loading schedule/i)).toBeInTheDocument();
    await screen.findByText(/Sit back, relax! No Confirmed Allocations yet/i);
    expect(screen.getByText(/No upcoming schedules/i)).toBeInTheDocument();
  });

  it("exports CSV when button clicked", async () => {
    render(<StudentSchedulePage />);
    const courseCells = await screen.findAllByText(/COSC 499/i);
    expect(courseCells.length).toBeGreaterThan(0);
    const csvButton = screen.getByText(/Export CSV/i);
    // Mock URL.createObjectURL and click
    const createObjectURL = window.URL.createObjectURL = vi.fn(() => "blob:url");
    const revokeObjectURL = window.URL.revokeObjectURL = vi.fn();
    const clickSpy = vi.spyOn(document, "createElement");
    csvButton.click();
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("exports ICS when button clicked", async () => {
    render(<StudentSchedulePage />);
    const courseCells = await screen.findAllByText(/COSC 499/i);
    expect(courseCells.length).toBeGreaterThan(0);
    const icsButton = screen.getByText(/Export to Calendar/i);
    // Mock URL.createObjectURL and click
    const createObjectURL = window.URL.createObjectURL = vi.fn(() => "blob:url");
    const revokeObjectURL = window.URL.revokeObjectURL = vi.fn();
    const clickSpy = vi.spyOn(document, "createElement");
    icsButton.click();
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("shows upcoming schedules", async () => {
    render(<StudentSchedulePage />);
    await screen.findByText(/Upcoming Schedule/i);
    const courseCells = screen.getAllByText(/COSC 499/i);
    expect(courseCells.length).toBeGreaterThan(0);
  });

  it("handles API error gracefully", async () => {
    vi.mocked(fetchStudentAllocationHistory).mockRejectedValueOnce(new Error("API Error"));
    render(<StudentSchedulePage />);
    await screen.findByText(/Sit back, relax! No Confirmed Allocations yet/i);
  });
});
