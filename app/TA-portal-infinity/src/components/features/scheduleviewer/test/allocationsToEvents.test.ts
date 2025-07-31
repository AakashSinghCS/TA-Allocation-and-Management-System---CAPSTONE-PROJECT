import { describe, it, expect, vi, beforeEach } from 'vitest';
import { allocationsToEvents } from "../allocationsToEvents";
import type { ScheduleRow } from "../ScheduleViewer.types";

// Mock the getSemesterDates API
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { year: 2025, semester: 'W1', startDate: '2025-01-05', endDate: '2025-04-09' },
      { year: 2025, semester: 'W2', startDate: '2025-09-02', endDate: '2025-12-05' },
    ]),
  })
) as unknown as typeof fetch;

describe("allocationsToEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("converts schedule rows to events with correct properties", async () => {
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
    const events = await allocationsToEvents(rows, 'test-token');
    expect(events.length).toBeGreaterThan(0);
    const ev = events[0];
    expect(ev).toHaveProperty("title", "CSC 101 (001)");
    expect(ev).toHaveProperty("start");
    expect(ev).toHaveProperty("end");
    expect(ev.extendedProps).toMatchObject({ instructor: "Jane Doe", status: "CONFIRMED" });
  });
});
