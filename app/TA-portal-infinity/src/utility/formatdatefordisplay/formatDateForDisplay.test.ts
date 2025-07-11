import  formatDateForDisplay  from "./formatDateForDisplay";

// Helper to build a local Date from ISO date string (avoids timezone shifts)
const toLocalDate = (iso: string): Date => {
  const [year, month, day] = iso.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
};

describe("formatDateForDisplay()", () => {
  it.each([
    ["2025-06-05T00:00:00Z", "June 5 2025"],
    ["2025-07-01T00:00:00Z", "July 1 2025"],
    ["2025-02-06T00:00:00Z", "Feb 6 2025"],
    ["2024-01-03T00:00:00Z", "Jan 3 2024"],
  ])("formats %s → %s", (iso, expected) => {
    expect(formatDateForDisplay(toLocalDate(iso))).toBe(expected);
  });
});
