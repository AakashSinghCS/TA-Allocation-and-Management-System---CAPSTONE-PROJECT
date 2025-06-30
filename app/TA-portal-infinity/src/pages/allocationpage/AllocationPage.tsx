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
import type { Applicant } from '../../interfaces/applicant/Applicant';
import { fetchApplicants } from '../../api/application/FetchApplicants';
import { fetchApplications } from '../../api/application/FetchApplications';
// Mock loader 
import { fetchSection } from '../../api/section/fetchSection';
import { mockSectionCOSC111 } from '../../mocked-objects/section/mockSectionCOSC111';
import { mockSectionCOSC121 } from '../../mocked-objects/section/mockSectionCOSC121';
import { mockSectionMATH125 } from '../../mocked-objects/section/mockSectionMATH125';


const TAAllocationPage: React.FC = () => {
  const { token } = useAuth();

  //Filter state
  const [courseQ, setCourseQ] = useState({
    search:    '',
    deptCode:  '',
    courseNum: '',
    section:   '',
    term:      '',
    type:      '',
  });
  const [appQ, setAppQ] = useState({
  pref1: '',
  pref2: '',
  wantRemote: '',
  wantHours: '',
  studentName: '',
  studentNum: '',
 });


  //seed allSections from mocks 
  const allSections = useMemo<SectionDetails[]>(() => [
    mockSectionCOSC111.sectionDetails,
    mockSectionCOSC121.sectionDetails,
    mockSectionMATH125.sectionDetails,
  ].filter((s): s is SectionDetails => s !== undefined), []);

  //compute dropdown options 
  const deptCodes  = useMemo(() => Array.from(new Set(allSections.map(s=>s.deptCode))),  [allSections]);
  const courseNums = useMemo(() => Array.from(new Set(allSections.map(s=>s.courseNum))), [allSections]);
  const sections   = useMemo(() => Array.from(new Set(allSections.map(s=>s.section))),   [allSections]);
  const terms      = useMemo(() => Array.from(new Set(allSections.map(s=>s.year))),      [allSections]);
  const types      = useMemo(() => Array.from(new Set(allSections.map(s=>s.type!))),    [allSections]);

  // fetch all applications on mount 
  const [allApps, setAllApps] = useState<ApplicationDto[]>([]);
  useEffect(() => {
    if (!token) return;
    fetchApplications(1, token)
      .then(setAllApps)
      .catch(err => console.error(err));
  }, [token]);
  
      // fetch real applicants on mount 
    const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
      useEffect(() => {
        if (!token) return;
        fetchApplicants(token)
          .then(setAllApplicants)
          .catch(err => console.error(err));
      }, [token]);

 // selections 
  const [selCourse,    setSelCourse]    = useState<{
    details?:     SectionDetails;
    schedule:     SectionSchedule[];
    need?:        Need;
    allocations:  Allocation[];
    hasCompleted: boolean;
  } | null>(null);

  const [selApp,       setSelApp]       = useState<ApplicationDto | null>(null);

   // client‐side filtering
  const filteredSections = useMemo(() => {
    return allSections.filter(s => {
      const text = `${s.deptCode} ${s.courseNum} ${s.name}`.toLowerCase();
      if (courseQ.search    && !text.includes(courseQ.search.toLowerCase())) return false;
      if (courseQ.deptCode  && s.deptCode  !== courseQ.deptCode)   return false;
      if (courseQ.courseNum && s.courseNum !== courseQ.courseNum)  return false;
      if (courseQ.section   && s.section   !== courseQ.section)    return false;
      if (courseQ.term      && String(s.year) !== courseQ.term)    return false;
      if (courseQ.type      && s.type      !== courseQ.type)       return false;
      return true;
    });
  }, [allSections, courseQ]);

  const filteredApps = useMemo(() => {
  return allApps.filter(a => {
    if (appQ.pref1 && !a.preferences.includes(appQ.pref1)) return false;
    if (appQ.pref2 && !a.preferences.includes(appQ.pref2)) return false;
    if (appQ.wantRemote && String(a.wantRemote) !== appQ.wantRemote) return false;
    if (appQ.wantHours && String(a.wantWorkingHours) !== appQ.wantHours) return false;
    if (appQ.studentName) {
      const fullName = `${a.student.firstName} ${a.student.lastName}`.toLowerCase();
      if (!fullName.includes(appQ.studentName.toLowerCase())) return false;
    }
    if (appQ.studentNum && a.student.studentNum !== appQ.studentNum) return false;
    return true;
  });
  }, [allApps, appQ]);


 // load a section’s full mock info 
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
    setSelApp(null);
  };
  
  const loadApp = (a: ApplicationDto) => setSelApp(a);
  // calendar events 
const courseEvents = (selCourse?.schedule || []).map((slot, i) => {
  const dayNum = getDayNumber(slot.day);

  // detect overlap with any selected‐application availability
  const conflict = selApp?.availabilities.some(av =>
    dayNum === getDayNumber(av.day) &&
    slot.endTime !== undefined &&
    (av.startTime  <  slot.endTime) &&
    (slot.startTime !== undefined) &&
    (av.endTime    >  slot.startTime)
  ) ?? false;

  return {
    id:             `c${i}`,
    title:          'Course Slot',
    daysOfWeek:     [ dayNum ],
    startTime:      slot.startTime,
    endTime:        slot.endTime,
    backgroundColor: conflict
      ? 'rgba(220, 38, 38, 0.8)'  
      : '#3B82F6CC',               
  };
});

const appEvents = (selApp?.availabilities || []).map((slot, i) => {
  const dayNum = getDayNumber(slot.day);

  const conflict = selCourse?.schedule.some(cs =>
    dayNum === getDayNumber(cs.day) &&
    cs.endTime !== undefined &&
    (slot.startTime <  cs.endTime) &&
    (cs.startTime !== undefined) &&
    (slot.endTime   >  cs.startTime)
  ) ?? false;

  return {
    id:             `app${i}`,
    title:          'Student Avail',
    daysOfWeek:     [ dayNum ],
    startTime:      slot.startTime,
    endTime:        slot.endTime,
    backgroundColor: conflict
      ? 'rgba(220, 38, 38, 0.8)'  
      : 'rgba(16, 185, 129, 0.8)', 
  };
});

const bgConflictEvents = (selApp?.availabilities || []).flatMap((slot, i) => {
  const dayNum = getDayNumber(slot.day);
  return (selCourse?.schedule || [])
    .filter(cs =>
      dayNum === getDayNumber(cs.day) &&
      cs.startTime !== undefined &&
      cs.endTime !== undefined &&
      (slot.startTime <  cs.endTime) &&
      (slot.endTime   >  cs.startTime)
    )
    .map((cs, j) => {
      if (cs.startTime === undefined || cs.endTime === undefined) return null;
      const start = slot.startTime  > cs.startTime ? slot.startTime : cs.startTime;
      const end   = slot.endTime    < cs.endTime   ? slot.endTime   : cs.endTime;
      return {
        id:              `conflict-bg-${i}-${j}`,
        daysOfWeek:      [ dayNum ],
        startTime:       start,
        endTime:         end,
        display:         'background',
        backgroundColor: 'rgba(220, 38, 38, 0.3)', 
      };
    }).filter(Boolean);
});

//final merged event list
const events = [
  ...courseEvents,
  ...appEvents,
  ...bgConflictEvents,
].filter((e): e is NonNullable<typeof e> => e !== null && e !== undefined);

// status flags
  const hoursNeeded = selCourse?.need?.requiredGradingHours || 0;
  const preReqOK    = Boolean(selCourse?.hasCompleted);
  const hoursOK     = selApp ? selApp.wantWorkingHours >= hoursNeeded : false;
  const required = selCourse?.need?.requiredGradingHours ?? 0
  const allocated = selCourse?.need?.numOfHoursCurrentlyAllocated ?? 0
  const remaining = Math.max(required - allocated, 0)
  const hasConflict = bgConflictEvents.length > 0
    

  return (
    <div className="p-8 min-h-screen space-y-8">
      <h1 className="text-4xl font-bold">TA Allocations</h1>
      <div className="grid lg:grid-cols-24 gap-6">

        {/*  COURSE FILTER + DETAILS PANEL */}
        <div className="lg:col-span-5 bg-white p-6 rounded shadow space-y-4">
          <h1 className="font-semibold text-xl">Course Filter</h1>
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
          <h1 className="font-semibold text-xl mt-2">Please select a course*</h1>
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
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-300 hover:bg-gray-600'}
                  `}
                >
                  {s.deptCode} {s.courseNum} • {s.section} • {s.year}
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
    

        {/* CALENDAR & ALLOCATE PANEL*/}
        <div className="lg:col-span-14 bg-white p-6 rounded shadow space-y-4">
          <h1 className="font-semibold text-xl">Weekly Calendar</h1>
            {/* Calendar Legend */}
            <div className="flex items-center space-x-6 mb-2">
              <div className="flex items-center space-x-1">
                <span
                  className="w-8 h-4 block rounded-sm"
                  style={{ backgroundColor: '#3B82F6CC' }}
                />
                <span className="text-sm">Course Slot</span>
              </div>
              <div className="flex items-center space-x-1">
                <span
                  className="w-8 h-4 block rounded-sm"
                  style={{ backgroundColor: 'rgba(16,185,129,0.8)' }}
                />
                <span className="text-sm">Student Availability</span>
              </div>
              <div className="flex items-center space-x-1">
                <span
                  className="w-8 h-4 block rounded-sm"
                  style={{ backgroundColor: 'rgba(187, 13, 13, 0.3)' }}
                />
                <span className="text-sm">Conflict</span>
              </div>
            </div>
          
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
            {/* Remaining-hours */}
              <p>
                Remaining Hours:{' '}
                <span className={hoursOK ? 'text-green-600' : 'text-red-600'}>
                  {hoursOK
                    ? `All met (${allocated} of ${required})`
                    : `${remaining} needed (Allocated: ${allocated}, Required: ${required})`}
                </span>
              </p>

              {/* Schedule-conflict line */}
              <p>
                Schedule Conflict:{' '}
                <span className={hasConflict ? 'text-red-600' : 'text-green-600'}>
                  {hasConflict ? 'Yes' : 'No'}
                </span>
              </p>
          </div>
          <div className="flex justify-end">
          <button
            disabled={!selCourse || !selApp}
            className="px-6 py-2 bg-[#040941] text-white rounded disabled:opacity-50"
          >
            Send Offer
          </button>
        </div>

        </div>
        {/* APPLICATIONS PANEL */}
       {/* APPLICATIONS PANEL */}
<div className="lg:col-span-5 bg-white p-6 rounded shadow space-y-4">
  <h1 className="font-semibold text-xl">Application Filter</h1>

  <div className="grid grid-cols-2 gap-2">
    <select
      className="border rounded px-2 py-2"
      value={appQ.pref1}
      onChange={e => setAppQ(q => ({ ...q, pref1: e.target.value }))}
    >
      <option value="">1st Pref</option>
      {Array.from(new Set(allApps.flatMap(a => a.preferences)))
        .sort()
        .map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
    </select>
    <select
      className="border rounded px-2 py-2"
      value={appQ.pref2}
      onChange={e => setAppQ(q => ({ ...q, pref2: e.target.value }))}
    >
      <option value="">2nd Pref</option>
      {Array.from(new Set(allApps.flatMap(a => a.preferences)))
        .sort()
        .map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
    </select>
    <select
      className="border rounded px-2 py-2"
      value={appQ.wantRemote}
      onChange={e => setAppQ(q => ({ ...q, wantRemote: e.target.value }))}
    >
      <option value="">Remote?</option>
      <option value="true">Yes</option>
      <option value="false">No</option>
    </select>
    <select
      className="border rounded px-2 py-2"
      value={appQ.wantHours}
      onChange={e => setAppQ(q => ({ ...q, wantHours: e.target.value }))}
    >
      <option value="">Hours</option>
      {Array.from(new Set(allApps.map(a => a.wantWorkingHours.toString())))
        .sort((a, b) => +a - +b)
        .map(h => <option key={h} value={h}>{h}</option>)}
    </select>
  </div>

  {/* New text filters */}
  <input
    type="text"
    placeholder="Student Name"
    className="border rounded px-2 py-2 w-full "
    value={appQ.studentName || ''}
    onChange={e => setAppQ(q => ({ ...q, studentName: e.target.value }))}
  />
  <input
    type="text"
    placeholder="Student Number"
    className="border rounded px-2 py-2 w-full"
    value={appQ.studentNum || ''}
    onChange={e => setAppQ(q => ({ ...q, studentNum: e.target.value }))}
  />

  <div className="max-h-48 overflow-auto space-y-1 mt-2">
    <h1 className="font-semibold text-xl mt-4">Please select an Application*</h1>
    {filteredApps.map((app) => (
      <button
        key={`${app.student.id}-${app.timeSubmitted}`}
        onClick={() => loadApp(app)}
        className={`block w-full text-left px-3 py-2 rounded ${
          selApp === app ? 'bg-gray-900 text-white' : 'bg-gray-200 hover:bg-gray-300'
        }`}
      >
        {app.student.firstName} {app.student.lastName} — {new Date(app.timeSubmitted).toLocaleString()}
      </button>
    ))}
    {filteredApps.length === 0 && <p className="text-gray-500">No applications</p>}
  </div>

  {selApp && (
    <div className="mt-4 space-y-6">
      <h2 className="font-bold text-xl text-gray-800">Application Details</h2>

      {/* Applicant Info */}
      <div className="space-y-1">
        <p className="text-lg font-medium">{selApp.student.firstName} {selApp.student.lastName}</p>
        <p className="text-sm text-gray-500">User ID: {selApp.student.id}</p>
        <p className="text-sm text-gray-500">Student Number: {selApp.student.studentNum || 'N/A'}</p>
        <p className="text-sm text-gray-500">Program: {selApp.student.program || 'N/A'}</p>
        <p className="text-sm text-gray-500">Enrollment Year: {selApp.student.enrollmentYear || 'N/A'}</p>
        <p className="text-sm text-gray-500">School Year: {selApp.student.schoolYear || 'N/A'}</p>
      </div>

      {/* Preferences */}
      <div className="space-y-1">
        <p><strong>Preferences:</strong> <span className="text-gray-700">{selApp.preferences.join(', ')}</span></p>
        <p><strong>Remote:</strong> <span className="text-gray-700">{selApp.wantRemote ? 'Yes' : 'No'}</span></p>
        <p><strong>Desired Hours:</strong> <span className="text-gray-700">{selApp.wantWorkingHours}</span></p>
        <p><strong>Submitted:</strong> <span className="text-gray-700">{new Date(selApp.timeSubmitted).toLocaleString()}</span></p>
      </div>

      {/* Availabilities */}
      <div>
        <p className="font-semibold">Availabilities:</p>
        <ul className="list-disc pl-5 text-gray-700">
          {selApp.availabilities.map((a, i) => (
            <li key={i}>{a.day}: {a.startTime} - {a.endTime}</li>
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