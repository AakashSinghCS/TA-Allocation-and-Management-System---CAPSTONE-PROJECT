import { getSemesterRanges, getAllWeekdaysInRange } from "./ScheduleUtils";
import type { ScheduleRow } from "./ScheduleViewer.types";

export async function allocationsToEvents(scheduleRows: ScheduleRow[], token: string) {
  const events: any[] = [];
  
  // Get semester ranges once for all allocations
  const semesterRanges = await getSemesterRanges(token);
  
  scheduleRows.forEach(a => {
    const semesterKey = `${a.year}-${a.semester}`;
    const semesterRange = semesterRanges[semesterKey];
    if (a.date && a.startTime && a.endTime) {
      const eventStart = new Date(`${a.date}T${a.startTime}`);
      const eventEnd = new Date(`${a.date}T${a.endTime}`);

      events.push({
        id: `${a.id}-${a.date}-${a.startTime}`,
        title: a.course,
        start: eventStart,
        end: eventEnd,
        extendedProps: {
          instructor: a.instructor,
          status: a.status ?? "",
          course: a.course,
          section: a.section,
          semester: a.semester,
          year: a.year,
          semesterStart: semesterRange?.start ?? '',
          semesterEnd: semesterRange?.end ?? ''
        },
      });

      return;
    }
    
    if (a.day && a.startTime && a.endTime) {
      let normalizedDay = a.day;
      if (normalizedDay.length === 3) {
        const dayFullNames: Record<string, string> = {
          Sun: "Sunday",
          Mon: "Monday",
          Tue: "Tuesday",
          Wed: "Wednesday",
          Thu: "Thursday",
          Fri: "Friday",
          Sat: "Saturday",
        };
        normalizedDay = dayFullNames[normalizedDay] || normalizedDay;
      }
      const semesterKey = `${a.year}-${a.semester}`;
      const semesterRange = semesterRanges[semesterKey];
      if (!semesterRange) return;
      const allDates = getAllWeekdaysInRange(normalizedDay, semesterRange.start, semesterRange.end);
      const [startHour, startMinute] = a.startTime.split(":").map(Number);
      const [endHour, endMinute] = a.endTime.split(":").map(Number);
      allDates.forEach(date => {
        const eventStart = new Date(date);
        eventStart.setHours(startHour, startMinute, 0, 0);
        const eventEnd = new Date(date);
        eventEnd.setHours(endHour, endMinute, 0, 0);
        events.push({
          id: `${a.id}-${normalizedDay}-${a.startTime}-${eventStart.toISOString()}`,
          title: `${a.course} (${a.section})`,
          start: eventStart,
          end: eventEnd,
          extendedProps: {
            instructor: a.instructor,
            status: a.status ?? "",
            course: a.course,
            section: a.section,
            semester: a.semester,
            year: a.year,
            semesterStart: semesterRange?.start ?? '',
            semesterEnd: semesterRange?.end ?? ''
          },
        });
      });
    }
  });
  return events;
}
