import FullCalendar from "@fullcalendar/react";
import type Section from "../../../../interfaces/section/Section";
import type { ApplicationDto } from "../../../../interfaces/application/Application";
import { getDayNumber } from "../../../../utility/calendar/calendarUtils";
import { useMemo } from "react";
import timeGridPlugin from '@fullcalendar/timegrid';
import { useSendOffer } from "../../../../hooks/sendoffer/useSendOffer";
import { toast } from "react-toastify";

interface AllocationCalendarProps {
    selCourse: Section | null;
    selApp: ApplicationDto | null;
    onSendOfferSuccess: () => void;
}

export default function AllocationCalendar({ selCourse, onSendOfferSuccess, selApp }: AllocationCalendarProps) {
    const { sendOffer, loading } = useSendOffer();
    const required = selCourse?.need?.requiredGradingHours ?? 0;
    const allocated = selCourse?.need?.numHoursCurrentlyAllocated ?? 0;
    const remaining = Math.max(required - allocated, 0);
    const hoursOK = allocated >= required;
    // All course slots must be fully covered by student availability
    const hasAvailabilityMatch = (selCourse?.sectionSchedule || [])
        .filter(slot => slot.day && slot.startTime && slot.endTime)
        .every(slot =>
            isSlotFullyCovered({ day: slot.day!, startTime: slot.startTime!, endTime: slot.endTime! }, selApp?.availabilities || [])
        );

    const courseEvents = (selCourse?.sectionSchedule || []).map((slot, i) => {
        const dayNum = getDayNumber(slot.day);
        const isMatched = selApp?.availabilities.every(av =>
            dayNum === getDayNumber(av.day) &&
            slot.endTime !== undefined && slot.startTime !== undefined &&
            av.startTime < slot.endTime && av.endTime > slot.startTime
        ) ?? false;
        return {
            id: `c${i}`,
            title: 'Course Slot',
            daysOfWeek: [dayNum],
            startTime: slot.startTime,
            endTime: slot.endTime,
            backgroundColor: isMatched ? 'rgba(16,185,129,0.8)' : '#3B82F6CC',
        };
    });

    const appEvents = (selApp?.availabilities || []).map((slot, i) => ({
        id: `app${i}`,
        title: 'Student Availability',
        daysOfWeek: [getDayNumber(slot.day)],
        startTime: slot.startTime,
        endTime: slot.endTime,
        backgroundColor: 'rgba(35, 38, 39, 0.3)',
    }));

    // Computing segments of student availability that match course slots
    const bgMatchedEvents = useMemo(() => {
        return (selCourse?.sectionSchedule || []).flatMap((slot, i) => {
            if (!slot.day || !slot.startTime || !slot.endTime) return [];
            if (isSlotFullyCovered({ day: slot.day, startTime: slot.startTime, endTime: slot.endTime }, selApp?.availabilities || [])) {
                return [{
                    id: `matched-${i}`,
                    daysOfWeek: [getDayNumber(slot.day)],
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    title: 'Matched Avail',
                    backgroundColor: 'rgb(5, 168, 81)',
                }];
            } else {
                return [{
                    id: `unmatched-${i}`,
                    daysOfWeek: [getDayNumber(slot.day)],
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    title: 'Unmatched Slot',
                    backgroundColor: 'rgba(239,68,68,0.8)',
                }];
            }
        });
    }, [selCourse, selApp?.availabilities]);

    // Combine all events into a single list
    const events = [
        ...courseEvents,
        ...appEvents,
        ...bgMatchedEvents,
    ].filter((e): e is NonNullable<typeof e> => e !== null);


    const onSend = () => {
        if (!selApp || !selCourse?.id || !selCourse.need) return;
        if (selCourse.type === 'LECTURE'){
              toast.warn("Warning: You cannot allocate TAs to a LECTURE.");
              return;
            }
            if ((selCourse.numberOfTAsAllocated ?? 0) >= 1) {
              toast.warn("Warning: You are assigning more than 1 TA to this section.");
            }
        sendOffer(
            selApp,
            selCourse.id,
            selCourse.need,
            hasAvailabilityMatch,
            onSendOfferSuccess
        );
    };

    return (
        <>
            <h1 className="font-semibold text-xl">Weekly Calendar</h1>
            <div className="flex items-center space-x-6 mb-2">
                <div className="flex items-center space-x-1">
                    <span className="w-8 h-4 block rounded-sm" style={{ backgroundColor: '#3B82F6CC' }} />
                    <span className="text-sm">Course Slot</span>
                </div>
                <div className="flex items-center space-x-1">
                    <span className="w-8 h-4 block rounded-sm" style={{ backgroundColor: 'rgba(16,185,129,0.8)' }} />
                    <span className="text-sm">Matched Slot</span>
                </div>
                <div className="flex items-center space-x-1">
                    <span className="w-8 h-4 block rounded-sm" style={{ backgroundColor: 'rgba(239,68,68,0.8)' }} />
                    <span className="text-sm">UnMatched Slot</span>
                </div>
                <div className="flex items-center space-x-1">
                    <span className="w-8 h-4 block rounded-sm" style={{ backgroundColor: 'rgba(35, 38, 39, 0.3)' }} />
                    <span className="text-sm">Student Availability</span>
                </div>
            </div>
            <FullCalendar
                key={selCourse?.id ?? 'none'}
                plugins={[timeGridPlugin]}
                initialView="timeGridWeek"
                headerToolbar={false}
                allDaySlot={false}
                slotMinTime="06:00:00"
                slotMaxTime="20:00:00"
                slotEventOverlap={true}
                dayHeaderFormat={{ weekday: 'short' }}
                slotLabelFormat={{ hour: 'numeric', minute: '2-digit' }}
                events={events}
                height="auto"
            />
            <div className="bg-gray-100 p-4 rounded space-y-1">
                <p>
                    Remaining Hours:{' '}
                    <span className={hoursOK ? 'text-green-600' : 'text-red-600'}>
                        {hoursOK
                            ? `All met (${allocated} of ${required})`
                            : `${remaining} needed (Allocated: ${allocated}, Required: ${required})`}
                    </span>
                </p>
                <p>
                    Availability Match:{' '}
                    <span className={hasAvailabilityMatch ? 'text-green-600' : 'text-red-600'}>
                        {hasAvailabilityMatch ? 'Yes' : 'No'}
                    </span>
                </p>
            </div>
            <div className="flex justify-end">
                <button
                    onClick={onSend}
                    disabled={!selCourse || !selApp || loading}
                    className="px-6 py-2 bg-[#040941] text-white rounded disabled:opacity-50"
                >
                    {loading ? 'Sending…' : 'Send Offer'}
                </button>
            </div>
        </>
    )
}

// Convert "HH:mm" to minutes since midnight
function timeToMinutes(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}

// Check if a course slot is fully covered by any student availability (numerical time comparison)
function isSlotFullyCovered(
    slot: { day: string; startTime: string; endTime: string },
    avails: { day: string; startTime: string; endTime: string }[]
) {
    const dayNum = getDayNumber(slot.day);
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);
    return avails.some(a => {
        if (getDayNumber(a.day) !== dayNum) return false;
        const availStart = timeToMinutes(a.startTime);
        const availEnd = timeToMinutes(a.endTime);
        return availStart <= slotStart && availEnd >= slotEnd;
    });
}