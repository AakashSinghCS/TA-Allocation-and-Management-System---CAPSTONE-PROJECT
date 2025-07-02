import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { getDayNumber } from '../../utility/calendar/calendarUtils';
import type { SectionDetails } from '../../interfaces/section/SectionDetails';
import type SectionSchedule from '../../interfaces/section/SectionSchedule';
import type { Need } from '../../interfaces/need/Need';
import type Section from '../../interfaces/section/Section';
import type { Allocation } from '../../interfaces/allocation/Allocation';
import { useAuth } from '../../context/AuthContext';
import type { ApplicationDto } from '../../interfaces/application/Application';
import { fetchApplications } from '../../api/application/FetchApplications';
import ApplicationFilterPanel from '../../components/features/application/ApplicationFilterPanel';
import { ToastContainer } from 'react-toastify';
import { useSendOffer } from '../../hooks/sendoffer/useSendOffer';
import OfferBanner from '../../components/ui/offerbanner/OfferBanner';
import SectionFilter from '../../components/features/course/coursefilter/SectionFilter';
import { fetchFilteredSections, type FilterSectionsProps } from '../../api/sectionfilter/fetchFilteredSections';
import { convertFilterSectionsToSections } from '../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections';
import { fetchSectionInfo } from '../../api/section/fetchSectionInfo';

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
      setFilteredSections(convertFilterSectionsToSections(raw || []));
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
  const [selApp, setSelApp] = useState<ApplicationDto | null>(null);

  const loadCourse = async (details: SectionDetails) => {
  if (!details.sectionId) return;
  try {
    const full = await fetchSectionInfo(details.sectionId, token!);
    setSelCourse({
      ...full,
      hasCompleted: !!(
        full.need?.numOfHoursCurrentlyAllocated != null &&
        full.need?.requiredGradingHours != null &&
        full.need.numOfHoursCurrentlyAllocated >= full.need.requiredGradingHours
      ),
    });
    setSelApp(null);
  } catch (err) {
    console.error("Failed to load section:", err);
  }
};
  const onSend = () => {
    if (!selApp || !selCourse?.sectionDetails?.sectionId || !selCourse.need) return;
    sendOffer(
      selApp,
      selCourse.sectionDetails.sectionId,
      selCourse.need,
      hasConflict,
      async () => {
        await loadCourse(selCourse.sectionDetails!);
        setShowBanner(true);
      }
    );
  };

  const loadApp = (a: ApplicationDto) => setSelApp(a);

  const courseEvents = (selCourse?.sectionSchedule || []).map((slot, i) => {
    const dayNum = getDayNumber(slot.day);
    const conflict = selApp?.availabilities.some(av =>
      dayNum === getDayNumber(av.day) &&
      slot.endTime !== undefined &&
      av.startTime < slot.endTime &&
      slot.startTime !== undefined &&
      av.endTime > slot.startTime
    ) ?? false;

    return {
      id: `c${i}`,
      title: 'Course Slot',
      daysOfWeek: [dayNum],
      startTime: slot.startTime,
      endTime: slot.endTime,
      backgroundColor: conflict ? 'rgba(220, 38, 38, 0.8)' : '#3B82F6CC',
    };
  });

  const appEvents = (selApp?.availabilities || []).map((slot, i) => {
    const dayNum = getDayNumber(slot.day);
    const conflict = selCourse?.sectionSchedule?.some(cs =>
      dayNum === getDayNumber(cs.day) &&
      cs.endTime !== undefined &&
      slot.startTime < cs.endTime &&
      cs.startTime !== undefined &&
      slot.endTime > cs.startTime
    ) ?? false;

    return {
      id: `app${i}`,
      title: 'Student Avail',
      daysOfWeek: [dayNum],
      startTime: slot.startTime,
      endTime: slot.endTime,
      backgroundColor: conflict ? 'rgba(220, 38, 38, 0.8)' : 'rgba(16, 185, 129, 0.8)',
    };
  });

  const bgConflictEvents = (selApp?.availabilities || []).flatMap((slot, i) => {
    const dayNum = getDayNumber(slot.day);
    return (selCourse?.sectionSchedule || [])
      .filter(cs =>
        dayNum === getDayNumber(cs.day) &&
        cs.startTime !== undefined &&
        cs.endTime !== undefined &&
        slot.startTime < cs.endTime &&
        slot.endTime > cs.startTime
      )
      .map((cs, j) => {
        if (!cs.startTime || !cs.endTime) return null;

        const start = slot.startTime > cs.startTime ? slot.startTime : cs.startTime;
        const end = slot.endTime < cs.endTime ? slot.endTime : cs.endTime;
              
        return {
          id: `conflict-bg-${i}-${j}`,
          daysOfWeek: [dayNum],
          startTime: start,
          endTime: end,
          display: 'background',
          backgroundColor: 'rgba(220, 38, 38, 0.3)',
        };
      })
      .filter(Boolean);
  });

  const events = [
    ...courseEvents,
    ...appEvents,
    ...bgConflictEvents,
  ].filter((e): e is NonNullable<typeof e> => e !== null);

  const required = selCourse?.need?.requiredGradingHours ?? 0;
  const allocated = selCourse?.need?.numOfHoursCurrentlyAllocated ?? 0;
  const remaining = Math.max(required - allocated, 0);
  const hoursOK = allocated >= required;
  const hasConflict = bgConflictEvents.length > 0;

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
                  const isSelected = selCourse?.sectionDetails?.sectionId === s.sectionDetails?.sectionId;
                  return (
                    <button
                      key={s.sectionDetails?.sectionId}
                      onClick={() => loadCourse(s.sectionDetails!)}
                      className={`w-full text-left px-3 py-2 rounded transition ${
                        isSelected ? 'bg-gray-900 text-white' : 'bg-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {s.sectionDetails?.deptCode} {s.sectionDetails?.courseNum} • {s.sectionDetails?.section} • {s.sectionDetails?.semester} {s.sectionDetails?.year}
                    </button>
                  );
                })}
                {filteredSections.length === 0 && (
                  <p className="text-gray-500">No courses found</p>
                )}
              </div>
            </>
          )}
         
                  {selCourse?.need && selCourse.sectionDetails && (
              <div className="mt-6 border-t pt-6 space-y-6">
                {/* SECTION DETAILS */}
                <section>
                  <h2 className="font-bold text-lg">Section Details</h2>
                  <div className="space-y-1 pl-2 text-sm">
                    <p><strong>Year &amp; Semester:</strong> {selCourse.sectionDetails.semester} {selCourse.sectionDetails.year}</p>
                    <p><strong>Section:</strong> {selCourse.sectionDetails.section}</p>
                    <p><strong>Type:</strong> {selCourse.sectionDetails.type}</p>
                  </div>
                </section>

                {/* COURSE NEED */}
                <section>
                  <h2 className="font-bold text-lg">Course Need</h2>
                  <div className="space-y-1 pl-2 text-sm">
                    <p><strong>Description:</strong> {selCourse.need.description}</p>
                    <p><strong>Allocated Hours:</strong> {selCourse.need.numOfHoursCurrentlyAllocated}</p>
                    <p><strong>Required Hours:</strong> {selCourse.need.requiredGradingHours}</p>
                  </div>
                </section>

                {/* PREREQUISITES */}
                <section>
                  <h2 className="font-bold text-lg">Prerequisites</h2>
                  <div className="pl-2 text-sm">
                    {(selCourse.need.courseNeeds ?? []).length > 0
                      ? <ul className="list-disc pl-4 space-y-1">
                          {selCourse.need.courseNeeds!.map((c, i) => (
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
              <span className="text-sm">Student Availability</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-8 h-4 block rounded-sm" style={{ backgroundColor: 'rgba(187, 13, 13, 0.3)' }} />
              <span className="text-sm">Conflict</span>
            </div>
          </div>
          <FullCalendar
            key={selCourse?.sectionDetails?.sectionId ?? 'none'}
            plugins={[timeGridPlugin]}
            initialView="timeGridWeek"
            headerToolbar={false}
            allDaySlot={false}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            slotEventOverlap={false}
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
              Schedule Conflict:{' '}
              <span className={hasConflict ? 'text-red-600' : 'text-green-600'}>
                {hasConflict ? 'Yes' : 'No'}
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
      <OfferBanner
        visible={showBanner}
        student={selApp?.student!}
        section={selCourse?.sectionDetails!}
        hours={selApp?.wantWorkingHours!}
        onClose={() => setShowBanner(false)}
      />
      <ToastContainer />
    </div>
  );
};

export default TAAllocationPage;
