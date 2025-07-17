import AllocationCard from "../../../../../components/features/allocation/AllocationCard";
import NeedCard from "../../../../../components/features/need/needcard/NeedCard";
import SectionCard from "../../../../../components/features/section/sectioncard/SectionCard";
import type Section from "../../../../../interfaces/section/Section";
import { Link } from "react-router-dom";
import type { Need } from "../../../../../interfaces/need/Need";
import { fetchUpdateNeed } from "../../../../../api/need/fetchUpdateNeed";
import { useEffect, useState } from "react";
import { fetchDeleteNeed } from "../../../../../api/need/fetchDeleteNeed";
import { fetchUnassignInstructor } from "../../../../../api/section/instructor/fetchUnassignInstructor";
import { confirmDeletion } from "../../../../../utility/confirmation/confirmDeletion";
import { useAuth } from "../../../../../context/AuthContext";
import type { Course } from "../../../../../interfaces/course/Course";
import { fetchSectionNeedAndAllocations } from "../../../../../api/instructor/fetchSectionNeedAndAllocations";
import type { NeedViewerResponse } from "../InstructorNeedPage";

interface NeedViewerProps {
  instructorId: number;
  className?: string;
  initial: NeedViewerResponse | null;
}

export default function NeedViewer({ instructorId, className = "", initial }: NeedViewerProps) {
  const [sections, setSections] = useState<Section[]>(initial?.sections ?? []);
  const isInstructor = useAuth().userRoles.includes('INSTRUCTOR')
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    initial ?Math.max(...initial.existingYears.map(Number)): -1
  );
  const [selectedSemester, setSelectedSemester] = useState<string>("W1");

  useEffect(() => {
    const unique: Record<number, Course> = {};
    initial?.sections.forEach((sec) => {
      if (sec.course?.id && !unique[sec.course.id]) {
        unique[sec.course.id] = sec.course;
      }
    });
    setCourseList(Object.values(unique));

  }, [initial?.sections]);

  const onDeleteNeed = async (need: Need) => {
    const confirm = confirmDeletion("TA requirement","This will erase all the TA requirements for other sections of the associated course");
    if (confirm) {
      const success = await fetchDeleteNeed(need);
      if (success) {
        setSections((prev) =>
          prev.map((sec) =>
            sec.need && sec.need.id === need.id ? { ...sec, need: undefined } : sec
          )
        );
      }
    }
  };

  const onUpdateNeed = async (updatedNeed: Need) => {
    const success = await fetchUpdateNeed(updatedNeed);
    if (success) {
      setSections((prev) =>
        prev.map((sec) =>
          sec.need && sec.need.id === updatedNeed.id
            ? { ...sec, need: updatedNeed }
            : sec
        )
      );
    }
  };

  const onDeleteSection = async (s: Section) => {
    const confirm = window.confirm(
      "Do you really wish to unassign yourself from this section?"
    );
    if (confirm) {
      const ok = await fetchUnassignInstructor(s?.id ?? -1, instructorId);
      if (ok) {
        setSections((prev) =>
          prev.filter((sec) => sec?.id !== s?.id)
        );
      }
    }
  }
  const onSearch = async () => {
    const result = await fetchSectionNeedAndAllocations(
      instructorId,
      selectedCourse,
      selectedYear,
      selectedSemester
    );
    setSections(result ?? []);
  };
  
  return (
    <div className={"grid gap-3 " + className}>
      <div className="flex gap-2 items-end">
        <select
          value={selectedCourse ?? ""}
          onChange={(e) =>
            setSelectedCourse(
              e.target.value ? Number(e.target.value) : null
            )
          }
        >
          <option value="">All courses</option>
          {courseList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.deptCode} {c.courseNum}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {initial?.existingYears && initial?.existingYears.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>

        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
        >
          {["W1", "W2", "S1", "S2"].map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onSearch}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Search
        </button>
      </div>
      {/* Header row for large screens */}
      <div className="hidden lg:grid lg:grid-cols-3 font-medium text-lg text-slate-600">
        <span>Sections Teaching</span>
        <span>TA Requirements of Course</span>
        <span>Students Allocated</span>
      </div>

      {/* Section rows */}
      {sections.map((sec) => (
        <div key={sec?.id} className="grid gap-2 sm:grid-cols-1 lg:grid-cols-3">
          <SectionCard section={sec} className="" authenticated={isInstructor} onDelete={onDeleteSection} />

          {/* Need column */}
          {sec.need ? (
            <NeedCard
              need={sec.need}
              className=""
              onDelete={onDeleteNeed}
              onUpdate={onUpdateNeed}
              authenticated={isInstructor}
            />
          ) : (
            <div
              className="w-full overflow-hidden rounded-lg text-sm italic text-slate-500 border border-dashed border-slate-400 p-2"
            >
              {isInstructor && <Link to={`/user/instructor/addneed/${sec?.id}`}>Add a need</Link>}
            </div>
          )}

          {/* Allocation column */}
          <AllocationCard allocations={sec.allocations} className="" />
        </div>
      ))}

      {/* Add section link */}
      {isInstructor && <div className="flex w-full">
        <Link to="/user/instructor/addsection" className="w-full">
          <div className="w-full cursor-pointer p-2 italic text-slate-500 border border-dashed border-slate-400 rounded-lg text-center">
            Add a section
          </div>
        </Link>
      </div>}
    </div>
  );
}
