import { Link }from 'react-router-dom'
import type { Allocation } from "../../../interfaces/allocation/Allocation";
import { FaGraduationCap } from "react-icons/fa";
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
      <div className={`${className} w-full overflow-hidden rounded-lg border border-gray-200 
        bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#0089b2] 
        flex items-center justify-center p-4 text-center min-h-[120px]`}>
        <div className="space-y-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
            <svg className="hidden" />
            <span className="text-gray-400 text-xl flex items-center justify-center">
              <FaGraduationCap />
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-600">No TAs Assigned</p>
          <p className="text-xs text-gray-500">Students will appear here once allocated</p>
        </div>
      </div>
    );

  return (
    <div className={`${className} w-full overflow-hidden rounded-lg border border-gray-200 
      bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#0089b2] p-3`}
      data-testid="allocation-card">
      <ul className="space-y-2">
        {allocations.map((allocation) => (
          <li key={allocation.id} 
            className="flex items-center justify-between p-2 rounded-md border border-gray-100 
              hover:border-[#0089b2] hover:bg-blue-50 transition-all duration-200 group">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-[#040941] rounded-full 
                flex items-center justify-center text-white font-bold text-xs">
                {allocation.student?.firstName?.charAt(0)}{allocation.student?.lastName?.charAt(0)}
              </div>
              <Link 
                to={`/user/profile/${allocation.student?.id}`} 
                className="font-medium text-gray-900 hover:text-[#040941] transition-colors duration-200 text-sm" 
                title="Go to student's profile page"
              >
                {allocation.student?.firstName} {allocation.student?.lastName}
              </Link>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#0089b2] text-white 
                text-xs font-medium">
                {allocation.numberOfHours || 0}h
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
