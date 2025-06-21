import { Link } from "react-router-dom";
import type Section from "../../../../interfaces/section/Section";

export default function SectionCard({ section, className = "" }: { section: Section; className?: string }) {
  const alloc = section?.need?.numOfHoursCurrentlyAllocated;
  const req = section?.need?.requiredGradingHours;
  const allocTxt = typeof alloc === "number" ? alloc : "-";
  const reqTxt = typeof req === "number" ? req : "-";
  const hoursBadge = `(${allocTxt}/${reqTxt})`;

  return (
    <div
      data-testid={`section-card-${section.sectionDetails?.id}`}
      className={`${className} w-full overflow-hidden rounded-lg text-sm border border-slate-200 p-2 bg-slate-50`}
    >
      <div className="flex flex-wrap items-center">
        <div className="truncate max-w-full">
          <Link
            to="/"
            data-testid={`section-link-${section.sectionDetails?.id}`}
            title="Go to course profile page"
            className="font-medium whitespace-nowrap hover:text-blue-600"
          >
            {section.sectionDetails?.deptCode} {section.sectionDetails?.courseNum} {section.sectionDetails?.section} - {section.sectionDetails?.name}
          </Link>
        </div>
        <p className="ml-1 whitespace-nowrap text-xs text-slate-600 ">| {section.sectionDetails?.type} | {section.sectionDetails?.term}</p>
      </div>
      <div className="flex flex-row gap-1 flex-wrap mt-1 items-center">
        <div className="flex items-center">
          <div className="flex gap-x-1 flex-wrap text-slate-800">
            {section.sectionSchedule?.map((sch, index) => (
              <span key={index}>
                {sch.day}-{sch.startTime}-{sch.endTime}
              </span>
            ))}
          </div>
          <span className="ml-2 text-xs whitespace-nowrap text-slate-600">{hoursBadge} hrs alloc.</span>
        </div>
        {section.instructor && (
          <div className="truncate max-w-full">
            <Link
              to="/"
              data-testid={`instructor-link-${section.instructor.id}`}
              className="ml-1 whitespace-nowrap text-xs text-slate-600 hover:text-blue-600"
              title="Go to instructor's profile page"
            >
              | {section.instructor.firstName} {section.instructor.lastName}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
