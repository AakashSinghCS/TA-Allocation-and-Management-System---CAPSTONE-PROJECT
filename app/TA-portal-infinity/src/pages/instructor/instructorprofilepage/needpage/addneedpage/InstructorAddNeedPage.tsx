import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import SectionFilter from "../../../../../components/features/course/coursefilter/SectionFilter";
import SectionList from "../../../../../components/features/course/sectionlist/SectionList";

import type { Course } from "../../../../../interfaces/course/Course";
import type Section from "../../../../../interfaces/section/Section";

import { type FilterSectionsProps } from "../../../../../api/course/sectionfilter/fetchFilteredSections";
import { convertFilterSectionsToSections } from "../../../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections";

// You must have an API util for fetching one section by ID
import { fetchSectionIncludeInstructorId } from "../../../../../api/section/fetchSectionIncludeInstructorId";
// And an API util for creating the need on the server
import { fetchAddNeed } from "../../../../../api/need/fetchAddNeed";

import { fetchDeadlines } from "../../../../../api/admin/FetchDeadline";
import type { DeadlineDto } from "../../../../../interfaces/admin/Deadline";
import { useAuth } from "../../../../../context/AuthContext";

import { toast } from "react-toastify";
import { useDebounce } from "../../../../../utility/pagination/useDebounce";
import { useSectionSearchPage } from "../../../../../api/course/sectionfilter/useSectionFilter";
import Pagination from "../../../../../utility/pagination/pagination/Pagination";


export default function InstructorAddNeedPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState<Section | null>(null);

  const [description, setDescription] = useState("");
  const [requiredHours, setRequiredHours] = useState(0);

  const [prereqCourses, setPrereqCourses] = useState<Course[]>([]);
  // const [filteredSections, setFilteredSections] = useState<Section[] | null>([]);

  const [needDeadline, setNeedDeadline] = useState<DeadlineDto | null>(null);
  const [deadlineError, setDeadlineError] = useState("");

  const { token, userId, userRoles } = useAuth();

  useEffect(() => {
    if (!sectionId) return;
    setLoading(true);
    fetchSectionIncludeInstructorId(Number(sectionId))
      .then((sec) => setSection(sec))
      .catch((err) =>
        navigate("/error", { replace: true, state: { message: err.message } })
      )
      .finally(() => setLoading(false));
  }, [sectionId, navigate]);

  useEffect(() => {
    async function loadDeadline() {
      setDeadlineError("");
      try {
        const allDeadlines = await fetchDeadlines(token || "");
        const needDeadline = allDeadlines.find(
          (d) => d.name === "instructor_need_update_deadline"
        );
        setNeedDeadline(needDeadline || null);
      } catch (err) {
        console.error("Failed to load deadline:", err);
        setDeadlineError("Could not load need update deadline.");
      }
    }

    if (token) loadDeadline();
  }, [token]);

  const deadlinePassed = !!needDeadline && new Date(needDeadline.endTime) < new Date();


  const [filters, setFilters] = useState<FilterSectionsProps>({});
  const [page, setPage] = useState(0);
  const debounced = useDebounce(filters, 300);
  useEffect(() => { setPage(0); }, [debounced]);
  const {
    data: pageData,
    isFetching: loadingSections,
    isError: fetchError,
    error: fetchErrMsg
  } = useSectionSearchPage(debounced, page, 10);
  const raw = pageData?.content ?? [];
  const filteredSections = convertFilterSectionsToSections(raw);

  const onSelectCourse = (cId: number, deptCode: string, courseNum: string, name: string) => {
    const newCourse: Course = { id: cId, deptCode, courseNum, name };
    setPrereqCourses((prev) => {
      if (prev.find((c) => c.id === cId)) return prev;
      return [...prev, newCourse];
    });
  };

  const onRemoveCourse = (id: number) => {
    setPrereqCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionId) return;
    if (deadlinePassed) {
      toast.error('Deadline passed, cannot submit');
      return;
    }
    setLoading(true);
    try {
      if (!section) return;
      await fetchAddNeed({
        section: section,
        description,
        requiredGradingHours: requiredHours,
        prereqCourses: prereqCourses,
      });
      navigate(-1);
    } catch (err) {
      navigate("/error", { replace: true, state: { message: (err as Error).message } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 w-full max-w-7xl">
      <h2 className="text-2xl font-bold mb-4">
        {section
          ? `${section.course?.deptCode} ${section.course?.courseNum} – ${section.course?.name}`
          : "Loading section..."}
      </h2>

      {needDeadline && (
        <p className="text-md text-gray-700 mb-6">
          Deadline:{" "}
          <span className="font-medium">
            {new Date(needDeadline.endTime).toLocaleString()}
          </span>
        </p>
      )}
      {!needDeadline && !deadlineError && (
        <p className="text-md text-gray-500 mb-6">
          No application deadline found.
        </p>
      )}
      {deadlineError && (
        <p className="text-md text-red-500 mb-6">
          {deadlineError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="description" className="block text-md font-medium">
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

        {/* Required grading hours */}
        <div>
          <label htmlFor="requiredHours" className="block text-md font-medium">
            Required Grading Hours*
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

            {/* Heading for prerequisites */}
            <h3 className="text-md font-medium mb-2">Manage Prerequisite(s) for the course*</h3>

        {/* Prerequisite Courses Card */}
        <div className="bg-white border border-gray-300 rounded-md p-6 mb-6">
          <h3 className="text-md font-medium mb-6">Add Prerequisite to Course</h3>
          <div className="flex flex-col md:flex-row gap-8">
            {/*  Selected Prerequisites */}
            <div className="md:w-1/3">
              <h4 className="text-md font-medium mb-2">Selected Courses</h4>
              {prereqCourses.length > 0 ? (
                <div className="space-y-2">
                  {prereqCourses.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between bg-gray-300 px-3 py-2 rounded"
                    >
                      <span>
                        {c.deptCode} {c.courseNum} – {c.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveCourse(c.id!)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No prerequisites selected yet.</p>
              )}
            </div>
            {/* Divider */}
            <div className="hidden md:block w-px bg-gray-300 mx-2" />
            {/* Add/Filter Section */}
            <div className="md:w-2/3">
              <h4 className="text-md font-medium mb-2">Add a Course</h4>
              <div className="border p-4 rounded-md shadow-sm mb-4">
                <SectionFilter onFilterChange={setFilters} mode="large" />
              </div>
              {loading ? (
                <p>Loading courses…</p>
              ) : (
                <>
                  <SectionList
                    sections={filteredSections}
                    mode="instructorPrereqCourse"
                    onSelectCourse={onSelectCourse}
                    askForConfirmation
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
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            onClick={(e) => {
              if (deadlinePassed) {
                e.preventDefault(); 
                toast.error("The need update deadline has passed. You can no longer submit.");
              }
            }}
            className={`px-6 py-2 rounded ${deadlinePassed
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#040941] hover:bg-blue-900 text-white font-medium py-2 px-6 rounded"
              }`}
          >
            Save TA Requirement(s)
          </button>
        </div>
      </form>
    </div>
  );
}
