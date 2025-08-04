import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { type FilterSectionsProps } from "../../../../../api/course/sectionfilter/fetchFilteredSections";
import { fetchGetNeed } from "../../../../../api/need/fetchGetNeed";
import { fetchUpdateNeed } from "../../../../../api/need/fetchUpdateNeed";
import { fetchAssignInstructor } from "../../../../../api/section/instructor/fetchAssignInstructor";
import SectionFilter from "../../../../../components/features/course/coursefilter/SectionFilter";
import SectionList from "../../../../../components/features/course/sectionlist/SectionList";
import { useAuth } from "../../../../../context/AuthContext";
import type { Course } from "../../../../../interfaces/course/Course";
import type Section from "../../../../../interfaces/section/Section";
import { convertFilterSectionsToSections } from "../../../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections";
import { useDebounce } from "../../../../../utility/pagination/useDebounce";
import { useSectionSearchPage } from "../../../../../api/course/sectionfilter/useSectionFilter";
import Pagination from "../../../../../utility/pagination/pagination/Pagination";

type Mode = "update" | "add";

export default function InstructorAddSectionPage({ mode = 'add' }: { mode?: Mode }) {
  const { userId: instructorId } = useAuth();
  const navigate = useNavigate();

  const { courseId: courseIdParam, year: yearParam, semester } = useParams<{
    courseId: string;
    year: string;
    semester: string;
  }>();
  const courseId = Number(courseIdParam);
  const year = Number(yearParam);
  const [description, setDescription] = useState("");
  const [requiredHours, setRequiredHours] = useState(0);
  // const [filteredSections, setFilteredSections] = useState<Section[] | null>([]);
  // const [loading, setLoading] = useState(false);
  const [selectedPrereqs, setSelectedPrereqs] = useState<Course[]>([]);
  const [numHoursCurrentlyAllocated, setNumHoursCurrentlyAllocated] = useState(0);

  const [filters, setFilters] = useState<FilterSectionsProps>({});
  const [page, setPage] = useState(0);
  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => { setPage(0); }, [debouncedFilters]);

    const {
    data: pageData,
    isFetching: loadingSections,
    isError: fetchError,
    error: fetchErrorMsg
  } = useSectionSearchPage(debouncedFilters, page, 10);
  const raw = pageData?.content ?? [];
  const filteredSections = convertFilterSectionsToSections(raw);
  
  useEffect(() => {
    if (mode === 'update' && courseId && year && semester) {
      fetchGetNeed(courseId,year,semester)
      .then((need) => {
        
        setDescription(need?.description ?? "");
        setRequiredHours(need?.requiredGradingHours ?? -1);
        setNumHoursCurrentlyAllocated(need?.numHoursCurrentlyAllocated ?? -1);
        // const ids = (need?.prerequisites || []).map(c => c.id!);
        // originalIdsRef.current = ids;
        setSelectedPrereqs(need?.prerequisites ?? [])
      })
      .catch((err) => navigate('/error', { replace: true, state: { message: err.message } }));
    }
  }, [mode, courseId, year, semester, navigate]);

  // const handleFilterChange = async (filters: FilterSectionsProps) => {
  //   setLoading(true);
  //   try {
  //     const raw = await fetchFilteredSections(filters);
  //     setFilteredSections(convertFilterSectionsToSections(raw || []));
  //   } catch (e) {
  //     navigate('/error', { replace: true, state: { message: (e as Error).message } });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // per‐section add (in “add” mode)
  const onSelect = async (section: Section) => {
    const ok = await fetchAssignInstructor(instructorId, section?.id ?? -1);
    alert(ok ? 'Section added!' : 'Failed to add section.');
    navigate(`/user/instructorprofile/${instructorId}/need`);
  };

  const onSelectCourseForPrereq = useCallback((cid: number) => {
    if (!filteredSections) return;
    const foundSec = filteredSections.find(sec => sec.course?.id === cid);
    if (!foundSec) return;

    const courseObj: Course = {
      id: cid,
      deptCode: foundSec.course!.deptCode,
      courseNum: foundSec.course!.courseNum,
      name: foundSec.course!.name
    };

    setSelectedPrereqs(prev =>
      prev.some(c => c.id === cid)
        ? prev.filter(c => c.id !== cid)
        : [...prev, courseObj]
    );
  }, [filteredSections]);

  const onRemovePrereq = (courseIdToRemove: number) => {
    setSelectedPrereqs(prev =>
      prev.filter(c => c?.id !== courseIdToRemove)
    );
  };

  const handleSavePrereqs = async () => {
    // const original = originalIdsRef.current;
    // const current = selectedPrereqs.map(c => c.id!);
    const ok = await fetchUpdateNeed({
      description: description,
      requiredGradingHours : requiredHours,
      numHoursCurrentlyAllocated : numHoursCurrentlyAllocated,
      courseId: courseId, 
      year: year, 
      semester: semester,
      prerequisites:selectedPrereqs
    });
    alert(ok ? 'Prerequisites updated!' : 'Failed to update prerequisites.');
    navigate(`/user/instructorprofile/${instructorId}/need`);
  };

  return (
    <div className="container mx-auto p-4 w-full max-w-3xl z-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">
          {mode === 'add' ? 'Search for a Section' : 'Update Course Prerequisites'}
        </h1>
        <p className="text-sm text-gray-400">
          {mode === 'add'
            ? 'Search for a section and click Select in the far right column.'
            : 'Click “Select” on any course header below to toggle its sections as prerequisites, then click Save.'}
        </p>
      </div>

      {mode === 'update'  && (
        <div className="mb-6">
           <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Additional Comments
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="requiredHours" className="block text-sm font-medium">
            Required Grading Hours
          </label>
          <input
            id="requiredHours"
            type="number"
            min={0}
            value={requiredHours}
            onChange={(e) => setRequiredHours(parseInt(e.target.value, 10) || 0)}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
          <h3 className="text-lg font-semibold mb-2">Selected Prerequisite Sections</h3>
          <div className="space-y-2">
            {selectedPrereqs.map(cou => (
              <div
                key={cou?.id}
                className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded"
              >
                <span>
                  {cou?.deptCode} {cou?.courseNum} – {cou?.name}
                </span>
                <button
                  type="button"
                  onClick={() => onRemovePrereq(cou.id ?? -1)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="shadow-lg p-4 rounded-2xl mb-4">
        <SectionFilter onFilterChange={setFilters} mode="large" />
      </div>

      {loadingSections ? (
        <p>Loading sections…</p>
      ) : (
        <>
        <SectionList
          sections={filteredSections}
          mode={mode === 'add' ? 'instructorAddSection' : 'instructorPrereqCourse'}
          onSelect={mode === 'add' ? onSelect : undefined}
          onSelectCourse={mode === 'update' ? onSelectCourseForPrereq : undefined}
          askForConfirmation={true}
        />
        <div className="mt-4">
          <Pagination
            page={page}
            pageCount={pageData?.totalPages ?? 0}
            onPrev={() => setPage(p => Math.max(0,p-1))}
            onNext={() => setPage(p => Math.min((pageData?.totalPages ?? 1)-1, p+1))}
          />
        </div>
        </>
      )}

      {mode === 'update' && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSavePrereqs}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Prerequisites
          </button>
        </div>
      )}
    </div>
  );
}
