import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SectionCsvImport from "./SectionCsvImport";
import { vi } from "vitest";

// Mock fetch for import endpoint
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("SectionCsvImport", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorage.clear();
  });

  it("shows error if no file is selected", async () => {
    render(<SectionCsvImport />);
    const button = screen.getByRole("button", { name: /import csv/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText(/please select a valid csv file/i)).toBeInTheDocument();
    });
  });

  it("parses CSV and sends mapped JSON to backend", async () => {
    // Prepare a fake CSV file
    const csvContent = `Dept Code,Course Number,Course Name,Year,Semester,Section,Type,Day,Start Time,End Time\nCOSC,111,Intro to CS,2025,Winter,001,LEC,Mon,09:00,10:00`;
    const file = new File([csvContent], "sections.csv", { type: "text/csv" });
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ message: "Import successful" })
    });
    render(<SectionCsvImport />);
    const input = screen.getByLabelText(/file/i);
    fireEvent.change(input, { target: { files: [file] } });
    // Wait for CSV preview to appear
    await waitFor(() => {
      expect(screen.getByText(/CSV Preview/)).toBeInTheDocument();
    });
    const button = screen.getByRole("button", { name: /import csv/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/import successful/i)).toBeInTheDocument();
    });
    // Check that the payload is mapped correctly
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body[0]).toMatchObject({
      deptCode: "COSC",
      courseNum: "111",
      name: "Intro to CS",
      year: 2025,
      semester: "Winter",
      section: "001",
      type: "LEC",
      day: "Mon",
      startTime: "09:00",
      endTime: "10:00"
    });
  });

  it("shows backend error message if import fails", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      headers: { get: () => "application/json" },
      json: async () => ({ message: "Import failed: missing required fields" })
    });
    render(<SectionCsvImport />);
    // Simulate file upload
    const csvContent = `Dept Code,Course Number,Course Name,Year,Semester,Section,Type,Day,Start Time,End Time\n,,,,,,,,,`;
    const file = new File([csvContent], "sections.csv", { type: "text/csv" });
    const input = screen.getByLabelText(/file/i);
    fireEvent.change(input, { target: { files: [file] } });
    const button = screen.getByRole("button", { name: /import csv/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText(/import failed|please select a valid csv file/i)).toBeInTheDocument();
    });
  });
});
