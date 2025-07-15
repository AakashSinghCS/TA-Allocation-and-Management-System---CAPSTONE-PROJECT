import { getSemesterRanges, getAllWeekdaysInRange, getAllocationDate, getNextUpcomingSchedules } from "../ScheduleUtils";
import type { ScheduleRow } from "../ScheduleViewer.types";

describe("ScheduleUtils", () => {
  it("returns semester ranges for given year", () => {
    const ranges = getSemesterRanges(2025);
    expect(ranges.W1.start).toBe("2025-01-05");
    expect(ranges.W2.end).toBe("2025-12-05");
  });

  it("finds all weekdays in date range", () => {
    const dates = getAllWeekdaysInRange("Monday", "2025-01-05", "2025-01-19");
    expect(dates[0].getDay()).toBe(1); // Monday
    // Should find exactly two Mondays within the range Jan 5 to Jan 19
    expect(dates.length).toBe(2);
  });

  it("calculates allocation date correctly", () => {
    const start = new Date("2025-01-05"); // Sunday
    const row: ScheduleRow = { id: 0, course: "", section: "", instructor: "", day: "Wednesday", startTime: "09:00", endTime: "", status: "", semester: "W1", year: 2025, numberOfHours: 0 };
    const date = getAllocationDate(row, start);
    expect(date?.getDay()).toBe(3); // Wednesday
  });

  it("gets next upcoming schedules", () => {
    const now = new Date();
    const events = [
      { start: new Date(now.getTime() + 10000).toISOString() },
      { start: new Date(now.getTime() + 20000).toISOString() },
      { start: new Date(now.getTime() - 10000).toISOString() },
    ];
    const next = getNextUpcomingSchedules(events, 2);
    expect(next.length).toBe(2);
    expect(new Date(next[0].start).getTime()).toBeGreaterThan(now.getTime());
  });
});
