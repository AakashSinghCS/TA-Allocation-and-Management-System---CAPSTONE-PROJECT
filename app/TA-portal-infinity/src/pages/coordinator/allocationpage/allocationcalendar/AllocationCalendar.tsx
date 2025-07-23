import FullCalendar from "@fullcalendar/react";
import { type EventClickArg } from '@fullcalendar/core';
import type Section from "../../../../interfaces/section/Section";
import type { ApplicationDto } from "../../../../interfaces/application/Application";
import { getDayNumber } from "../../../../utility/calendar/calendarUtils";
import { useMemo, useState } from "react";
import timeGridPlugin from '@fullcalendar/timegrid';
import { useSendOffer } from "../../../../hooks/sendoffer/useSendOffer";

interface AllocationCalendarProps {
    selCourse: Section | null;
    selApp: ApplicationDto | null;
    onSendOfferSuccess: () => void;
}

export default function AllocationCalendar({ selCourse, onSendOfferSuccess, selApp }: AllocationCalendarProps) {
    const { sendOffer, loading } = useSendOffer();
    const [gradingHours, setGradingHours] = useState<string>('');
    const [labPrepHours, setLabPrepHours] = useState<string>('');
    const [offSlots, setOffSlots] = useState<Set<number>>(new Set());

    const required = selCourse?.need?.requiredGradingHours ?? 0;
    const allocated = selCourse?.need?.numHoursCurrentlyAllocated ?? 0;
    const remaining = Math.max(required - allocated, 0);
    const hoursOK = allocated >= required;
    // All course slots must be fully covered by student availability
    const hasAvailabilityMatch = (selCourse?.sectionSchedule || [])
        .filter(s => s.day && s.startTime && s.endTime)
        .every(slot =>
            isSlotFullyCovered(
                { day: slot.day!, startTime: slot.startTime!, endTime: slot.endTime! },
                selApp?.availabilities || []
            )
        );

    const courseEvents = (selCourse?.sectionSchedule || []).map((slot, i) => {
        const dayNum = getDayNumber(slot.day);
        const isClear = isSlotFullyCovered(
            { day: slot.day!, startTime: slot.startTime!, endTime: slot.endTime! },
            selApp?.availabilities || []
        );

        return {
            id: `c${i}`,
            title: 'Course Slot',
            daysOfWeek: [dayNum],
            startTime: slot.startTime,
            endTime: slot.endTime,
            backgroundColor: isClear ? 'rgba(16,185,129,0.8)' : '#EF4444CC', // green when no conflict, red when conflict
            extendedProps: { type: 'course', slotIndex: i, isClear },
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
            const clear = isSlotFullyCovered(
                { day: slot.day, startTime: slot.startTime, endTime: slot.endTime },
                selApp?.availabilities || []
            );
            if (!clear) return []; // skip unmatched
            return [{
                id: `matched-${i}`,
                daysOfWeek: [getDayNumber(slot.day)],
                startTime: slot.startTime,
                endTime: slot.endTime,
                title: 'Matched (no conflict)',
                backgroundColor: 'rgb(5, 168, 81)',
            }];
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
        sendOffer(
            selApp,
            selCourse.id,
            selCourse.need,
            Number(totalSectionHours),
            Number(labPrepHours),
            Number(gradingHours),
            hasAvailabilityMatch,
            onSendOfferSuccess
        );
    };


    const totalSectionMinutes = useMemo(
        () => calcSectionMinutes(selCourse, offSlots),
        [selCourse, offSlots]
    );
    const totalSectionHours = +(totalSectionMinutes / 60).toFixed(2);


    const allHoursPresent =
        totalSectionHours > 0 &&
        gradingHours.trim() !== '' &&
        labPrepHours.trim() !== '' &&
        !isNaN(Number(gradingHours)) &&
        !isNaN(Number(labPrepHours));

    const disableOffer = !selCourse || !selApp || loading || !allHoursPresent;

    const onEventClick = (info: EventClickArg) => {
        const { event } = info;
        const { type, slotIndex } = event.extendedProps as { type?: string; slotIndex?: number };

        if (type !== 'course' || slotIndex === undefined) return; // ignore non-course events

        setOffSlots(prev => {
            const next = new Set(prev);
            if (next.has(slotIndex)) {
                next.delete(slotIndex);
            } else {
                next.add(slotIndex);
            }
            return next;
        });

        // Change color immediately for better UX (optional; state re-render will also do it)
        const isOff = !offSlots.has(slotIndex);
        event.setProp(
            'backgroundColor',
            isOff ? 'rgba(156,163,175,0.45)' : (event.extendedProps.isMatched ? 'rgba(16,185,129,0.8)' : '#3B82F6CC')
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
                eventClick={onEventClick}
                height="auto"
            />
            <div className="bg-gray-100 p-4 rounded-md space-y-3">

                <p>
                    Remaining Grading Hours:{' '}
                    <span className={hoursOK ? 'text-green-600' : 'text-red-600'}>
                        {hoursOK
                            ? `All met (${allocated} of ${required})`
                            : `${remaining} needed (Allocated: ${allocated}, Required: ${required})`}
                    </span>
                </p>
                <p>
                    Unavailability Match:{' '}
                    <span className={hasAvailabilityMatch ? 'text-green-600' : 'text-red-600'}>
                        {hasAvailabilityMatch ? 'No' : 'Yes'}
                    </span>
                </p>

                {/* Hour inputs */}
                <div className="pt-2 flex flex-wrap gap-4 xl:grid xl:grid-cols-3">
                    {/* Section time */}
                    <label className="flex flex-row items-center gap-2 min-w-[220px] flex-1 md:flex-none">
                        <span className="text-sm font-medium whitespace-nowrap">
                            Selected Total Section Time:
                        </span>
                        <span className="text-blue-600 font-medium whitespace-nowrap">
                            {totalSectionHours}h
                        </span>
                    </label>

                    {/* Grading hours */}
                    <label className="flex flex-row items-center gap-2 min-w-[220px] flex-1 md:flex-none">
                        <span className="text-sm font-medium whitespace-nowrap">
                            Grading Hours:
                        </span>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={gradingHours}
                            onChange={numericOnly(setGradingHours)}
                            className="w-20 border rounded px-2 py-1 text-right"
                            placeholder="10"
                        />
                    </label>

                    {/* Lab prep hours */}
                    <label className="flex flex-row items-center gap-2 min-w-[220px] flex-1 md:flex-none">
                        <span className="text-sm font-medium whitespace-nowrap">
                            Lab Prep Hours:
                        </span>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={labPrepHours}
                            onChange={numericOnly(setLabPrepHours)}
                            className="w-20 border rounded px-2 py-1 text-right"
                            placeholder="4"
                        />
                    </label>
                </div>

                {/* Sum line */}
                <div className="mt-3 border-t pt-3 text-sm flex flex-wrap items-center justify-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-200 text-blue-800 font-medium whitespace-nowrap">
                        Section {totalSectionHours}
                    </span>
                    <span className="font-medium">+</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-800 font-medium whitespace-nowrap">
                        Grading {gradingHours || 0}
                    </span>
                    <span className="font-medium">+</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-800 font-medium whitespace-nowrap">
                        Lab Prep {labPrepHours || 0}
                    </span>
                    <span className="font-medium">=</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-300 text-slate-900 font-semibold whitespace-nowrap">
                        {Number(totalSectionHours) + Number(gradingHours) + Number(labPrepHours)}
                    </span>
                </div>
            </div>
            <div className="flex justify-end">
                <button
                    onClick={onSend}
                    disabled={disableOffer}
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

function rangesOverlap(startA: number, endA: number, startB: number, endB: number) {
    return startA < endB && endA > startB; // strict overlap check
}

// Check if a course slot is fully covered by any student availability (numerical time comparison)
function slotOverlapsAnyBlock(
    slot: { day: string; startTime: string; endTime: string },
    blocks: { day: string; startTime: string; endTime: string }[]
) {
    const dayNum = getDayNumber(slot.day);
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);

    return blocks.some(b => {
        if (getDayNumber(b.day) !== dayNum) return false;
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        return rangesOverlap(slotStart, slotEnd, bStart, bEnd);
    });
}

// Keep the old name but invert the meaning: "fully covered" == NO overlap
function isSlotFullyCovered(
    slot: { day: string; startTime: string; endTime: string },
    blocks: { day: string; startTime: string; endTime: string }[]
) {
    return !slotOverlapsAnyBlock(slot, blocks);
}

function calcSectionMinutes(section: Section | null | undefined, off: Set<number>): number {
    if (!section?.sectionSchedule) return 0;
    return section.sectionSchedule.reduce((sum, slot, idx) => {
        if (off.has(idx) || !slot.startTime || !slot.endTime) return sum;
        return sum + (timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime));
    }, 0);
}

const numericOnly =
    (setter: (v: string) => void) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const v = e.target.value.replace(/[^\d.]/g, ''); // allow digits & one dot
            // optional: keep only first dot
            const cleaned = v.replace(/^(\d*\.\d*).*$/, '$1');
            setter(cleaned);
        };