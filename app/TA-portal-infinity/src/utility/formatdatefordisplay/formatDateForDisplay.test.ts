import  formatDateForDisplay  from "./formatDateForDisplay";

describe("formatDateForDisplay()", () => {
  it.each([
    ["2025-06-05T00:00:00Z", "June 5 2025"],
    ["2025-07-01T00:00:00Z", "July 1 2025"],
    ["2025-02-06T00:00:00Z", "Feb 6 2025"],
    ["2024-01-03T00:00:00Z", "Jan 3 2024"],
  ])("formats %s → %s", (iso, expected) => {
    expect(formatDateForDisplay(new Date(iso))).toBe(expected);
  });
});
