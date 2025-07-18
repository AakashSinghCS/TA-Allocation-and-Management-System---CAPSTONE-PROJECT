import React from "react";
import { dayMap, getSemesterRanges } from "./ScheduleUtils";
import type { ScheduleRow } from "./ScheduleViewer.types";

const ScheduleViewerTable: React.FC<{ scheduleRows: ScheduleRow[]; startOfWeek: Date }> = ({ scheduleRows, startOfWeek }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
      <thead>
        <tr className="bg-gray-50 text-blue-900">
          <th className="px-4 py-3 text-left font-semibold">Course</th>
          <th className="px-4 py-3 text-left font-semibold">Section</th>
          <th className="px-4 py-3 text-left font-semibold">Day</th>
          <th className="px-4 py-3 text-left font-semibold">Time</th>
          <th className="px-4 py-3 text-left font-semibold">Semester</th>
          <th className="px-4 py-3 text-left font-semibold">Start Date</th>
          <th className="px-4 py-3 text-left font-semibold">End Date</th>
          <th className="px-4 py-3 text-left font-semibold">Status</th>
          <th className="px-4 py-3 text-left font-semibold">Instructor</th>
        </tr>
      </thead>
      <tbody>
        {scheduleRows.map(a => (
          <tr key={a.id + a.course + a.section + a.day + a.startTime} className="border-t border-gray-100 hover:bg-blue-50 transition-colors">
            <td className="px-4 py-2 font-medium text-blue-900">{a.course}</td>
            <td className="px-4 py-2 text-gray-700">{a.section}</td>
            <td className="px-4 py-2 text-blue-800 font-medium">{(() => {
              if (!a.day) return <span className="text-red-400">N/A</span>;
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
              const dayIdx = dayMap[normalizedDay];
              if (typeof dayIdx !== 'number') return a.day;
              const d = new Date(startOfWeek);
              d.setDate(startOfWeek.getDate() + dayIdx);
              const shortDay = normalizedDay.slice(0, 3);
              return `${shortDay}`;
            })()}
            </td>
            <td className="px-4 py-2">
              {a.day && a.startTime && a.endTime ? (
                <span className="inline-flex items-center gap-2 bg-blue-100 px-2 py-0.5 rounded-full text-xs">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {a.startTime} - {a.endTime}
                </span>
              ) : (
                <span className="text-red-400 text-xs">No schedule</span>
              )}
            </td>
            <td className="px-4 py-2 text-blue-900">{a.semester}</td>
            <td className="px-4 py-2 text-gray-700">{a.date ?? getSemesterRanges(a.year)[a.semester]?.start ?? "N/A"}</td>
            <td className="px-4 py-2 text-gray-700">{a.date ?? getSemesterRanges(a.year)[a.semester]?.end ?? "N/A"}</td>
            <td className="px-4 py-2">
              <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${a.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {a.status}
              </span>
            </td>
            <td className="px-4 py-2 text-gray-900">{a.instructor}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ScheduleViewerTable;
