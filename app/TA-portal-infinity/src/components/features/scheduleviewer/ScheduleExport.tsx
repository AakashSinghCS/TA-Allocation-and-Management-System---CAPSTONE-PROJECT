import React from "react";
import { createEvents } from "ics";
import { dayMap, getSemesterRanges, getAllWeekdaysInRange } from "./ScheduleUtils";
import type { ScheduleRow } from "./ScheduleViewer.types";

// CSV Export schedule
export function exportCSV(scheduleRows: ScheduleRow[]) {
  const header = ["Course", "Section", "Instructor", "Day", "Start Time", "End Time", "Semester", "Year", "Number Of Hours"];
  const rows = scheduleRows.map(a => [
    a.course,
    a.section,
    a.instructor,
    a.day,
    a.startTime,
    a.endTime,
    a.semester,
    a.year,
    a.numberOfHours,
  ]);
  const csvContent = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const aTag = document.createElement("a");
  aTag.href = url;
  aTag.download = "schedule.csv";
  aTag.click();
  URL.revokeObjectURL(url);
}

// ICS Export for schedule
export function exportICS(scheduleRows: ScheduleRow[]) {
  const events = scheduleRows
    .filter(a => a.day && a.startTime && a.endTime)
    .flatMap(a => {
      const semesterRange = getSemesterRanges(a.year)[a.semester];
      if (!semesterRange) return [];
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
      const allDates = getAllWeekdaysInRange(normalizedDay, semesterRange.start, semesterRange.end);
      const [startHour, startMinute] = a.startTime.split(":").map(Number);
      const [endHour, endMinute] = a.endTime.split(":").map(Number);
      return allDates.map(date => {
        const eventStart = new Date(date);
        eventStart.setHours(startHour, startMinute, 0, 0);
        const eventEnd = new Date(date);
        eventEnd.setHours(endHour, endMinute, 0, 0);
        return {
          title: `${a.course} (${a.section})`,
          description: `Instructor: ${a.instructor}`,
          start: [
            eventStart.getFullYear(),
            eventStart.getMonth() + 1,
            eventStart.getDate(),
            eventStart.getHours(),
            eventStart.getMinutes(),
          ] as [number, number, number, number, number],
          end: [
            eventEnd.getFullYear(),
            eventEnd.getMonth() + 1,
            eventEnd.getDate(),
            eventEnd.getHours(),
            eventEnd.getMinutes(),
          ] as [number, number, number, number, number],
        };
      });
    })
    .filter(Boolean);

  createEvents(
    events,
    (error: Error | undefined, value: string) => {
      if (error) {
        console.log(error);
        return;
      }
      const blob = new Blob([value], { type: "text/calendar" });
      const url = URL.createObjectURL(blob);
      const aTag = document.createElement("a");
      aTag.href = url;
      aTag.download = "schedule.ics";
      aTag.click();
      URL.revokeObjectURL(url);
    }
  );
}

const ScheduleExport: React.FC<{ scheduleRows: ScheduleRow[] }> = ({ scheduleRows }) => (
  <div className="flex gap-2 mb-4 justify-end">
    <button
      onClick={() => exportCSV(scheduleRows)}
      className="px-3 py-2 bg-[#040941] text-white rounded-lg text-sm font-semibold hover:bg-blue-800 hover:text-white transition-colors"
    >
      Export CSV
    </button>
    <button
      onClick={() => exportICS(scheduleRows)}
      className="px-3 py-2 bg-green-900 text-white rounded-lg text-sm font-semibold hover:bg-green-700 hover:text-white transition-colors"
    >
      Export to Calendar
    </button>
  </div>
);

export default ScheduleExport;
