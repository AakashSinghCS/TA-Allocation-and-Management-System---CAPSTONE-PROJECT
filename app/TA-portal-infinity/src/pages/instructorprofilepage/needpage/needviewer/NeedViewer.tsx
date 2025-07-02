import AllocationCard from "../../../../components/features/allocation/AllocationCard";
import NeedCard from "../../../../components/features/need/needcard/NeedCard";
import SectionCard from "../../../../components/features/section/sectioncard/SectionCard";
import type Section from "../../../../interfaces/section/Section";
import { Link } from "react-router-dom";
import type { Need } from "../../../../interfaces/need/Need";
import { fetchUpdateNeed } from "../../../../api/need/fetchUpdateNeed";
import { useEffect, useState } from "react";
import { fetchDeleteNeed } from "../../../../api/need/fetchDeleteNeed";
import { fetchUnassignInstructor } from "../../../../api/section/instructor/fetchUnassignInstructor";

interface NeedViewerProps {
  instructorId: number;
  className?: string;
  initial: Section[] | null;
}

export default function NeedViewer({ instructorId, className = "", initial }: NeedViewerProps) {
  const [sections, setSections] = useState<Section[]>(initial ?? []);

  useEffect(() => {
    setSections(initial ?? []);
  }, [initial]);

  const onDeleteNeed = async (need: Need) => {
    const confirm = window.confirm(
      "Do you really wish to delete this?"
    );
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
      const ok = await fetchUnassignInstructor(s.sectionDetails?.sectionId ?? -1, instructorId);
      if (ok) {
        setSections((prev) =>
          prev.filter((sec) => sec.sectionDetails?.sectionId !== s.sectionDetails?.sectionId)
        );
      }
    }
  }

  return (
    <div className={"grid gap-3 " + className}>
      {/* Header row for large screens */}
      <div className="hidden lg:grid lg:grid-cols-3 font-medium text-lg text-slate-600">
        <span>Sections Teaching</span>
        <span>Needs of Course</span>
        <span>Students Allocated</span>
      </div>

      {/* Section rows */}
      {sections.map((sec) => (
        <div key={sec.sectionDetails?.id} className="grid gap-2 sm:grid-cols-1 lg:grid-cols-3">
          <SectionCard section={sec} className="" onDelete={onDeleteSection} />

          {/* Need column */}
          {sec.need ? (
            <NeedCard
              need={sec.need}
              className=""
              onDelete={onDeleteNeed}
              onUpdate={onUpdateNeed}
            />
          ) : (
            <div
              className="w-full overflow-hidden rounded-lg text-sm italic text-slate-500 border border-dashed border-slate-400 p-2"
            >
              <Link to={`/user/instructor/addneed/${sec.sectionDetails?.id}`}>Add a need</Link>
            </div>
          )}

          {/* Allocation column */}
          <AllocationCard allocations={sec.allocations} className="" />
        </div>
      ))}

      {/* Add section link */}
      <div className="flex w-full">
        <Link to="/user/instructor/addsection" className="w-full">
          <div className="w-full cursor-pointer p-2 italic text-slate-500 border border-dashed border-slate-400 rounded-lg text-center">
            Add a section
          </div>
        </Link>
      </div>
    </div>
  );
}
