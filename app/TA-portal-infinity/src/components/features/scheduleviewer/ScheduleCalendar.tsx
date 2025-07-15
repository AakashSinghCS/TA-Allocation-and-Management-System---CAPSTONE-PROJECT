import React, { useRef, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import { CalendarClock, CalendarX2 } from "lucide-react";
import { allocationsToEvents } from "./allocationsToEvents";
import { getNextUpcomingSchedules } from "./ScheduleUtils";
import { exportCSV, exportICS } from "./ScheduleExport";
import type { ScheduleRow } from "./ScheduleViewer.types";

function renderEventContent(eventInfo: any) {
  return (
    <div className="p-1">
      <div className="font-semibold text-blue-900">{eventInfo.event.title}</div>
      <div className="text-xs text-blue-900">{eventInfo.timeText}</div>
      <div className="text-xs text-blue-900">{eventInfo.event.extendedProps.instructor}</div>
    </div>
  );
}

const ScheduleCalendar: React.FC<{ scheduleRows: ScheduleRow[] }> = ({ scheduleRows }) => {
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

  useEffect(() => {
    setCalendarDate(new Date(startOfWeek));
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      api.gotoDate(new Date(startOfWeek));
    }
  }, [weekOffset]);

  return (
    <div className="flex flex-col md:flex-row gap-16">
      {/* Left: calendar only (export buttons should be rendered by parent) */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="bg-white rounded-lg shadow border border-gray-300 p-2 md:p-8 w-full">
          <div className="w-full mb-4">
            <div className="relative w-full">
              <div className="absolute left-0 top-0 w-full h-12 rounded-xl" style={{ background: "#f3f4f6", zIndex: 0 }}></div>
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
            headerToolbar={{ left: "", center: "", right: "" }}
            events={events}
            allDaySlot={false}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            height={700}
            eventContent={renderEventContent}
            dayHeaderFormat={{ weekday: "long" }}
          />
        </div>
      </div>
      {/* Right: Upcoming schedules sidebar, aligned to top, no white box, extra left margin */}
      <div className="w-full md:w-60 flex-shrink-0 mt-0 md:mt-0">
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
  );
};

export default ScheduleCalendar;
