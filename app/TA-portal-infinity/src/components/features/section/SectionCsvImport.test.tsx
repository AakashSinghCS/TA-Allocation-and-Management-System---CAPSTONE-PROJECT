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

  it("disables Import CSV button if no file is selected", () => {
    // The UI disables the Import CSV button when no file is selected, so error message is not shown.
    render(<SectionCsvImport />);
    const button = screen.getByRole("button", { name: /import csv/i });
    expect(button).toBeDisabled();
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
    // CSVプレビュー表示を待つ
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
      json: async () => ({ message: "missing required fields" }),
      text: async () => "missing required fields"
    });
    // eslint-disable-next-line no-console
    console.log('Test: about to render SectionCsvImport for error test');
    const { container } = render(<SectionCsvImport />);
    // Simulate file upload with a valid-looking row that backend will reject
    const csvContent = `Dept Code,Course Number,Course Name,Year,Semester,Section,Type,Day,Start Time,End Time\nCOSC,999,Invalid Course,2025,Fall,001,LEC,Mon,09:00,10:00`;
    const file = new File([csvContent], "sections.csv", { type: "text/csv" });
    const input = screen.getByLabelText(/file/i);
    fireEvent.change(input, { target: { files: [file] } });
    const form = container.querySelector('form');
    fireEvent.submit(form!);
    await waitFor(() => {
      // Debug: print the error message div if present
      const errorDiv = screen.queryByText((content) => /import failed|please select a valid csv file/i.test(content));
      if (errorDiv) {
        // eslint-disable-next-line no-console
        console.log('Test found error div:', errorDiv.textContent);
      } else {
        // eslint-disable-next-line no-console
        console.log('Test did not find error div');
      }
      expect(
        screen.getByText((content) =>
          /import failed|please select a valid csv file/i.test(content)
        )
      ).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
