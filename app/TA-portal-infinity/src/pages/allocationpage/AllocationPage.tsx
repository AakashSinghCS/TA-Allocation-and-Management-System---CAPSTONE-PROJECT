// src/pages/TAAllocationPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { getDayNumber, formatTimeRange } from '../../utility/calendar/calendarUtils';
import type { SectionDetails } from '../../interfaces/section/SectionDetails';
import type SectionSchedule from '../../interfaces/section/SectionSchedule';
import type { Need } from '../../interfaces/need/Need';
import type { Allocation } from '../../interfaces/allocation/Allocation';
import { useAuth } from '../../context/AuthContext';

// ── TA shape ────────────────────────────────────────────────────────────────
type TA = {
  id: number;
  firstName: string;
  lastName: string;
  availability: string[];
  completedCourses: string[];
  requestedHours: number;
};

// ── Mock loader ──────────────────────────────────────────────────────────────
import { fetchSection } from '../../api/section/fetchSection';
import { mockSectionCOSC111 } from '../../mocked-objects/section/mockSectionCOSC111';
import { mockSectionCOSC121 } from '../../mocked-objects/section/mockSectionCOSC121';
import { mockSectionMATH125 } from '../../mocked-objects/section/mockSectionMATH125';

const TAAllocationPage: React.FC = () => {
  const { token } = useAuth();

  // ── Filter state ────────────────────────────────────────────────────────────
  const [courseQ, setCourseQ] = useState({
    search:    '',
    deptCode:  '',
    courseNum: '',
    section:   '',
    term:      '',
    type:      '',
  });
  const [taQ, setTAQ] = useState({
    first:  '',
    second: '',
    term:   '',
    hours:  '',
  });

  // ── seed allSections from mocks ─────────────────────────────────────────────
  const allSections = useMemo<SectionDetails[]>(() => [
    mockSectionCOSC111.sectionDetails,
    mockSectionCOSC121.sectionDetails,
    mockSectionMATH125.sectionDetails,
  ].filter((s): s is SectionDetails => s !== undefined), []);

  // ── compute dropdown options ────────────────────────────────────────────────
  const deptCodes  = useMemo(() => Array.from(new Set(allSections.map(s=>s.deptCode))),  [allSections]);
  const courseNums = useMemo(() => Array.from(new Set(allSections.map(s=>s.courseNum))), [allSections]);
  const sections   = useMemo(() => Array.from(new Set(allSections.map(s=>s.section))),   [allSections]);
  const terms      = useMemo(() => Array.from(new Set(allSections.map(s=>s.term))),      [allSections]);
  const types      = useMemo(() => Array.from(new Set(allSections.map(s=>s.type!))),    [allSections]);

  // ── fetch real TAs ───────────────────────────────────────────────────────────
  const [allTAs, setAllTAs] = useState<TA[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/users/applicants', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setAllTAs(await res.json());
      } catch (e) {
        console.error('Failed loading TAs', e);
      }
    })();
  }, [token]);

  // ── selections ─────────────────────────────────────────────────────────────
  const [selCourse, setSelCourse] = useState<{
    details?:     SectionDetails;
    schedule:     SectionSchedule[];
    need?:        Need;
    allocations:  Allocation[];
    hasCompleted: boolean;
  } | null>(null);
  const [selTA, setSelTA] = useState<TA|null>(null);

  // ── client‐side filtering ───────────────────────────────────────────────────
  const filteredSections = useMemo(() => {
    return allSections.filter(s => {
      const text = `${s.deptCode} ${s.courseNum} ${s.name}`.toLowerCase();
      if (courseQ.search    && !text.includes(courseQ.search.toLowerCase())) return false;
      if (courseQ.deptCode  && s.deptCode  !== courseQ.deptCode)   return false;
      if (courseQ.courseNum && s.courseNum !== courseQ.courseNum)  return false;
      if (courseQ.section   && s.section   !== courseQ.section)    return false;
      if (courseQ.term      && s.term      !== courseQ.term)       return false;
      if (courseQ.type      && s.type      !== courseQ.type)       return false;
      return true;
    });
  }, [allSections, courseQ]);

  const filteredTAs = useMemo(() => {
    return allTAs.filter(t => {
      if (taQ.first   && !t.completedCourses.includes(taQ.first))   return false;
      if (taQ.second  && !t.completedCourses.includes(taQ.second))  return false;
      if (taQ.term    && !t.availability.includes(taQ.term))        return false;
      if (taQ.hours   && t.requestedHours.toString() !== taQ.hours) return false;
      return true;
    });
  }, [allTAs, taQ]);

  // ── load a section’s full mock info ────────────────────────────────────────
  const loadCourse = async (details: SectionDetails) => {
    if (!details.sectionId) return;
    const full = await fetchSection(details.sectionId);
    setSelCourse({
      details:      full.sectionDetails,
      schedule:     full.sectionSchedule  || [],
      need:         full.need,
      allocations:  [],
      hasCompleted: Boolean(
        full.need?.numOfHoursCurrentlyAllocated !== undefined &&
        full.need?.requiredGradingHours !== undefined &&
        full.need.numOfHoursCurrentlyAllocated >= full.need.requiredGradingHours
      ),
    });
    setSelTA(null);
  };

  // ── pick a TA ───────────────────────────────────────────────────────────────
  const loadTA = (t: TA) => setSelTA(t);

  // ── build calendar events ───────────────────────────────────────────────────
  const courseEvents = (selCourse?.schedule||[]).map((slot,i)=>({
    id:            `c${i}`,
    title:         'Course Slot',
    daysOfWeek:    [ getDayNumber(slot.day) ],
    startTime:     slot.startTime,
    endTime:       slot.endTime,
    backgroundColor: '#3182ce80',
  }));
  const taEvents = (selTA?.availability||[]).map((day,i)=>({
    id:            `t${i}`,
    title:         'TA Avail',
    daysOfWeek:    [ getDayNumber(day) ],
    startTime:     '08:00:00',
    endTime:       '18:00:00',
    backgroundColor: '#48bb7780',
  }));
  const events = [...courseEvents, ...taEvents];

  // ── status flags ───────────────────────────────────────────────────────────
  const hoursNeeded = selCourse?.need?.requiredGradingHours || 0;
  const preReqOK    = Boolean(selCourse?.hasCompleted);
  const hoursOK     = selTA ? selTA.requestedHours >= hoursNeeded : false;

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      <h1 className="text-3xl font-bold">TA Allocations</h1>
      <div className="grid lg:grid-cols-12 gap-6">

        {/* ── COURSE FILTER + DETAILS PANEL ─────────────────────────────────── */}
        <div className="lg:col-span-3 bg-white p-6 rounded shadow space-y-4">
          <h2 className="font-semibold">Course Filter</h2>

          {/* full‐text */}
          <input
            type="text"
            placeholder="Search…"
            value={courseQ.search}
            onChange={e=>setCourseQ(q=>({...q,search:e.target.value}))}
            className="w-full border rounded px-3 py-2"
          />

          {/* dropdowns */}
          <div className="grid grid-cols-3 gap-2">
            <select
              className="border rounded px-2 py-2"
              value={courseQ.deptCode}
              onChange={e=>setCourseQ(q=>({...q,deptCode:e.target.value}))}
            >
              <option value="">Dept</option>
              {deptCodes.map(dc=><option key={dc} value={dc}>{dc}</option>)}
            </select>
            <select
              className="border rounded px-2 py-2"
              value={courseQ.courseNum}
              onChange={e=>setCourseQ(q=>({...q,courseNum:e.target.value}))}
            >
              <option value="">Course #</option>
              {courseNums.map(cn=><option key={cn} value={cn}>{cn}</option>)}
            </select>
            <select
              className="border rounded px-2 py-2"
              value={courseQ.section}
              onChange={e=>setCourseQ(q=>({...q,section:e.target.value}))}
            >
              <option value="">Section</option>
              {sections.map(sec=><option key={sec} value={sec}>{sec}</option>)}
            </select>
            <select
              className="border rounded px-2 py-2"
              value={courseQ.term}
              onChange={e=>setCourseQ(q=>({...q,term:e.target.value}))}
            >
              <option value="">Term</option>
              {terms.map(t=> <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              className="border rounded px-2 py-2"
              value={courseQ.type}
              onChange={e=>setCourseQ(q=>({...q,type:e.target.value}))}
            >
              <option value="">Type</option>
              {types.map(tp=><option key={tp} value={tp}>{tp}</option>)}
            </select>
          </div>

          <button className="w-full bg-[#040941] text-white py-2 rounded">Filter</button>

          {/* filtered list */}
          <h3 className="font-semibold text-lg mt-4">Please select a course</h3>
          {/* tile-style course list */}
  <div className="max-h-48 overflow-auto grid gap-2">
    {filteredSections.map(s => {
      const isSelected = selCourse?.details?.sectionId === s.sectionId;
      return (
        <button
          key={s.sectionId}
          onClick={() => loadCourse(s)}
          className={`
            w-full text-left px-3 py-2 rounded
            transition-colors duration-150
            ${isSelected
              ? 'bg-gray-700 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
          `}
        >
          {s.deptCode} {s.courseNum} • {s.section} • {s.term}
        </button>
      );
    })}
    {filteredSections.length === 0 && (
      <p className="text-gray-500">No courses</p>
    )}
  </div>

  {/* ── Selected Course “Need” Details ─────────────────────────────── */}
  {selCourse?.need && (
    <div className="mt-4 bg-gray-100 p-4 rounded space-y-2">
      <h4 className="font-semibold">Grading Need</h4>
      <p>
        <strong>Description:</strong><br/>
        {selCourse.need.description}
      </p>
      <p>
        <strong>Allocated Hours:</strong>{' '}
        {selCourse.need.numOfHoursCurrentlyAllocated}
      </p>
      <p>
        <strong>Required Hours:</strong>{' '}
        {selCourse.need.requiredGradingHours}
      </p>
      <p>
        <strong>Prerequisites:</strong>{' '}
        {selCourse.need.courseNeeds?.map(c => `${c.deptCode} ${c.courseNum}`).join(', ')}
      </p>
    </div>
  )}
</div>

        {/* ── CALENDAR & ALLOCATE PANEL ─────────────────────────────────────── */}
        <div className="lg:col-span-6 bg-white p-6 rounded shadow space-y-4">
          <h2 className="font-semibold">Weekly Calendar</h2>
          <FullCalendar
            key={selCourse?.details?.sectionId ?? 'none'}
            plugins={[timeGridPlugin]}
            initialView="timeGridWeek"
            headerToolbar={false}
            allDaySlot={false}
            slotMinTime="08:00:00"
            slotMaxTime="18:00:00"
            dayHeaderFormat={{ weekday:'short' }}
            slotLabelFormat={{ hour:'numeric', minute:'2-digit' }}
            events={events}
            height="auto"
          />

          <div className="bg-gray-100 p-4 rounded space-y-1">
            <p>
              Pre-req Status:{' '}
              <span
                className={preReqOK ? 'text-green-600' : 'text-red-600'}
              >
                {preReqOK ? 'Complete' : 'Missing'}
              </span>
            </p>
            <p>
              Grading Hours:{' '}
              <span
                className={hoursOK ? 'text-green-600' : 'text-red-600'}
              >
                {hoursOK ? 'Met' : 'Not Met'}
              </span>
            </p>
          </div>

          <button
            disabled={!selCourse || !selTA}
            className="px-6 py-2 bg-[#040941] text-white rounded disabled:opacity-50"
          >
            Allocate TA
          </button>
        </div>

        {/* ── APPLICANT FILTER PANEL ───────────────────────────────────────── */}
        <div className="lg:col-span-3 bg-white p-6 rounded shadow">
          <h2 className="font-semibold">Applicant Filter</h2>
          {/* …your existing TA-filter UI here… */}
        </div>
      </div>
    </div>
  );
};

export default TAAllocationPage;
