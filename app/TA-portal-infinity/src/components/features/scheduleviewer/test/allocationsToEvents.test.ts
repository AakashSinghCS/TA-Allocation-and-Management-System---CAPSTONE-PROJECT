import { allocationsToEvents } from "../allocationsToEvents";
import type { ScheduleRow } from "../ScheduleViewer.types";

describe("allocationsToEvents", () => {
  it("converts schedule rows to events with correct properties", () => {
    const rows: ScheduleRow[] = [
      {
        id: 1,
        course: "CSC 101",
        section: "001",
        instructor: "Jane Doe",
        day: "Mon",
        startTime: "09:00",
        endTime: "10:00",
        status: "CONFIRMED",
        semester: "W1",
        year: 2025,
        numberOfHours: 1,
      },
    ];
    const events = allocationsToEvents(rows);
    expect(events.length).toBeGreaterThan(0);
    const ev = events[0];
    expect(ev).toHaveProperty("title", "CSC 101 (001)");
    expect(ev).toHaveProperty("start");
    expect(ev).toHaveProperty("end");
    expect(ev.extendedProps).toMatchObject({ instructor: "Jane Doe", status: "CONFIRMED" });
  });
});
