
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SectionCsvImport from "../SectionCsvImport";

describe("SectionCsvImport", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.restoreAllMocks();
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
