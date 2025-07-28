import { Link } from "react-router-dom";
import type { AllocatedSection, Allocation } from "../../../interfaces/allocation/Allocation";

interface StudentAllocationItemProps {
  allocation: Allocation;
  sectionId: number;
}

export default function StudentAllocationItem({ allocation, sectionId }: StudentAllocationItemProps) {
  console.log(allocation);
  const stubs: AllocatedSection[] =
    allocation.allocatedSections?.filter((s) => s.sectionId === sectionId) || [];

  // if you want to show them grouped by task:
  const hoursByTask = stubs.reduce<Record<string, number>>((acc, s) => {
    acc[s.task] = (acc[s.task] || 0) + s.hours;
    return acc;
  }, {});

  return (
    <div 
      key={allocation.id} 
      className="flex items-center justify-between p-3 rounded-md border border-gray-100 
        hover:border-[#0089b2] hover:bg-blue-50 transition-all duration-200 group"
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-[#040941] rounded-full 
          flex items-center justify-center text-white font-bold text-xs">
          {allocation.student?.firstName?.charAt(0)}{allocation.student?.lastName?.charAt(0)}
        </div>
        <div>
          {allocation.student?.id ? (
            <Link 
              to={`/user/profile/${allocation.student.id}`} 
              className="font-medium text-gray-900 hover:text-[#040941] transition-colors duration-200" 
              title="Go to student's profile page"
            >
              {allocation.student?.firstName} {allocation.student?.lastName}
            </Link>
          ) : (
            <span className="font-medium text-gray-900">
              {allocation.student?.firstName || ''} {allocation.student?.lastName || ''}
            </span>
          )}
          {allocation.student?.email && (
            <div className="text-xs text-gray-500">{allocation.student.email}</div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
         {stubs.map((s) => (
          <span
            key={s.id}
            className="inline-flex items-center px-2 py-1 rounded bg-[#0089b2] text-white text-xs font-medium"
          >
            {s.hours}{" "}
            {s.task === "GRADING"
              ? "Grading Hours"
              : s.task === "LAB_PREP"
              ? "Lab Prep Hours"
              : "TA Hours"}
          </span>
        ))}
      </div>
    </div>
  );
}
