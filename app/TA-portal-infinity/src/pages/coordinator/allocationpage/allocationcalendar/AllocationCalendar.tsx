import FullCalendar from "@fullcalendar/react";
import { type EventClickArg } from '@fullcalendar/core';
import type Section from "../../../../interfaces/section/Section";
import type { ApplicationDto } from "../../../../interfaces/application/Application";
import { getDayNumber } from "../../../../utility/calendar/calendarUtils";
import { useEffect, useMemo, useState } from "react";
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
    const [onSlots, setOnSlots] = useState<Set<number>>(new Set());

    const required = selCourse?.need?.requiredGradingHours ?? 0;
    const allocated = selCourse?.need?.numHoursCurrentlyAllocated ?? 0;
    const remaining = Math.max(required - allocated, 0);
    const hoursOK = allocated >= required;
    const allIdxs = useMemo(
        () => (selCourse?.sectionSchedule || []).map((_, i) => i),
        [selCourse]
    );
    useEffect(() => {
        setOnSlots(new Set(allIdxs)); // everything ON by default
    }, [allIdxs]);

    const totalSectionMinutes = useMemo(
        () => calcSectionMinutes(selCourse, onSlots),
        [selCourse, onSlots]
    );
    const totalSectionHours = +(totalSectionMinutes / 60).toFixed(2);

    const anyHoursPresent =
        totalSectionHours > 0 || ((+gradingHours || 0) + (+labPrepHours || 0)) > 0;



    // const hasUnavailabilityMatch = (selCourse?.sectionSchedule || [])
    //     .filter(s => s.day && s.startTime && s.endTime)
    //     .every(slot =>
    //         isSlotHasOverlap(
    //             { day: slot.day!, startTime: slot.startTime!, endTime: slot.endTime! },
    //             selApp?.availabilities || []
    //         )
    //     ) && totalSectionHours>0;
    const hasUnavailabilityMatch =
        totalSectionHours > 0 &&
        (selCourse?.sectionSchedule || []).some(s =>
            s.day && s.startTime && s.endTime &&
            isSlotHasOverlap({ day: s.day!, startTime: s.startTime!, endTime: s.endTime! }, selApp?.availabilities || [])
        );

    const disableOffer = !selCourse || !selApp || loading || !anyHoursPresent || hasUnavailabilityMatch;

    const courseEvents = useMemo(() => (
        (selCourse?.sectionSchedule || []).map((slot, i) => {
            const isBad = isSlotHasOverlap(
                { day: slot.day!, startTime: slot.startTime!, endTime: slot.endTime! },
                selApp?.availabilities || []
            );
            return {
                id: `c${i}`,
                title: 'Section',
                daysOfWeek: [getDayNumber(slot.day)],
                startTime: slot.startTime,
                endTime: slot.endTime,
                backgroundColor: colorForSection(i, isBad, onSlots),
                extendedProps: { type: 'section', slotIndex: i, isBad },
            };
        })
    ), [selCourse, selApp?.availabilities, onSlots]);

    const appEvents = (selApp?.availabilities || []).map((slot, i) => ({
        id: `app${i}`,
        title: 'Student Unavailability',
        daysOfWeek: [getDayNumber(slot.day)],
        startTime: slot.startTime,
        endTime: slot.endTime,
        extendedProps: { type: 'unavail' },
    }));

    const events = [
        ...courseEvents,
        ...appEvents,
        // ...bgMatchedEvents,
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
            hasUnavailabilityMatch,
            onSendOfferSuccess
        );
    };

    const onEventClick = (info: EventClickArg) => {
        const { type } = info.event.extendedProps as { type?: string };
        if (type !== 'section') return;
        setOnSlots(prev => {
            const next = new Set(prev);

            const sectionOn = allIdxs.every(i => onSlots.has(i));
            if (sectionOn) {
                // turn ALL off
                allIdxs.forEach(i => next.delete(i));
            } else {
                // turn ALL on
                allIdxs.forEach(i => next.add(i));
            }
            return next;
        });
    };

    return (
        <>
            <h1 className="font-semibold text-xl">Weekly Calendar</h1>
            <div className="flex items-center space-x-6 mb-2 w-full">
                <div className="flex items-center space-x-1">
                    <span className="w-8 h-4 block rounded-sm" style={{ background: GREEN }} />
                    <span className="text-sm">No Overlap</span>
                </div>
                {/* <div className="flex items-center space-x-1">
                    <span className="w-8 h-4 block rounded-sm" style={{ backgroundColor: 'rgba(16,185,129,0.8)' }} />
                    <span className="text-sm">Matched</span>
                </div> */}
                <div className="flex items-center space-x-1">
                    <span className="w-8 h-4 block rounded-sm" style={{ backgroundColor: 'rgba(239,68,68,0.8)' }} />
                    <span className="text-sm">Overlap Exists</span>
                </div>
                <div className="flex items-center space-x-1">
                    <span className="w-8 h-4 block rounded-sm" style={{ backgroundColor: 'rgba(156,163,175,0.45)' }} />
                    <span className="text-sm">Section Toggled Off</span>
                </div>
                <span className="ml-auto text-xs">
                    Click on a section to toggle hours
                </span>
            </div>
            <FullCalendar
                key={selCourse?.id ?? 'none'}
                plugins={[timeGridPlugin]}
                initialView="timeGridWeek"
                headerToolbar={false}
                allDaySlot={false}
                slotMinTime="06:00:00"
                slotMaxTime="21:00:00"
                slotEventOverlap={true}
                dayHeaderFormat={{ weekday: 'short' }}
                slotLabelFormat={{ hour: 'numeric', minute: '2-digit' }}
                events={events}
                eventClick={onEventClick}
                eventClassNames={(arg) => {
                    const t = arg.event.extendedProps.type;
                    if (t === 'unavail') {
                        return ['cursor-not-allowed', 'fc-unavail']; // add custom class
                    }
                    if (t === 'section') {
                        return [
                            'cursor-pointer',
                            'transition',
                            'hover:opacity-90',
                            'hover:ring-2',
                            'hover:ring-blue-400',
                            'rounded-sm'
                        ];
                    }
                    return [];
                }}
                eventDidMount={(info) => {
                    const { type } = info.event.extendedProps as { type?: string };
                    if (type === 'unavail') {
                        // stripes
                        info.el.style.backgroundImage =
                            'repeating-linear-gradient(135deg, rgba(35,38,39,0.3) 0 8px, rgba(35,38,39,0.6) 8px 16px)';
                        info.el.style.backgroundColor = 'transparent'; // prevent solid override
                        info.el.setAttribute('title', 'Student is NOT available here (forbidden)');
                    }
                    if (type === 'section') {
                        info.el.setAttribute('title', 'Click to toggle section hours');
                    }
                }}
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
                    <span className={hasUnavailabilityMatch ? 'text-red-600' : 'text-green-600'}>
                        {hasUnavailabilityMatch ? 'Yes' : 'No'}
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
                            placeholder="e.g. 10"
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
                            placeholder="e.g. 1.5"
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
function isSlotHasOverlap(
    slot: { day: string; startTime: string; endTime: string },
    blocks: { day: string; startTime: string; endTime: string }[]
) {
    return slotOverlapsAnyBlock(slot, blocks);
}

function calcSectionMinutes(section: Section | null | undefined, on: Set<number>): number {
    if (!section?.sectionSchedule) return 0;
    return section.sectionSchedule.reduce((sum, slot, idx) => {
        if (!on.has(idx) || !slot.startTime || !slot.endTime) return sum;
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

const GREY = 'rgba(156,163,175,0.45)'; // off
const RED = '#EF4444CC';              // overlap
const GREEN = 'rgba(16,185,129,0.8)';   // clean

const colorForSection = (idx: number, isBad: boolean, on: Set<number>) => {
    if (!on.has(idx)) return GREY;
    return isBad ? RED : GREEN;
};