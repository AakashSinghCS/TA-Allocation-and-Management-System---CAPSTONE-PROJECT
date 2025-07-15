import type { ScheduleRow } from "./ScheduleViewer.types";

export const dayMap: Record<string, number> = {
  "Sunday": 0,
  "Monday": 1,
  "Tuesday": 2,
  "Wednesday": 3,
  "Thursday": 4,
  "Friday": 5,
  "Saturday": 6,
};

export function getSemesterRanges(year: number): Record<string, { start: string; end: string }> {
  return {
    W1: { start: `${year}-01-05`, end: `${year}-04-09` },
    S1: { start: `${year}-05-11`, end: `${year}-06-18` },
    S2: { start: `${year}-07-06`, end: `${year}-08-13` },
    W2: { start: `${year}-09-02`, end: `${year}-12-05` },
  };
}

export function getFirstWeekdayInRange(weekday: string, rangeStart: string) {
  const dayNum = dayMap[weekday];
  if (typeof dayNum !== "number") return null;
  const startDate = new Date(rangeStart);
  const startDay = startDate.getDay();
  let diff = dayNum - startDay;
  if (diff < 0) diff += 7;
  startDate.setDate(startDate.getDate() + diff);
  return startDate;
}

export function getAllWeekdaysInRange(weekday: string, rangeStart: string, rangeEnd: string) {
  const dates: Date[] = [];
  let current = getFirstWeekdayInRange(weekday, rangeStart);
  const endDate = new Date(rangeEnd);
  if (!current) return dates;
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  return dates;
}

export function flattenAllocation(a: any, sch?: { day: string; startTime: string; endTime: string }): ScheduleRow {
  return {
    id: typeof a.id === "number" ? a.id : 0,
    course: a.section && a.section.course ? `${a.section.course.deptCode} ${a.section.course.courseNum}` : "N/A",
    section: a.section && a.section.section ? a.section.section : "N/A",
    instructor: a.section && a.section.instructor && typeof a.section.instructor === "object"
      ? `${a.section.instructor.firstName} ${a.section.instructor.lastName}`
      : "N/A",
    day: sch?.day || "",
    startTime: sch?.startTime || "",
    endTime: sch?.endTime || "",
    status: a.status ?? "",
    semester: a.section && a.section.semester ? a.section.semester : "N/A",
    year: a.section && typeof a.section.year === "number" ? a.section.year : 0,
    numberOfHours: a.numberOfHours ?? 0,
  };
}

export function getAllocationDate(a: ScheduleRow, startOfWeek: Date) {
  if (!a.day || !a.startTime) return null;
  const dayIdx = dayMap[a.day];
  if (typeof dayIdx !== 'number') return null;
  // Calculate correct date based on local day index relative to startOfWeek
  const d = new Date(startOfWeek);
  const startDow = startOfWeek.getDay();
  const diff = (dayIdx - startDow + 7) % 7;
  d.setDate(startOfWeek.getDate() + diff);
  return d;
}

export function getNextUpcomingSchedules(events: any[], count: number = 3) {
  const now = new Date();
  const futureEvents = events.filter(e => new Date(e.start) > now);
  futureEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  return futureEvents.slice(0, count);
}
