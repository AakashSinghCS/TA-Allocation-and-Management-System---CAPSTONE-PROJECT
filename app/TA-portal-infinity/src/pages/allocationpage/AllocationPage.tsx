// src/pages/TAAllocationPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { getDayNumber } from '../../utility/calendar/calendarUtils';
import type { SectionDetails } from '../../interfaces/section/SectionDetails';
import type SectionSchedule from '../../interfaces/section/SectionSchedule';
import type { Need } from '../../interfaces/need/Need';
import type { Allocation } from '../../interfaces/allocation/Allocation';
import { useAuth } from '../../context/AuthContext';
import type { ApplicationDto } from '../../interfaces/application/Application';

// ── Applicant shape ───────────────────────────────────────────────────────────
type Applicant = {
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
  const [appQ, setAppQ] = useState({
    pref1:      '',
    pref2:      '',
    wantRemote: '',
    wantHours:  '',
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

  // ── fetch all applications on mount ────────────────────────────────────────
  const [allApps, setAllApps] = useState<ApplicationDto[]>([]);
  useEffect(() => {
    (async () => {
      const res = await fetch('http://localhost:8080/applications/getAll/1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setAllApps(await res.json());
      else console.error('Failed loading applications', res.statusText);
    })();
  }, [token]);
  
  // ── fetch real applicants on mount ─────────────────────────────────────────
  const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
  useEffect(() => {
    (async () => {
      const res = await fetch('http://localhost:8080/users/applicants', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setAllApplicants(await res.json());
      else console.error('Failed loading applicants', res.statusText);
    })();
  }, [token]);

 // ── selections ─────────────────────────────────────────────────────────────
  const [selCourse,    setSelCourse]    = useState<{
    details?:     SectionDetails;
    schedule:     SectionSchedule[];
    need?:        Need;
    allocations:  Allocation[];
    hasCompleted: boolean;
  } | null>(null);
  const [selApplicant, setSelApplicant] = useState<Applicant | null>(null);
  const [selApp,       setSelApp]       = useState<ApplicationDto | null>(null);

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

  const filteredApps = useMemo(() => {
    return allApps.filter(a => {
      if (appQ.pref1      && !a.preferences.includes(appQ.pref1))      return false;
      if (appQ.pref2      && !a.preferences.includes(appQ.pref2))      return false;
      if (appQ.wantRemote && String(a.wantRemote) !== appQ.wantRemote) return false;
      if (appQ.wantHours  && String(a.wantWorkingHours) !== appQ.wantHours) return false;
      return true;
    });
  }, [allApps, appQ]);

 // ── load a section’s full mock info ────────────────────────────────────────
  const loadCourse = async (details: SectionDetails) => {
    if (!details.sectionId) return;
    const full = await fetchSection(details.sectionId);
    setSelCourse({
      details:      full.sectionDetails,
      schedule:     full.sectionSchedule  || [],
      need:         full.need,
      allocations:  [],
      hasCompleted: !!(
        full.need?.numOfHoursCurrentlyAllocated != null &&
        full.need?.requiredGradingHours != null &&
        full.need.numOfHoursCurrentlyAllocated >= full.need.requiredGradingHours
      ),
    });
    setSelApplicant(null);
  };
  // ── pick an applicant ─────────────────────────────────────────────────────
  const loadApplicant = (a: Applicant) => setSelApplicant(a);
  const loadApp = (a: ApplicationDto) => setSelApp(a);

  // ── calendar events ────────────────────────────────────────────────────────
const courseEvents = (selCourse?.schedule || []).map((slot, i) => ({
  id:            `c${i}`,
  title:         'Course Slot',
  daysOfWeek:    [ getDayNumber(slot.day) ],
  startTime:     slot.startTime,
  endTime:       slot.endTime,
  backgroundColor: '#3B82F6CC',
}));

const taEvents = (selApplicant?.availability || []).map((day, i) => ({
  id:            `t${i}`,
  title:         'TA Avail',
  daysOfWeek:    [ getDayNumber(day) ],
  startTime:     '08:00:00',
  endTime:       '18:00:00',
  backgroundColor: '#14532DCC',
}));

// ── Student (Application) Availability Events ──────────────────────────────
const appEvents = (selApp?.availabilities || []).map((slot, i) => {
  const dayNum   = getDayNumber(slot.day);
  const conflict = courseEvents.some(evt =>
    evt.daysOfWeek[0] === dayNum &&
    (evt.startTime ?? '') < slot.endTime &&
    (evt.endTime   ?? '') > slot.startTime
  );

  return {
    id:            `app${i}`,
    title:         'Student Availability',
    daysOfWeek:    [ dayNum ],
    startTime:     slot.startTime,
    endTime:       slot.endTime,
    backgroundColor: conflict
      ? 'rgba(220, 38, 38, 0.8)'   // solid red block
      : 'rgba(16, 185, 129, 0.8)', // green block
  };
});

// ── background conflict shading ────────────────────────────────────────────
const bgConflictEvents = (selApp?.availabilities || [])
  .flatMap((slot, i) => {
    const dayNum = getDayNumber(slot.day);
    return courseEvents
      .filter(evt =>
        evt.daysOfWeek[0] === dayNum &&
        (evt.startTime ?? '') < slot.endTime &&
        (evt.endTime   ?? '') > slot.startTime
      )
      .map((evt, j) => {
        // exact overlap window:
        const start = slot.startTime > (evt.startTime ?? '00:00:00') ? slot.startTime : (evt.startTime ?? '00:00:00');
        const end   = slot.endTime   < (evt.endTime   ?? '23:59:59') ? slot.endTime   : (evt.endTime   ?? '23:59:59');
        return {
          id:              `conflict-bg-${i}-${j}`,
          daysOfWeek:      [ dayNum ],
          startTime:       start,
          endTime:         end,
          display:         'background',
          backgroundColor: 'rgba(229,62,62,0.3)', // translucent red
        };
      });
  });

// ── final merged event list ────────────────────────────────────────────────
const events = [
  ...courseEvents,
  ...taEvents,
  ...appEvents,
  ...bgConflictEvents,
];


// ── status flags ───────────────────────────────────────────────────────────
  const hoursNeeded = selCourse?.need?.requiredGradingHours || 0;
  const preReqOK    = Boolean(selCourse?.hasCompleted);
  const hoursOK     = selApplicant ? selApplicant.requestedHours >= hoursNeeded : false;

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      <h1 className="text-3xl font-bold">TA Allocations</h1>
      <div className="grid lg:grid-cols-12 gap-6">

        {/* ── COURSE FILTER + DETAILS PANEL ─────────────────────────────────── */}
        <div className="lg:col-span-3 bg-white p-6 rounded shadow space-y-4">
          <h2 className="font-semibold">Course Filter</h2>
          {/* search */}
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

          {/* course tiles */}
          <h3 className="font-semibold text-lg mt-4">Please select a course*</h3>
          <div className="max-h-48 overflow-auto grid gap-2">
            {filteredSections.map(s => {
              const isSelected = selCourse?.details?.sectionId === s.sectionId;
              return (
                <button
                  key={s.sectionId}
                  onClick={()=>loadCourse(s)}
                  className={`
                    w-full text-left px-3 py-2 rounded transition
                    ${isSelected
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'}
                  `}
                >
                  {s.deptCode} {s.courseNum} • {s.section} • {s.term}
                </button>
              );
            })}
            {filteredSections.length===0 && (
              <p className="text-gray-500">No courses</p>
            )}
          </div>

          {/* selected course “need” */}
          {selCourse?.need && (
            <div className="mt-4 bg-gray-100 p-4 rounded space-y-2">
              <h4 className="font-semibold">Grading Need</h4>
              <p><strong>Description:</strong><br/>{selCourse.need.description}</p>
              <p><strong>Allocated Hours:</strong> {selCourse.need.numOfHoursCurrentlyAllocated}</p>
              <p><strong>Required Hours:</strong> {selCourse.need.requiredGradingHours}</p>
              <p><strong>Prerequisites:</strong> {selCourse. need.courseNeeds?.map(c=>`${c.deptCode} ${c.courseNum}`).join(', ')}</p>
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
            slotMaxTime="20:00:00"
            slotEventOverlap={false}
            dayHeaderFormat={{ weekday:'short' }}
            slotLabelFormat={{ hour:'numeric', minute:'2-digit' }}
            events={events}
            height="auto"
          />
          <div className="bg-gray-100 p-4 rounded space-y-1">
            <p>Pre-req: <span className={preReqOK?'text-green-600':'text-red-600'}>{preReqOK?'Complete':'Missing'}</span></p>
            <p>Hours:   <span className={hoursOK   ?'text-green-600':'text-red-600'}>{hoursOK   ?'Met':'Not Met' }</span></p>
          </div>
          <button
            disabled={!selCourse || !selApplicant}
            className="px-6 py-2 bg-[#040941] text-white rounded disabled:opacity-50"
          >
            Allocate TA
          </button>
        </div>

        {/* ── APPLICATION FILTER PANEL ───────────────────────────────────────── */}
        <div className="lg:col-span-3 bg-white p-6 rounded shadow space-y-4">
          <h2 className="font-semibold">Application Filter</h2>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="border rounded px-2 py-2"
              value={appQ.pref1}
              onChange={e=>setAppQ(q=>({...q,pref1:e.target.value}))}
            >
              <option value="">1st Pref</option>
              {Array.from(new Set(allApps.flatMap(a=>a.preferences))).map(d=>(
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              className="border rounded px-2 py-2"
              value={appQ.pref2}
              onChange={e=>setAppQ(q=>({...q,pref2:e.target.value}))}
            >
              <option value="">2nd Pref</option>
              {Array.from(new Set(allApps.flatMap(a=>a.preferences))).map(d=>(
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              className="border rounded px-2 py-2"
              value={appQ.wantRemote}
              onChange={e=>setAppQ(q=>({...q,wantRemote:e.target.value}))}
            >
              <option value="">Remote?</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
            <select
              className="border rounded px-2 py-2"
              value={appQ.wantHours}
              onChange={e=>setAppQ(q=>({...q,wantHours:e.target.value}))}
            >
              <option value="">Hours</option>
              {Array.from(new Set(allApps.map(a=>a.wantWorkingHours.toString())))
                .sort((a,b)=>+a - +b)
                .map(h=><option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div className="max-h-48 overflow-auto space-y-1 mt-2">
            {filteredApps.map(app=>(
              <button
                key={`${app.studentId}-${app.timeSubmitted}`}
                onClick={()=>loadApp(app)}
                className={`block w-full text-left px-3 py-2 rounded ${
                  selApp === app ? 'bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Student #{app.studentId} — {new Date(app.timeSubmitted).toLocaleString()}
              </button>
            ))}
            {filteredApps.length===0 && <p className="text-gray-500">No applications</p>}
          </div>
           <h3 className="font-semibold text-lg mt-4">Please select a Applicant*</h3>
          {selApp && (
            <div className="mt-4 bg-gray-50 p-4 rounded space-y-2">
              <h4 className="font-semibold">Application Details</h4>
              <p><strong>Preferences:</strong> {selApp.preferences.join(', ')}</p>
              <p><strong>Remote:</strong> {selApp.wantRemote?'Yes':'No'}</p>
              <p><strong>Hours:</strong> {selApp.wantWorkingHours}</p>
              <p><strong>Submitted:</strong> {new Date(selApp.timeSubmitted).toLocaleString()}</p>
              <div>
                <strong>Availabilities:</strong>
                <ul className="pl-4 list-disc">
                  {selApp.availabilities.map((av,i)=>(
                    <li key={i}>{av.day} {av.startTime}-{av.endTime}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TAAllocationPage;