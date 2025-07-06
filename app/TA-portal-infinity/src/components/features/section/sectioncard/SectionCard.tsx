import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type Section from "../../../../interfaces/section/Section";

interface SectionCardProps {
  section: Section;
  className?: string;
  onDelete?: (s: Section) => void;
  isStudentView?: boolean
  big? : boolean
}

export default function SectionCard({
  section,
  className = "",
  onDelete,
  isStudentView = false,
  big = false
}: SectionCardProps) {
  const alloc = section.need?.numHoursCurrentlyAllocated;
  const req = section.need?.requiredGradingHours;
  const allocTxt = typeof alloc === "number" ? alloc : "-";
  const reqTxt = typeof req === "number" ? req : "-";
  const hoursBadge = `(${allocTxt}/${reqTxt})`;

  return (
    <div
      data-testid={`section-card-${section.sectionDetails?.id}`}
      className={`${className} relative w-full overflow-hidden rounded-lg border border-slate-200 p-2 bg-slate-50`}
      className={`${className} relative w-full overflow-hidden rounded-lg border border-slate-200 p-2 bg-slate-50`}
    >
      {onDelete && (
        <div title="Delete section from list">
          <Trash2
            size={16}
            className="absolute top-2 right-2 cursor-pointer hover:text-red-600"

            onClick={() => onDelete(section)}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center">
        <div className="truncate max-w-full">
          {
            section.sectionDetails?.sectionId ? <Link
            to={`/user/sectionprofile/${section.sectionDetails?.sectionId}`}
            data-testid={`section-link-${section.sectionDetails?.id}`}
            title="Go to course profile page"
            className={`${big?"text-md":"text-sm"} font-medium whitespace-nowrap 2xl:text-base hover:text-blue-600`}
          >
            {section.sectionDetails?.deptCode}{" "}
            {section.sectionDetails?.courseNum}{" "}
            {section.sectionDetails?.section} –{" "}
            {section.sectionDetails?.name}
          </Link>: <span className={`${big?"text-md":"text-sm"} font-medium whitespace-nowrap 2xl:text-base`}>
            {section.sectionDetails?.deptCode}{" "}
            {section.sectionDetails?.courseNum}{" "}
            {section.sectionDetails?.section} –{" "}
            {section.sectionDetails?.name}
          </span>
          }
          
        </div>
        <p className={`${big?"text-sm":"text-xs"} ml-1 whitespace-nowrap 2xl:text-sm text-slate-600`}>
          {section.sectionDetails?.type} | {section.sectionDetails?.year} | {section.sectionDetails?.semester}
        </p>
      </div>


      <div className="flex flex-row gap-1 flex-wrap mt-1 items-center">
        <div className="flex items-center">
          {!isStudentView && <><div className="flex gap-x-1 flex-wrap text-sm 2xl:text-base text-slate-800">
            {section.sectionSchedule?.map((sch, index) => (
              <span key={index}>
                {sch.day}-{sch.startTime}-{sch.endTime}
              </span>
            ))}

          </div>
            <span className="ml-2 text-xs 2xl:text-sm whitespace-nowrap text-slate-600">
              {hoursBadge} hrs alloc.
            </span>
          </>
          }
        </div>
        {section.instructor && (
          <div className="truncate max-w-full">
            <Link
              to="/"
              data-testid={`instructor-link-${section.instructor.id}`}
              className="ml-1 whitespace-nowrap text-xs 2xl:text-sm text-slate-600 hover:text-blue-600"
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
