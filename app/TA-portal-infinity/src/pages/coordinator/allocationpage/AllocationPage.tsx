import React, { useState, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { getDayNumber } from '../../../utility/calendar/calendarUtils';
import type SectionDetails from '../../../interfaces/section/SectionDetails';
import type Section from '../../../interfaces/section/Section';
import { useAuth } from '../../../context/AuthContext';
import type { ApplicationDto } from '../../../interfaces/application/Application';
import { fetchApplicationsPage } from '../../../api/application/FetchApplications';
import ApplicationFilterPanel from '../../../components/features/application/applicationfilterpanel/ApplicationFilterPanel';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
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
import { deallocateAllocation } from '../../../api/allocation/deallocateAllocation';
import { useSectionSearchPage } from '../../../api/course/sectionfilter/useSectionFilter';
import { useDebounce } from '../../../utility/pagination/useDebounce';
import SectionSelectionList from './sectionselectionlist/SectionSelectionList';
import SectionDetailsPanel from './selectedsectionpanel/SelectedSectionPanel';
import { useApplicationSearchPage } from '../../../api/application/useApplicationSearchPage';

const TAAllocationPage: React.FC = () => {
  const { token } = useAuth();
  const { sendOffer, loading } = useSendOffer();
  const [showBanner, setShowBanner] = useState(false);

  const [filters, setFilters] = useState<FilterSectionsProps>({});
  const [page, setPage] = useState(0);
  const debounced = useDebounce(filters, 300);
  useEffect(() => { setPage(0); }, [debounced]);
  const { data: sectionPage, isFetching: loadingSections } = useSectionSearchPage(debounced, page, 5);
  const rawSections = sectionPage?.content ?? [];
  const filteredSections: Section[] = convertFilterSectionsToSections(rawSections);

  // const [allApps, setAllApps] = useState<ApplicationDto[]>([]);
  // const { data: appPageData, isFetching: loadingApps } = useApplicationSearchPage(appQ, appPage, appSize, token!);

  const [selCourse, setSelCourse] = useState<Section | null>(null);
  const [instructor, setInstructor] = useState<{ firstName: string; lastName: string } | null>(null);
  const [selApp, setSelApp] = useState<ApplicationDto | null>(null);
  const [history, setHistory] = useState<Allocation[]>([]);

  const loadCourse = async (details: SectionDetails) => {
    if (!details.id) return;
    try {
      const full = await fetchSectionInfo(details.id, token!);
      setSelCourse({
        ...full,
        hasCompleted: !!(
          full.need?.numHoursCurrentlyAllocated != null &&
          full.need?.requiredGradingHours != null &&
          full.need.numHoursCurrentlyAllocated >= full.need.requiredGradingHours
        ),
      });
    } catch (err) {
      console.error("Failed to load section:", err);
      //Temporary UX helper here:
      toast.error("Are you sure instructor has set the requirements for this section?");
      return;
    }

    // Fetch instructor info using section id
    try {
      const sec = await fetchSectionIncludeInstructorId(details.id);
      if (!sec) {
        setInstructor(null);
        return;
      } else if (sec.instructor && sec.instructor.firstName && sec.instructor.lastName) {
        setInstructor({
          firstName: sec.instructor.firstName,
          lastName: sec.instructor.lastName,
        });
      } else if (sec.instructorId != null) {
        const inst = await fetchInstructorById(sec.instructorId);
        setInstructor(
          inst && inst.firstName && inst.lastName
            ? { firstName: inst.firstName, lastName: inst.lastName }
            : null
        );
      } else {
        setInstructor(null);
      }
    } catch (err) {
      console.error("Failed to fetch instructor details:", err);
      setInstructor(null);
    }
  };
  // Helper to fetch allocation history for the selected student
  const refreshHistory = async (studentId: number, token: string) => {
    try {
      //  using fetchSectionIncludeInstructorId to get section with instructorId
      let section = await fetchSectionIncludeInstructorId(studentId);
      // If 'need' is missing, fetch it from fetchSectionInfo
      if (section && !section.need) {
        try {
          const sectionWithNeed = await fetchSectionInfo(studentId, token || "");
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
        // allocation history so Revoke works 
        if (selApp.student.id && token) {
          await refreshHistory(selApp.student.id, token);
        }
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

  // Checking if we have a selected application and course before fetching history

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
    <div className="p-2 min-h-screen space-y-8">
      <h1 className="text-4xl md:text-4xl font-bold text-[#040941] mb-8 tracking-tight">TA Allocations</h1>
      <div className="grid lg:grid-cols-24 gap-6">
        <div className="lg:col-span-5 bg-white p-3 rounded shadow space-y-4">
          <h1 className="font-semibold text-xl">Course Filter</h1>
          <SectionFilter
            mode="small"
            onFilterChange={setFilters}
          />
          {loadingSections ? (
            <p>Loading courses…</p>
          ) : (
            <>
              <h1 className="font-semibold text-xl mt-2">Please select a course*</h1>
              <SectionSelectionList
                sections={filteredSections}
                selectedId={selCourse?.id}
                onSelect={loadCourse}
                page={page}
                pageCount={sectionPage?.totalPages ?? 0}
                onPrev={() => setPage(p => Math.max(0, p - 1))}
                onNext={() => setPage(p => Math.min((sectionPage?.totalPages ?? 1) - 1, p + 1))}
              />
            </>
          )}

          {selCourse && (
            <SectionDetailsPanel
              section={selCourse}
              instructor={instructor}
            />
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
                <button
                  onClick={async () => {
                    if (!selApp || !selCourse) return;
                    // Find the allocation for this app+section
                    const allocation = history.find(h =>
                      h.application?.applicationId === selApp.applicationId &&
                      h.section?.id === selCourse.id
                    );
                    if (!allocation || allocation.id == null) return;
                    try {
                      const ok = await deallocateAllocation(allocation.id, token || undefined);
                      if (!ok) throw new Error('Failed to deallocate');
                      setShowBanner(false);
                      setSelApp(null);
                      toast.success('Offer revoked successfully.');
                      if (selApp.student.id && token) {
                        await refreshHistory(selApp.student.id, token);
                      }
                    } catch (e) {
                      toast.error('Failed to revoke Offer.');
                    }
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