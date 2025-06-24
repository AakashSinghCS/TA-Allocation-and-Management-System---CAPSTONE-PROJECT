import React from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import type Section from '../../interfaces/section/Section';
import type { Allocation } from '../../interfaces/allocation/Allocation';
import { getDayNumber, formatTimeRange } from '../../utility/calendar/calendarUtils';

interface TAAllocationPageProps {
  section?: Section; // made optional in case it's not passed
}

const TAAllocationPage: React.FC<TAAllocationPageProps> = ({ section }) => {
  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-600">
        Error: No section data provided.
      </div>
    );
  }

  const { sectionDetails, sectionSchedule, need, hasCompleted, allocations = [] } = section;

  const courseTitle = `${sectionDetails?.deptCode} ${sectionDetails?.courseNum} - ${sectionDetails?.name}`;

  const calendarEvents = (sectionSchedule ?? []).map((slot, idx) => ({
    id: `slot-${idx}`,
    title: courseTitle,
    daysOfWeek: [getDayNumber(slot.day)],
    startTime: slot.startTime,
    endTime: slot.endTime,
    display: 'block',
  }));

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 bg-[#f4f6fc]">
      <div className="max-w-[1100px] mx-auto">
        <h1 className="text-4xl font-bold text-[#040941] mb-10 text-center">TA Allocation Overview</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
          {/* Section Info */}
          <section className="bg-white p-6 rounded-xl shadow-md space-y-2">
            <h2 className="text-xl font-bold text-[#040941] mb-2">{courseTitle}</h2>
            <p><strong>Term:</strong> {sectionDetails?.term}</p>
            <p><strong>Section:</strong> {sectionDetails?.section}</p>
            <p><strong>Pre-requisites:</strong> {need?.courseNeeds?.map(c => `${c.deptCode} ${c.courseNum}`).join(', ')}</p>
            <p><strong>Schedule:</strong> {(sectionSchedule ?? []).map(s => `${s.day} ${formatTimeRange(s.startTime, s.endTime)}`).join(', ')}</p>
            <p><strong>Grading Hours Needed:</strong> {need?.requiredGradingHours}</p>
            <p>
              <strong>Pre-requisite Status:</strong>{' '}
              <span className={hasCompleted ? 'text-green-600' : 'text-red-600'}>
                {hasCompleted ? 'Complete' : 'Incomplete'}
              </span>
            </p>
          </section>

          {/* TA Allocations */}
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-[#040941] mb-4">TA Allocations</h2>
            {allocations.length > 0 ? (
              <ul className="space-y-4 text-sm">
                {allocations.map((alloc, idx) => (
                  <li
                    key={alloc.id ?? idx}
                    className="border border-gray-200 rounded-lg p-4 bg-[#f9fafb]"
                  >
                    <p className="font-semibold text-[#040941]">
                      {alloc.student
                        ? `${alloc.student.firstName ?? ''} ${alloc.student.lastName ?? ''}`.trim() || 'Unnamed Student'
                        : 'Unnamed Student'}
                    </p>
                    <p><strong>Hours Allocated:</strong> {alloc.numberOfHours}</p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className={alloc.isConfirmed ? 'text-green-600' : 'text-yellow-600'}>
                        {alloc.isConfirmed ? 'Confirmed' : 'Pending'}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No TAs allocated yet for this section.</p>
            )}
          </section>
        </div>

        {/* Calendar */}
        <section className="bg-white p-6 rounded-2xl shadow-md border-t-[6px] border-[#040941]">
          <h2 className="text-xl font-bold text-[#040941] mb-6 text-center">
            Weekly Calendar: Course Schedule
          </h2>
          <FullCalendar
            plugins={[timeGridPlugin]}
            initialView="timeGridWeek"
            allDaySlot={false}
            slotMinTime="08:00:00"
            slotMaxTime="18:00:00"
            events={calendarEvents}
            height="auto"
            headerToolbar={false}
          />
        </section>
      </div>
    </div>
  );
};

export default TAAllocationPage;
