import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import SectionFilter from "../../../../../components/features/course/coursefilter/SectionFilter";
import SectionList from "../../../../../components/features/course/sectionlist/SectionList";

import type { Course } from "../../../../../interfaces/course/Course";
import type Section from "../../../../../interfaces/section/Section";

import { fetchFilteredSections, type FilterSectionsProps } from "../../../../../api/course/sectionfilter/fetchFilteredSections";
import { convertFilterSectionsToSections } from "../../../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections";

// You must have an API util for fetching one section by ID
import { fetchSectionIncludeInstructorId } from "../../../../../api/section/fetchSectionIncludeInstructorId";
// And an API util for creating the need on the server
import { fetchAddNeed } from "../../../../../api/need/fetchAddNeed";

import { fetchDeadlines } from "../../../../../api/admin/FetchDeadline";
import type { DeadlineDto } from "../../../../../interfaces/admin/Deadline";
import { useAuth } from "../../../../../context/AuthContext";

export default function InstructorAddNeedPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState<Section | null>(null);

  const [description, setDescription] = useState("");
  const [requiredHours, setRequiredHours] = useState(0);

  const [prereqCourses, setPrereqCourses] = useState<Course[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[] | null>([]);

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
  
  const deadlinePassed =
      !! needDeadline &&
      new Date(needDeadline.endTime) < new Date();

  const handleFilterChange = async (filters: FilterSectionsProps) => {
    setLoading(true);
    try {
      const raw = await fetchFilteredSections(filters);
      setFilteredSections(convertFilterSectionsToSections(raw || []));
    } catch (e) {
      navigate("/error", { replace: true, state: { message: (e as Error).message } });
    } finally {
      setLoading(false);
    }
  };

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

    setLoading(true);
    try {
        if(!section) return;
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
    <div className="container mx-auto p-4 w-full max-w-3xl">
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

        {/* Required grading hours */}
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

        {/* Selected prerequisites */}
        {prereqCourses.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Selected Prerequisite Courses</h3>
            <div className="space-y-2">
              {prereqCourses.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded"
                >
                  <span>
                    {c.deptCode} {c.courseNum} – {c.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveCourse(c.id!)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Remove Course
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter & list to add more */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Add a Course to Prerequisites</h3>
          <div className="border p-4 rounded-md shadow-sm mb-4">
            <SectionFilter onFilterChange={handleFilterChange} mode="large" />
          </div>
          {loading ? (
            <p>Loading courses…</p>
          ) : (
            <SectionList sections={filteredSections} onSelectCourse={onSelectCourse} mode='instructorPrereqCourse'/>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            onClick={(e) => {
              if (deadlinePassed) {
                e.preventDefault(); // prevent form submission
                alert("The need update deadline has passed. You can no longer submit.");
              }
            }}
            className={`px-6 py-2 rounded ${
              deadlinePassed
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            }`}
          >
            Save Need
          </button>
        </div>
      </form>
    </div>
  );
}
