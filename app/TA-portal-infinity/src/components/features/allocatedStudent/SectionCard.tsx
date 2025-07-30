import { Link } from "react-router-dom";
import type Section from "../../../interfaces/section/Section";
import StudentAllocationItem from "./StudentAllocationItem";

interface SectionCardProps {
  section: Section;
}

export default function SectionCard({ section }: SectionCardProps) {
  const seen = new Set<number>();
  const uniqueAllocs = section.allocations?.filter(a => {
    if (!a.id) return false;
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
  const totalHours = uniqueAllocs?.reduce((sum, alloc) => {
    const forThisSection = alloc.allocatedSections
      ?.filter(s => s.sectionId === section.id);

    if (!forThisSection) return 0;
    const sectionSum = forThisSection
      .reduce((hSum, s) => hSum + s.hours, 0);

    return sum + sectionSum;
  }, 0);

  return (
    <div
      key={section?.id}
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Combined Section and Allocation Info */}
      <div className="p-6">
        {/* Section Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Link
                to={`/user/sectionprofile/${section?.id}`}
                className="text-lg font-semibold text-[#040941] hover:text-[#0089b2] transition-colors"
              >
                {section.course?.deptCode} {section.course?.courseNum} {section?.section}
              </Link>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-600">{section.course?.name}</span>
            </div>

            {/* Section Details */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center px-2 py-1 rounded bg-[#040941] text-white text-xs font-medium">
                {section.type}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                {section.year}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-[#0089b2] text-white text-xs font-medium">
                {section.semester}
              </span>
              {section.need && (
                <span className="inline-flex items-center px-2 py-1 rounded bg-gray-50 text-gray-700 text-xs font-medium">
                  {section.need.requiredGradingHours} req. grading hrs
                </span>
              )}
            </div>

            {/* Instructor */}
            {section.instructor && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span>{section.instructor.firstName} {section.instructor.lastName}</span>
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {uniqueAllocs?.length || 0} Confirmed TA{(section.allocations?.length || 0) !== 1 ? 's' : ''}
            </div>
            <div className="text-xs text-gray-500">
              {totalHours} Total Hours
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Confirmed TAs</h4>
          <div className="space-y-2">
            {section.allocations && section.allocations.length > 0 ? (
              uniqueAllocs?.map((allocation) => (
                <StudentAllocationItem key={allocation.id} allocation={allocation} sectionId={section.id ?? -1} />
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No students allocated to this section
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
