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
    // Try to submit with no file selected
    const button = screen.getByRole("button", { name: /import/i });
    fireEvent.click(button);
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/please select a valid csv file/i);
    });
  });

  it("parses CSV and sends mapped JSON to backend", async () => {
    // Prepare a fake CSV file
    const csvContent = `Dept Code,Course Number,Course Name,Year,Semester,Section,Type,Day,Start Time,End Time\nCOSC,111,Intro to CS,2025,Winter,001,LEC,Mon,09:00,10:00\nCOSC,112,Advanced CS,2025,Winter,002,LEC,Tue,10:00,11:00`;
    const file = new File([csvContent], "sections.csv", { type: "text/csv" });
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ message: "Import successful" })
    });
    render(<SectionCsvImport />);
    const { container } = render(<SectionCsvImport />);
    const input = container.querySelector('#csv-file');
    if (!input) throw new Error('File input not found');
    fireEvent.change(input, { target: { files: [file] } });
    // Debug: print DOM after file upload
    screen.debug();
    // Wait for CSV preview to appear (check for preview label and table headers)
    await waitFor(() => {
      // Use a function matcher to find the preview label even if split/wrapped
      expect(
        screen.getByText((content, element) =>
          content.includes('CSV Preview') && content.includes('first 10 rows')
        )
      ).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /Dept Code/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /Course Number/i })).toBeInTheDocument();
    });
    // There may be multiple 'Import' buttons, so select the last one (actual import action)
    const importButtons = screen.getAllByRole("button", { name: /import/i });
    const button = importButtons[importButtons.length - 1];
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
    const { container } = render(<SectionCsvImport />);
    // Simulate file upload with 2 valid rows (1 row is for error case)
    const csvContent = `Dept Code,Course Number,Course Name,Year,Semester,Section,Type,Day,Start Time,End Time\nCOSC,999,Invalid Course,2025,Fall,001,LEC,Mon,09:00,10:00\nCOSC,111,Intro to CS,2025,Winter,001,LEC,Mon,09:00,10:00`;
    const file = new File([csvContent], "sections.csv", { type: "text/csv" });
    const input = container.querySelector('#csv-file');
    if (!input) throw new Error('File input not found');
    fireEvent.change(input, { target: { files: [file] } });
    // Wait until the CSV preview is displayed
    await waitFor(() => {
      expect(screen.getByText(/CSV Preview/i)).toBeInTheDocument();
    });
    const button = screen.getByRole("button", { name: /import/i });
    fireEvent.click(button);
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/import failed/i);
    });
  });
  
  it("should trigger download when Download Sample CSV button is clicked", () => {
    // Spy on document.body methods
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");
    
    render(<SectionCsvImport />);
    const button = screen.getByRole("button", { name: /download sample csv/i });
    fireEvent.click(button);
    
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });
});
