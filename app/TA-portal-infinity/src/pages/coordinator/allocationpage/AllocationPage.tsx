import React, { useState, useEffect, useMemo } from 'react';
import { getDayNumber } from '../../../utility/calendar/calendarUtils';
import type SectionDetails from '../../../interfaces/section/SectionDetails';
import type Section from '../../../interfaces/section/Section';
import { useAuth } from '../../../context/AuthContext';
import type { ApplicationDto } from '../../../interfaces/application/Application';
import ApplicationFilterPanel from '../../../components/features/application/applicationfilterpanel/ApplicationFilterPanel';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import SectionFilter from '../../../components/features/course/coursefilter/SectionFilter';
import { type FilterSectionsProps } from '../../../api/course/sectionfilter/fetchFilteredSections';
import { convertFilterSectionsToSections } from '../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections';
import { fetchSectionInfo } from '../../../api/section/fetchSectionInfo';
import type { Allocation } from '../../../interfaces/allocation/Allocation';
import { fetchAllocationsByStudent } from '../../../api/allocation/fetchAllocationByStudent';
import { fetchSectionIncludeInstructorId } from '../../../api/section/fetchSectionIncludeInstructorId';
import { fetchInstructorById } from '../../../api/section/instructor/fetchInstructorById';

import { useSectionSearchPage } from '../../../api/course/sectionfilter/useSectionFilter';
import { useDebounce } from '../../../utility/pagination/useDebounce';
import SectionSelectionList from './sectionselectionlist/SectionSelectionList';
import SelectedSectionPanel from './selectedsectionpanel/SelectedSectionPanel';
import AllocationCalendar from './allocationcalendar/AllocationCalendar';
import AllocationBanner from './allocationbanner/AllocationBanner';
import { StrikethroughIcon } from 'lucide-react';

const TAAllocationPage: React.FC = () => {
  const { token } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [filters, setFilters] = useState<FilterSectionsProps>({});
  const [page, setPage] = useState(0);
  const debounced = useDebounce(filters, 300);
  useEffect(() => { setPage(0); }, [debounced]);
  const { data: sectionPage, isFetching: loadingSections } = useSectionSearchPage(debounced, page, 5);
  const rawSections = sectionPage?.content ?? [];
  const filteredSections: Section[] = convertFilterSectionsToSections(rawSections);

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

  const loadApp = (a: ApplicationDto) => setSelApp(a);


  const onSendOfferSuccess = async () => {
    if (!selApp || !selCourse?.id || !selCourse.need) return;
    await loadCourse(selCourse!);
    // allocation history so Revoke works 
    if (selApp.student.id && token) {
      try{
        const newHistory = await fetchAllocationsByStudent(selApp.student.id, token);
        setHistory(newHistory);
      } catch (err){
        console.error("Failed to refresh history:", err);
        setHistory([]);
      }
    }
    setShowBanner(true);
  }

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
            <div className="mt-6 border-t pt-6 space-y-6">
              {/* section details */}
              <section>
                <h2 className="font-bold text-lg">Section Details</h2>
                <div className="space-y-1 pl-2 text-sm">
                  <p><strong>Year &amp; Semester:</strong> {selCourse.semester ?? 'N/A'} {selCourse.year ?? 'N/A'}</p>
                  <p><strong>Section:</strong> {selCourse.section ?? 'N/A'}</p>
                  <p><strong>Type:</strong> {selCourse.type ?? 'N/A'}</p>
                  <p><strong>Instructor:</strong> {instructor && instructor.firstName && instructor.lastName ? `${instructor.firstName} ${instructor.lastName}` : 'N/A'}</p>
                  <p><strong>TAs Allocated:</strong> {selCourse.numberOfTAsAllocated ?? '0'}</p>
                </div>
              </section>
            </div> 
          )}

          {selCourse && (
            <SelectedSectionPanel
              section={selCourse}
              instructor={instructor}
            />
          )}

        </div>
        <div className="lg:col-span-14 bg-white p-6 rounded shadow space-y-4">
          <AllocationCalendar
            selCourse={selCourse}
            selApp={selApp}
            onSendOfferSuccess={onSendOfferSuccess}
          />
          {(hasOffer || showBanner) && selApp && selCourse && (
            <AllocationBanner
              selApp={selApp}
              setSelApp={setSelApp}
              selCourse={selCourse}
              refreshHistory={refreshHistory}
              token={token}
              history={history}
              showBanner={showBanner}
              setShowBanner={setShowBanner}
            />
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
