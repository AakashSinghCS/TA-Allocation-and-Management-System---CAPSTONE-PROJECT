import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import { fetchStudentAllocationHistory } from "../../../api/allocation/fetchStudentAllocationHistory";
import { fetchSectionSchedule } from "../../../api/section/fetchSectionSchedule";
import { useAuth } from "../../../context/AuthContext";
import type SectionSchedule from "../../../interfaces/section/SectionSchedule";
import { createEvents } from "ics";
import { CalendarX2 , CalendarClock } from "lucide-react";
import type { Allocation } from "../../../interfaces/allocation/Allocation";

// Flat schedule row for UI/table/calendar
type ScheduleRow = {
  id: number;
  course: string;
  section: string;
  instructor: string;
  day: string;
  startTime: string;
  endTime: string;
  status: string;
  semester: string;
  year: number;
  numberOfHours: number;
};

const dayMap: Record<string, number> = {
  "Sunday": 0,
  "Monday": 1,
  "Tuesday": 2,
  "Wednesday": 3,
  "Thursday": 4,
  "Friday": 5,
  "Saturday": 6,
};

// Dynamic semester date ranges per year
function getSemesterRanges(year: number): Record<string, { start: string; end: string }> {
  return {
    W1: { start: `${year}-01-05`, end: `${year}-04-09` },
    S1: { start: `${year}-05-11`, end: `${year}-06-18` },
    S2: { start: `${year}-07-06`, end: `${year}-08-13` },
    W2: { start: `${year}-09-02`, end: `${year}-12-05` },
  };
}

function getFirstWeekdayInRange(weekday: string, rangeStart: string) {
  const dayNum = dayMap[weekday];
  if (typeof dayNum !== "number") return null;
  const startDate = new Date(rangeStart);
  const startDay = startDate.getDay();
  let diff = dayNum - startDay;
  if (diff < 0) diff += 7;
  startDate.setDate(startDate.getDate() + diff);
  return startDate;
}

function getAllWeekdaysInRange(weekday: string, rangeStart: string, rangeEnd: string) {
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

// CSV Export schedule
function exportCSV(scheduleRows: ScheduleRow[]) {
  const header = ["Course", "Section", "Instructor", "Day", "Start Time", "End Time", "Semester", "Year", "Status", "Number Of Hours"];
  const rows = scheduleRows.map(a => [
    a.course,
    a.section,
    a.instructor,
    a.day,
    a.startTime,
    a.endTime,
    a.semester,
    a.year,
    a.status,
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
function exportICS(scheduleRows: ScheduleRow[]) {
  function getFirstWeekdayInRange(weekday: string, rangeStart: string) {
    const dayNum = dayMap[weekday];
    if (typeof dayNum !== "number") return null;
    const startDate = new Date(rangeStart);
    const startDay = startDate.getDay();
    let diff = dayNum - startDay;
    if (diff < 0) diff += 7;
    startDate.setDate(startDate.getDate() + diff);
    return startDate;
  }

  function getAllWeekdaysInRange(weekday: string, rangeStart: string, rangeEnd: string) {
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

// allocationsToEvents for ScheduleRow
function allocationsToEvents(scheduleRows: ScheduleRow[]) {
  const events: any[] = [];
  scheduleRows.forEach(a => {
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
      const semesterRange = getSemesterRanges(a.year)[a.semester];
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
          },
        });
      });
    }
  });
  return events;
}

// Update getAllocationDate to accept ScheduleRow and startOfWeek
function getAllocationDate(a: ScheduleRow, startOfWeek: Date) {
  if (!a.day || !a.startTime) return null;
  const dayIdx = dayMap[a.day];
  if (typeof dayIdx !== 'number') return null;
  const d = new Date(startOfWeek);
  d.setDate(startOfWeek.getDate() + dayIdx);
  return d;
}

// next three upcoming schedule events
function getNextUpcomingSchedules(events: any[], count: number = 3) {
  const now = new Date();
  // future events
  const futureEvents = events.filter(e => new Date(e.start) > now);
  // Sort by start date ascending
  futureEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  return futureEvents.slice(0, count);
}

// Helper to flatten allocation for UI/table/calendar
function flattenAllocation(a: Allocation, sch?: { day: string; startTime: string; endTime: string }): ScheduleRow {
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

const ScheduleViewer: React.FC<{ scheduleRows: ScheduleRow[] }> = ({ scheduleRows }) => {
  const calendarRef = useRef<FullCalendar>(null);
  const events = allocationsToEvents(scheduleRows);
  const getInitialWeekStart = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0,0,0,0);
    return weekStart;
  };
  const [calendarDate, setCalendarDate] = useState(getInitialWeekStart());

  // Week selector state
  const [weekOffset, setWeekOffset] = useState(0); 
  
  const getStartOfWeek = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + weekOffset * 7);
    start.setHours(0,0,0,0);
    return start;
  };
  const getEndOfWeek = (startOfWeek: Date) => {
    const end = new Date(startOfWeek);
    end.setDate(startOfWeek.getDate() + 6);
    end.setHours(23,59,59,999);
    return end;
  };
  const startOfWeek = getStartOfWeek();
  const endOfWeek = getEndOfWeek(startOfWeek);
  const format = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  // Sync calendar view with weekOffset
  useEffect(() => {
    setCalendarDate(new Date(startOfWeek));
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.gotoDate(new Date(startOfWeek));
    }
  }, [weekOffset]);

  // Get date for allocation in this week
  function getAllocationDate(a: ScheduleRow, startOfWeek: Date) {
    if (!a.day || !a.startTime) return null;
    const dayIdx = dayMap[a.day];
    if (typeof dayIdx !== 'number') return null;
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + dayIdx);
    return d;
  }

  // Filter allocations for this week
  const weekAllocs = scheduleRows.filter(a => {
    const d = getAllocationDate(a, startOfWeek);
    return d && d >= startOfWeek && d <= endOfWeek;
  });
  // Completed = status CONFIRMED, Upcoming = not CONFIRMED
  const completed = weekAllocs.filter(a => a.status === 'CONFIRMED');
  const upcoming = weekAllocs.filter(a => a.status !== 'CONFIRMED');
  const percent = weekAllocs.length === 0 ? 100 : Math.round((completed.length / weekAllocs.length) * 100);

  return (
    <div className="min-h-screen p-4 md:p-8 ">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-[#040941] mb-8 tracking-tight">
            Allocations - Calendar View
          </h1>
         
          <div className="max-w-4xl w-full mx-auto">
            <div className="flex gap-2 mb-4 justify-end">
              <button
                onClick={() => exportCSV(scheduleRows)}
                className="px-3 py-2 bg-[#040941] text-white rounded-lg text-sm font-semibold hover:bg-white hover:text-[#040941] transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={() => exportICS(scheduleRows)}
                className="px-3 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-white hover:text-green-700 transition-colors"
              >
                Export to Calendar
              </button>
            </div>
            <div className="bg-white rounded-lg shadow border border-gray-300 p-2">
          {/* Week range selector */}
          <div className="w-full mb-4">
            <div className="relative w-full">
              <div
                className="absolute left-0 top-0 w-full h-12 rounded-xl"
                style={{
                  background: "#f3f4f6",
                  zIndex: 0,
                }}
              ></div>
              <div className="relative flex items-center justify-center w-full h-12 px-4" style={{ zIndex: 1 }}>
                <button className="text-2xl text-gray-400 hover:text-blue-700 mr-2" onClick={() => setWeekOffset(weekOffset - 1)}>&#60;</button>
                <span className="text-lg font-semibold text-[#040941] text-center">{format(startOfWeek)} to {format(endOfWeek)}</span>
                <button className="text-2xl text-gray-400 hover:text-blue-700 ml-2" onClick={() => setWeekOffset(weekOffset + 1)}>&#62;</button>
              </div>
            </div>
          </div>
              <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, dayGridPlugin]}
                initialView="timeGridWeek"
                initialDate={calendarDate}
                headerToolbar={{
                  left: "",
                  center: "",
                  right: "",
                }}
                events={events}
                allDaySlot={false}
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                height="auto"
                eventContent={renderEventContent}
                dayHeaderFormat={{ weekday: "long" }}
              />
            </div>
            {/* confirmed allocations list */}
            <div className="mt-8">
              {scheduleRows.length === 0 ? (
                <div className="text-gray-500 text-center text-lg py-8 flex flex-col items-center">
                  <div className="mb-4 flex justify-center ">
                    <CalendarX2 size={36} color="gray" />
                  </div>
                  Sit back, relax! No Confirmed Allocations yet.
                </div>
              ) : (
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
                              <span className="inline-flex items-center gap-1 bg-blue-100 px-2 py-0.5 rounded-full text-xs">
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
                          <td className="px-4 py-2 text-gray-700">{getSemesterRanges(a.year)[a.semester]?.start || "N/A"}</td>
                          <td className="px-4 py-2 text-gray-700">{getSemesterRanges(a.year)[a.semester]?.end || "N/A"}</td>
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
              )}
            </div>
          </div>
        </div>
        {/* upcoming schedules */}
        <div className="w-full md:w-60 flex-shrink-0 mt-32 md:mt-30">
            <h2 className="text-lg font-bold text-[#040941] mb-4 text-center">
                <CalendarClock size={36} className="inline-block mr-2" />
                Upcoming Schedule(s)
            </h2>
            {events.length === 0 ? (
                <div className="text-gray-500 text-center flex flex-col items-center py-6">
                    <CalendarX2 size={32} color="gray" className="mb-2" />
                    Sit back, relax! No upcoming schedules.
                </div>
            ) : (
                <div>
                    {getNextUpcomingSchedules(events, 3).map((ev: any) => (
                        <div key={ev.id} className="mb-6">
                            <div className="font-semibold text-blue-900 mt-2">{ev.title}</div>
                            <div className="text-xs text-blue-700">
                                {new Date(ev.start).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                {ev.end ? ` - ${new Date(ev.end).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` : ""}
                            </div>
                            <div className="text-xs text-gray-600">Instructor: {ev.extendedProps?.instructor}</div>
                            <div className="text-xs text-gray-600">Section: {ev.extendedProps?.section}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

function renderEventContent(eventInfo: any) {
  return (
    <div className="p-1">
      <div className="font-semibold text-blue-900">{eventInfo.event.title}</div>
      <div className="text-xs text-blue-700">
        {eventInfo.timeText}
      </div>
      <div className="text-xs text-gray-600">
        Instructor: {eventInfo.event.extendedProps.instructor}
      </div>
    </div>
  );
}

const StudentSchedulePage: React.FC = () => {
  const { userId, token } = useAuth();
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!userId || !token) return;
      setLoading(true);
      try {
        const all = await fetchStudentAllocationHistory(Number(userId), token);
        console.log("All allocations fetched:", all);
        const confirmed = all.filter(a => a.status === "CONFIRMED");
        console.log("Confirmed allocations:", confirmed);
        const allocationsWithSchedule = await Promise.all(
          confirmed.map(async (alloc: any) => {
            if (!alloc.section || typeof alloc.section.id !== "number") {
              return [flattenAllocation(alloc)];
            }
            let sectionSchedule: SectionSchedule[] = [];
            try {
              const rawSectionSchedule = await fetchSectionSchedule(alloc.section.id, token);
              sectionSchedule = Array.isArray(rawSectionSchedule)
                ? rawSectionSchedule
                : [];
            } catch {
              // no schedule
            }
            return sectionSchedule.length > 0
              ? sectionSchedule.map(sch => flattenAllocation(alloc, {
      day: sch.day ?? "",
      startTime: sch.startTime ?? "",
      endTime: sch.endTime ?? ""
    }))
  : [flattenAllocation(alloc)];
          })
        );
        setScheduleRows(allocationsWithSchedule.flat());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, token]);

  if (loading) return <div>Loading schedule...</div>;

  return <ScheduleViewer scheduleRows={scheduleRows} />;
};

export default StudentSchedulePage;