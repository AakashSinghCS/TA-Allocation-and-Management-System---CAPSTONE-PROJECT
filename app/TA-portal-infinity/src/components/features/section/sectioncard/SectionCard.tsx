import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type Section from "../../../../interfaces/section/Section";

interface SectionCardProps {
  section: Section;
  className?: string;
  onDelete?: (s: Section) => void;
  isStudentView?: boolean
  big? : boolean
  authenticated? : boolean
}

export default function SectionCard({
  section,
  className = "",
  onDelete,
  isStudentView = false,
  big = false,
  authenticated = false
}: SectionCardProps) {
  const alloc = section.need?.numHoursCurrentlyAllocated;
  const req = section.need?.requiredGradingHours;
  const allocTxt = typeof alloc === "number" ? alloc : "-";
  const reqTxt = typeof req === "number" ? req : "-";
  const hoursBadge = `(${allocTxt}/${reqTxt})`;

  return (
    <div
      data-testid={`section-card-${section?.id}`}
      className={`${className} relative w-full overflow-hidden rounded-lg border border-gray-200 
        bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#0089b2] group p-3`}
    >
      {onDelete && authenticated &&(
        <div title="Delete section from list" className="absolute top-3 right-3 z-10">
          <button
            onClick={() => onDelete(section)}
            className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center 
              border border-red-200 hover:border-red-300 transition-all duration-200 opacity-0 
              group-hover:opacity-100"
          >
            <Trash2
              size={14}
              className="text-red-500 hover:text-red-600 transition-colors"
            />
          </button>
        </div>
      )}

      <div className="space-y-2">
        {/* Course Title - Compact */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {section?.id ? (
              <Link
                to={`/user/sectionprofile/${section?.id}`}
                data-testid={`section-link-${section?.id}`}
                title="Go to course profile page"
                className={`${big ? "text-base" : "text-sm"} font-semibold text-[#040941] hover:text-[#0089b2] 
                  transition-colors duration-200 block truncate`}
              >
                {section.course?.deptCode} {section.course?.courseNum} {section?.section}
              </Link>
            ) : (
              <span className={`${big ? "text-base" : "text-sm"} font-semibold text-[#040941] block truncate`}>
                {section.course?.deptCode} {section.course?.courseNum} {section?.section}
              </span>
            )}
            <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
              {section.course?.name}
            </p>
          </div>
        </div>

        {/* Compact Details Row */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {section.type && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#040941] text-white font-medium">
              {section.type}
            </span>
          )}
          {section.year && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
              {section.year}
            </span>
          )}
          {section.semester && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#0089b2] text-white font-medium">
              {section.semester}
            </span>
          )}
          {(alloc || req) && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-50 text-gray-700 font-medium ml-auto">
              {hoursBadge} hrs
            </span>
          )}
        </div>

        {/* Schedule - Compact */}
        {!isStudentView && section.sectionSchedule && section.sectionSchedule.length > 0 && (
          <div className="text-xs text-gray-600">
            <div className="flex flex-wrap gap-1">
              {section.sectionSchedule.slice(0, 2).map((sch, index) => (
                <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-xs font-mono">
                  {sch.day} {sch.startTime}-{sch.endTime}
                </span>
              ))}
              {section.sectionSchedule.length > 2 && (
                <span className="text-gray-400 text-xs">+{section.sectionSchedule.length - 2} more</span>
              )}
            </div>
          </div>
        )}

        {/* Instructor - Compact */}
        {section.instructor && (
          <div className="flex items-center text-xs text-gray-600 border-t border-gray-100 pt-1.5">
            <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <Link
              to="/"
              data-testid={`instructor-link-${section.instructor.id}`}
              className="text-gray-600 hover:text-[#0089b2] transition-colors duration-200 font-medium truncate"
              title="Go to instructor's profile page"
            >
              {section.instructor.firstName} {section.instructor.lastName}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
