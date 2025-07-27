import { Link }from 'react-router-dom'
import type { AllocatedSection, Allocation } from "../../../interfaces/allocation/Allocation";
import { FaGraduationCap } from "react-icons/fa";
import { useEffect, useState } from 'react';
import { fetchAllocationById } from '../../../api/allocation/fetchAllocationById';
interface AllocationCardProps {
  allocatedSections?: AllocatedSection[];   // one section can have 0-n allocations
  className?: string;
}

export default function AllocationCard({
  allocatedSections = [],
  className = "",
}: AllocationCardProps) {
  const [allocations, setAllocations] = useState<Allocation[]>([]);

  if (!allocatedSections.length)
    return (
      <div data-testid="allocation-card" className={`${className} w-full overflow-hidden rounded-lg border border-gray-200 
        bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#0089b2] 
        flex items-center justify-center p-4 text-center min-h-[120px]`}>
        <div className="space-y-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
            <svg className="hidden" />
            <span className="text-gray-400 text-xl flex items-center justify-center">
              <FaGraduationCap />
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-600">No Confirmed TAs</p>
          <p className="text-xs text-gray-500">Students will appear here once confirmed</p>
        </div>
      </div>
    );

useEffect(() => {
    if (!allocatedSections.length) {
      setAllocations([]);
      return;
    }

    const uniqueAllocationIds = Array.from(
      new Set(allocatedSections.map(as => as.allocationId))
    );

    (async () => {
      try {
        const fetchedAllocs = await Promise.all(
          uniqueAllocationIds.map(id => fetchAllocationById(id))
        );
        setAllocations(fetchedAllocs);
      } catch (err) {
        console.error("AllocationCard: failed to load allocations", err);
      }
    })();
  }, [allocatedSections]);
  
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
            <div className="flex flex-col gap-1 items-center">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#0089b2] text-white 
                text-xs font-medium">
                TA Hours: {allocation.sectionHours || 0}h
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#0089b2] text-white 
                text-xs font-medium">
                Grading Hours: {allocation.gradingHours || 0}h
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#0089b2] text-white 
                text-xs font-medium">
                Lab Prep Hours: {allocation.labPrepHours || 0}h
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
