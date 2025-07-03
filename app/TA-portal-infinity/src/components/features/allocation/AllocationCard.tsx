import { Link }from 'react-router-dom'
import type { Allocation } from "../../../interfaces/allocation/Allocation";

interface AllocationCardProps {
  allocations?: Allocation[];   // one section can have 0-n allocations
  className?: string;
}

export default function AllocationCard({
  allocations = [],
  className = "",
}: AllocationCardProps) {
  if (!allocations.length)
    return (
      <div className="p-2 italic text-slate-400 border border-dashed border-slate-200 rounded-lg">
        No students allocated
      </div>
    );

  return (
    <div className={className + " w-full overflow-hidden rounded-lg text-sm border border-emerald-300 bg-emerald-50 p-2"}
      data-testid="allocation-card">
      <ul className="space-y-1">
        {allocations.map((a) => (
          <li key={a.id} className="flex justify-between transition-colors">
            <Link  to={`/user/taprofile/${a.student?.id}`} className="truncate hover:text-blue-600" title="Go to student's profile page">
              {a.student?.firstName} {a.student?.lastName}
            </Link>
            <span className="text-xs text-slate-600">
              {a.numberOfHours ?? "-"} hrs
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
