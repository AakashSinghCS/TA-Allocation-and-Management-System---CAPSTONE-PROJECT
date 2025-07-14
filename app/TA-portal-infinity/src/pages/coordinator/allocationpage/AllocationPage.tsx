import React, { useState, useEffect , useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { getDayNumber } from '../../../utility/calendar/calendarUtils';
import type  SectionDetails  from '../../../interfaces/section/SectionDetails';
import type Section from '../../../interfaces/section/Section';
import { useAuth } from '../../../context/AuthContext';
import type { ApplicationDto } from '../../../interfaces/application/Application';
import { fetchApplications } from '../../../api/application/FetchApplications';
import ApplicationFilterPanel from '../../../components/features/application/applicationfilterpanel/ApplicationFilterPanel';
import { ToastContainer } from 'react-toastify';
import { useSendOffer } from '../../../hooks/sendoffer/useSendOffer';
import SectionFilter from '../../../components/features/course/coursefilter/SectionFilter';
import { fetchFilteredSections, type FilterSectionsProps } from '../../../api/course/sectionfilter/fetchFilteredSections';
import { convertFilterSectionsToSections } from '../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections';
import { fetchSectionInfo } from '../../../api/section/fetchSectionInfo';
import { Link } from 'react-router-dom';
import type { Allocation } from '../../../interfaces/allocation/Allocation';
import { fetchAllocationsByStudent } from '../../../api/allocation/fetchAllocationByStudent';
import { fetchSectionIncludeInstructorId } from '../../../api/section/fetchSectionIncludeInstructorId';
import { fetchInstructorById } from '../../../api/section/instructor/fetchInstructorById';

const TAAllocationPage: React.FC = () => {
  const { token } = useAuth();
  const { sendOffer, loading } = useSendOffer();
  const [showBanner, setShowBanner] = useState(false);

  const [appQ, setAppQ] = useState({
    pref1: '', pref2: '', wantRemote: '', wantHours: '', studentName: '', studentNum: '',
  });

  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);

  const handleSectionFilter = async (filters: FilterSectionsProps) => {
    setLoadingSections(true);
    try {
      const raw = await fetchFilteredSections(filters);
      setFilteredSections(convertFilterSectionsToSections(raw as any[] || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSections(false);
    }
  };

  const [allApps, setAllApps] = useState<ApplicationDto[]>([]);
  useEffect(() => {
    if (!token) return;
    fetchApplications(1, token)
      .then(setAllApps)
      .catch(err => console.error(err));
  }, [token]);

  const [selCourse, setSelCourse] = useState<Section | null>(null);
  const [instructor, setInstructor] = useState<{ firstName: string; lastName: string } | null>(null);
  const [selApp, setSelApp] = useState<ApplicationDto | null>(null);

  const loadCourse = async (details: SectionDetails) => {
    if (!details.id) return;
    setInstructor(null); 
    try {
      //  using fetchSectionIncludeInstructorId to get section with instructorId
      let section = await fetchSectionIncludeInstructorId(details.id);
      // If 'need' is missing, fetch it from fetchSectionInfo
      if (section && !section.need) {
        try {
          const sectionWithNeed = await fetchSectionInfo(details.id, token || "");
          if (sectionWithNeed && sectionWithNeed.need) {
            section = { ...section, need: sectionWithNeed.need };
          }
        } catch (err) {
          console.error("Failed to fetch section need:", err);
        }
      }
      setSelCourse({
        ...section,
        hasCompleted: !!(
          section?.need?.numHoursCurrentlyAllocated != null &&
          section?.need?.requiredGradingHours != null &&
          section.need?.numHoursCurrentlyAllocated >= section.need?.requiredGradingHours
        ),
      });
      // Prefer section.instructor if present, otherwise use instructorId
      if (section && section.instructor && section.instructor.firstName && section.instructor.lastName) {
        setInstructor({ firstName: section.instructor.firstName, lastName: section.instructor.lastName });
      } else if (section && section.instructorId !== undefined && section.instructorId !== null) {
        try {
          const instructorObj = await fetchInstructorById(section.instructorId);
          if (instructorObj && instructorObj.firstName && instructorObj.lastName) {
            setInstructor({ firstName: instructorObj.firstName, lastName: instructorObj.lastName });
          } else {
            setInstructor(null);
          }
        } catch (err) {
          setInstructor(null);
          console.error("Failed to fetch instructor details:", err);
        }
      } else {
        setInstructor(null);
      }
    } catch (err) {
      console.error("Failed to load section:", err);
      setInstructor(null);
    }
  };
  const onSend = () => {
    if (!selApp || !selCourse?.id || !selCourse.need) return;
    
    sendOffer(
      selApp,
      selCourse.id,
      selCourse.need,
      hasAvailabilityMatch,
      async () => {
        await loadCourse(selCourse!);
        setShowBanner(true);
      }
    );
  };

  const loadApp = (a: ApplicationDto) => setSelApp(a);

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

// Computing only the segments of student availability that overlap with course slots
function getIntersectionSegments(
  slot: { day: string; startTime: string; endTime: string },
  avails: { day: string; startTime: string; endTime: string }[]
) {
  const dayNum = getDayNumber(slot.day);
  return avails
    .filter(a => getDayNumber(a.day) === dayNum)
    .map(a => {
      const start = a.startTime > slot.startTime ? a.startTime : slot.startTime;
      const end = a.endTime < slot.endTime ? a.endTime : slot.endTime;
      return start < end ? { start, end } : null;
    })
    .filter((x): x is { start: string; end: string } => x !== null); 
}

// Computing segments of student availability that match course slots
const bgMatchedEvents = useMemo(() => {
   return (selCourse?.sectionSchedule || []).flatMap((slot, i) => {
     if (!slot.day || !slot.startTime || !slot.endTime) return [];
     return getIntersectionSegments(
       { day: slot.day, startTime: slot.startTime, endTime: slot.endTime },
       selApp?.availabilities || []
     ).map((seg, j) => ({
       id: `matched-${i}-${j}`,
       daysOfWeek: [getDayNumber(slot.day)],
       startTime: seg.start,
       endTime: seg.end,
       title: 'Matched Avail',
       backgroundColor: 'rgb(5, 168, 81)',
     }));
   });
}, [selCourse, selApp?.availabilities]);

// Combine all events into a single list
const events = [
  ...courseEvents,
  ...appEvents,
  ...bgMatchedEvents,
].filter((e): e is NonNullable<typeof e> => e !== null);


  const required = selCourse?.need?.requiredGradingHours ?? 0;
  const allocated = selCourse?.need?.numHoursCurrentlyAllocated ?? 0;
  const remaining = Math.max(required - allocated, 0);
  const hoursOK = allocated >= required;
  const hasAvailabilityMatch = bgMatchedEvents.length > 0;

  // Checking if we have a selected application and course before fetching history
  const [history, setHistory] = useState<Allocation[]>([]);
    useEffect(() => {
      if (!selApp || !token) {
        setHistory([]);
        return;
      }
      fetchAllocationsByStudent(selApp.student.id, token)
        .then(setHistory)
        .catch(() => setHistory([]));
    }, [selApp, token]);
      
      const hasOffer = useMemo(() => {
        if (!selApp || !selCourse) return false;
        return history.some(h =>
          h.application?.applicationId === selApp.applicationId &&
          h.section?.id === selCourse?.id
        );
      }, [history, selApp, selCourse]);

  return (
    <div className="p-8 min-h-screen space-y-8">
      <h1 className="text-4xl font-bold">TA Allocations</h1>
      <div className="grid lg:grid-cols-24 gap-6">
        <div className="lg:col-span-5 bg-white p-6 rounded shadow space-y-4">
          <h1 className="font-semibold text-xl">Course Filter</h1>
          <SectionFilter
            mode="small"
            onFilterChange={handleSectionFilter}
          />
          {loadingSections ? (
            <p>Loading courses…</p>
          ) : (
            <>
              <h1 className="font-semibold text-xl mt-2">Please select a course*</h1>
              <div className="max-h-48 overflow-auto grid gap-2">
                {filteredSections.map(s => {
                  const isSelected = selCourse?.id === s?.id;
                  return (
                    <button
                      key={s?.id}
                      onClick={() => loadCourse(s!)}
                      className={`w-full text-left px-3 py-2 rounded transition ${
                        isSelected ? 'bg-gray-900 text-white' : 'bg-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {s.course?.deptCode} {s.course?.courseNum} • {s?.section} • {s?.semester} {s?.year}
                    </button>
                  );
                })}
                {filteredSections.length === 0 && (
                  <p className="text-gray-500">No courses found</p>
                )}
              </div>
            </>
          )}
         
          {selCourse && (
            <div className="mt-6 border-t pt-6 space-y-6">
              {/* section details */}
              <section>
                <h2 className="font-bold text-lg">Section Details</h2>
                <div className="space-y-1 pl-2 text-sm">
                  <p><strong>Year &amp; Semester:</strong> {selCourse.semester ?? 'N/A'} {selCourse.year ?? 'N/A'}</p>
                  <p><strong>Section:</strong> {selCourse.section ?? 'N/A'}</p>
                  <p><strong>Type:</strong> {selCourse.type ?? 'N/A'}</p>
                  <p><strong>Instructor:</strong> {instructor && instructor.firstName && instructor.lastName ? `${instructor.firstName} ${instructor.lastName}` : 'N/A'}</p>
                </div>
              </section>

              {/* course need */}
              <section>
                <h2 className="font-bold text-lg">Course Need</h2>
                <div className="space-y-1 pl-2 text-sm">
                  <p><strong>Description:</strong> {selCourse.need?.description ?? 'N/A'}</p>
                  <p><strong>Allocated Hours:</strong> {selCourse.need?.numHoursCurrentlyAllocated ?? 'N/A'}</p>
                  <p><strong>Required Hours:</strong> {selCourse.need?.requiredGradingHours ?? 'N/A'}</p>
                </div>
              </section>

              {/* prerequisites */}
              <section>
                <h2 className="font-bold text-lg">Prerequisites</h2>
                <div className="pl-2 text-sm">
                  {(selCourse.need?.prerequisites && selCourse.need.prerequisites.length > 0)
                    ? <ul className="list-disc pl-4 space-y-1">
                        {selCourse.need.prerequisites.map((c, i) => (
                          <li key={i}>{c.deptCode} {c.courseNum}</li>
                        ))}
                      </ul>
                    : <p>None</p>
                  }
                </div>
              </section>
            </div>
          )}

        </div>
        <div className="lg:col-span-14 bg-white p-6 rounded shadow space-y-4">
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
        {/* Offer Banner */}      
        {(hasOffer || showBanner) && selApp && selCourse && (
        <div
          className="
            mt-4
            bg-[#e8f1ff]
            border-l-4 border-[#040941]
            rounded-md
            p-4
            flex flex-col md:flex-row md:items-center md:justify-between
            shadow
          "
          role="status"
          aria-live="polite"
        >
          <div>
            {/* header changes */}
            <p className="font-semibold text-[#040941]">
              {showBanner
                ? 'Offer Sent'
                : 'Existing Offer'}
            </p>

            {/* message changes */}
            <p className="text-sm text-gray-700">
              {showBanner
                ? `You’ve just sent an offer to `
                : `An offer was already sent to `}
              <strong>
                {selApp.student.firstName} {selApp.student.lastName}
              </strong>{' '}
              for{' '}
              <strong>
                {selCourse.course?.deptCode}{' '}
                {selCourse.course?.courseNum}{' '}
                Section {selCourse?.section}
              </strong>
              .{' '}
              {showBanner
                ? `They’ve been offered ${selApp.wantWorkingHours} hours.`
                : `They were offered ${selApp.wantWorkingHours} hours earlier.`}
            </p>
          </div>

          {/* actions */}
          <div className="mt-2 md:mt-0 flex items-center space-x-3">
            <Link
              to="/applications"
              className="text-sm bg-[#040941] text-white px-3 py-1 rounded hover:bg-[#03072a] transition"
            >
              View
            </Link>
            <button
              onClick={() => {
                setSelApp(null);
                setShowBanner(false);
              }}
              className="text-sm bg-[#040941] text-white px-3 py-1 rounded hover:bg-[#03072a] transition"
            >
              Revoke  
            </button>
          </div>
        </div>
      )}

        </div>
        <ApplicationFilterPanel
          appQ={appQ}
          setAppQ={setAppQ}
          allApps={allApps}
          selApp={selApp}
          loadApp={loadApp}
          colSpanClass="lg:col-span-5"
        />
      </div>
      <ToastContainer />
    </div>
  );
};

export default TAAllocationPage;
