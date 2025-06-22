import AllocationCard from "../../../../components/features/allocation/AllocationCard";
import NeedCard       from "../../../../components/features/need/NeedCard";
import SectionCard    from "../../../../components/features/section/sectioncard/SectionCard";
import { GenericAPIContainer } from "../../../../utility/genericapicontainer/GenericAPIContainer";
import { fetchAllInstructorTeachesSection } from "../../../../api/instructor/fetchAllInstructorTeachesSection";
import type Section from "../../../../interfaces/section/Section";
import { Link } from "react-router-dom";

export default function NeedViewer({ instructorId, className = "",}: { instructorId: number; className?: string;}) {
  
  return (
    <GenericAPIContainer<Section[]>
      fetchFunction={() => fetchAllInstructorTeachesSection(instructorId)}
      render={(sections) => (
        <div className={"grid gap-3 " + className}>
          <div className="hidden lg:grid lg:grid-cols-3 font-medium text-sm text-slate-600">
            <span>Sections Teaching</span>
            <span>Needs of Course</span>
            <span>Students Allocated</span>
          </div>

          {sections.map((sec) => (
            <div
              key={sec.sectionDetails?.id}
              className="grid gap-2 sm:grid-cols-1 lg:grid-cols-3"
            >
              <SectionCard
                section={sec}
                className=""
              />
              <NeedCard
                need={sec.need}
                className=""
              />
              <AllocationCard
                allocations={sec.allocations}
                className=""
              />
            </div>
          ))}
          <Link to="/">
            <div className="cursor-pointer p-2 italic text-slate-400 border border-dashed border-slate-200 rounded-lg">
              Add a section
            </div>
          </Link>
        </div>
      )}
    />
  );
}
