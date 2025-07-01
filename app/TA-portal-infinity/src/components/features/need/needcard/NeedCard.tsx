import type { Need } from "../../../../interfaces/need/Need";
import type { Course } from "../../../../interfaces/course/Course";
import { Link } from "react-router-dom";

interface NeedCardProps {
  need?: Need;
  className?: string;
}

export default function NeedCard({ need, className = "" }: NeedCardProps) {
  if (!need)
    return (
      <div className="p-2 italic text-slate-400 border border-dashed border-slate-200 rounded-lg">
        No data
      </div>
    );

  const alloc = need.numOfHoursCurrentlyAllocated ?? "-";
  const req = need.requiredGradingHours ?? "-";
  const overBooked = (need.numOfHoursCurrentlyAllocated 
    && need.requiredGradingHours 
    && need.numOfHoursCurrentlyAllocated/need.requiredGradingHours > 1) ? true : false;
  const perfectlyBooked = (need.numOfHoursCurrentlyAllocated 
    && need.requiredGradingHours 
    && need.numOfHoursCurrentlyAllocated/need.requiredGradingHours === 1) ? "text-green-600" : "";

  return (
    <div className={className + " w-full overflow-hidden rounded-lg text-sm border border-amber-300 bg-amber-50 p-2"} data-testid="need-card" >

      <p className="mb-1">
        <span className="text-slate-600">
          Additional Comments: 
        </span>
        <span className="font-medium"> 
          {need.description}
        </span>
      </p>
      <div className="flex">
        <p className="text-slate-600 mb-1">Allocated hours: &nbsp;</p>
        <p className={"font-medium mb-1 "+perfectlyBooked}> {alloc}</p>
        <span>&nbsp;/&nbsp;</span>
        <p className="text-slate-600 mb-1">Required hours: &nbsp;</p>
        <p className={"font-medium mb-1 "+perfectlyBooked}> {req}</p>
        {overBooked && 
        <p className="text-red-600 mb-1">&nbsp; This section is overbooked!</p>}
      </div>
      
      <div className="flex">
        <p className="text-slate-600 mb-1">Course Prerequisites: &nbsp;</p>
        {need.courseNeeds?.length ? (
          <div className="flex flex-wrap text-slate-800">
            {need.courseNeeds.map((course, index) => (
              <span key={course.id}>
                <Link
                  to={`/course/${course.id}`}
                  className="hover:text-blue-600"
                >
                  {course.deptCode} {course.courseNum}
                </Link>
                {need.courseNeeds && index < need.courseNeeds.length - 1 && <span>,&nbsp;</span>}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">None</p>
        )}
      </div>
    </div>
  );
}
