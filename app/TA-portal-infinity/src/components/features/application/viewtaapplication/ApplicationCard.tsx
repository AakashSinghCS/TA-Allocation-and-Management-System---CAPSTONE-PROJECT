import React from 'react';
import type { ApplicationDto } from '../../../../interfaces/application/Application';
import type { Allocation } from '../../../../interfaces/allocation/Allocation';

interface ApplicationCardProps {
  app: ApplicationDto;
  allocations: Allocation[];
  isAllocated: boolean;
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ app, allocations, isAllocated, isExpanded, onExpand, onCollapse }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-blue-100 p-4 flex flex-col gap-2 hover:shadow-2xl transition relative ${isExpanded ? 'ring-2 ring-blue-400' : ''} w-full h-full min-h-[240px] sm:w-[98%] md:w-[98%] xl:w-[98%] mx-auto`}>
      {/* Unexpanded summary */}
      <div className="flex items-center gap-2 mb-1">
        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-[#040941]">
          {app.student.firstName[0]}{app.student.lastName[0]}
        </div>
        <div>
          <a
            href={`http://localhost:5173/user/profile/${app.student.id}`}
            className="font-semibold text-base text-[#040941] leading-tight hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {app.student.firstName} {app.student.lastName}
          </a>
          <p className="text-xs text-gray-500 leading-tight">ID: {app.student.studentNum}</p>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 text-xs">
        <span><strong>Year:</strong> {app.year} &nbsp; <strong>Semester:</strong> {app.semester}</span>
        <span><strong>Preferences:</strong> {app.preferences.join(', ')}</span>
        <span><strong>Remote:</strong> {app.wantRemote ? 'Yes' : 'No'}</span>
        <span><strong>Hours Requested:</strong> {app.wantWorkingHours}</span>
        <span><strong>Submitted:</strong> {new Date(app.timeSubmitted).toLocaleString()}</span>
      </div>
      <div className="flex flex-col gap-0.5 mt-1 text-xs">
        <span><strong>Offer Sent:</strong> {
          isAllocated ? <span className="text-green-600 font-semibold">Yes</span> : <span className="text-red-500 font-semibold">No</span>
        }</span>
        <span><strong>Allocation Confirmed:</strong> {
          allocations.some(a => a.status === 'CONFIRMED') ? <span className="text-green-600 font-semibold">Yes</span> : <span className="text-red-500 font-semibold">No</span>
        }</span>
        <span><strong>Allocated Hours:</strong> {
          allocations.reduce((total, alloc) => total + (alloc.numberOfHours ?? 0), 0)
        }</span>
      </div>
      {!isExpanded ? (
        <button
          className="mt-2 mb-2 px-3 py-1.5 bg-[#040941] text-white rounded-lg font-semibold transition text-sm hover:opacity-80"
          onClick={onExpand}
        >
          View Details
        </button>
      ) : (
        <>
          {/* Application Info */}
          <hr className="my-1" />
          <div className="mb-1">
            <h4 className="font-semibold text-[#040941] mb-0.5 text-sm">Application Info</h4>
            <div className="text-xs space-y-0.5">
              <div><strong>Year:</strong> {app.year} &nbsp; <strong>Semester:</strong> {app.semester}</div>
              <div><strong>Preferences:</strong> {app.preferences.join(', ')}</div>
              <div><strong>Remote Preference:</strong> {app.wantRemote ? 'Yes' : 'No'}</div>
              <div><strong>Hours Requested:</strong> {app.wantWorkingHours}</div>
              <div><strong>Submitted:</strong> {new Date(app.timeSubmitted).toLocaleString()}</div>
            </div>
          </div>
          <hr className="my-1" />
          {/* Applicant Info */}
          <div className="mb-1">
            <h4 className="font-semibold text-[#040941] mb-0.5 text-sm">Applicant Info</h4>
            <div className="text-xs space-y-0.5">
              <div><strong>Name:</strong> <a
                href={`http://localhost:5173/user/profile/${app.student.id}`}
                className="text-blue-900 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {app.student.firstName} {app.student.lastName}
              </a></div>
              <div><strong>Student #:</strong> {app.student.studentNum}</div>
              <div><strong>Program:</strong> {app.student.program || 'N/A'}</div>
              <div><strong>Enrollment Year:</strong> {app.student.enrollmentYear || 'N/A'}</div>
              <div><strong>School Year:</strong> {app.student.schoolYear || 'N/A'}</div>
            </div>
          </div>
          <hr className="my-1" />
          {/* Allocation Info */}
          <div>
            <h4 className="font-semibold text-[#040941] mb-0.5 text-sm">Allocation Info</h4>
            {allocations.length > 0 ? (
              <ul className="list-none space-y-1">
                {allocations
                  .filter((alloc, idx, arr) => {
                    // Remove duplicates by section id if available
                    if (alloc.section && alloc.section.sectionId) {
                      return arr.findIndex(a => a.section?.sectionId === alloc.section.sectionId) === idx;
                    }
                    // If no sectionId, keep all
                    return true;
                  })
                  .map((alloc, idx) => (
                    <li key={idx} className="ml-1">
                      <div className="text-xs space-y-0.5">
                        <div><strong>Section:</strong> {alloc.section?.course?.deptCode ?? 'N/A'} {alloc.section?.course?.courseNum ?? ''}</div>
                        <div><strong>Semester:</strong> {alloc.section?.semester ?? 'N/A'}</div>
                        <div><strong>Year:</strong> {alloc.section?.year ?? 'N/A'}</div>
                        <div><strong>Type:</strong> {alloc.section?.type ?? 'N/A'}</div>
                        <div><strong>Allocated Hours:</strong> {alloc.numberOfHours ?? 'N/A'}</div>
                        <div><strong>Status:</strong> {alloc.status ? alloc.status.charAt(0) + alloc.status.slice(1).toLowerCase() : 'N/A'}</div>
                        <div><strong>Instructor:</strong> {
                          alloc.section?.instructor && typeof alloc.section.instructor === 'object' && alloc.section.instructor.firstName && alloc.section.instructor.lastName
                            ? `${alloc.section.instructor.firstName} ${alloc.section.instructor.lastName}`
                            : (typeof alloc.section?.instructor === 'string' ? alloc.section.instructor : 'N/A')
                        }</div>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <div className="text-gray-500 text-xs">No allocations for this application.</div>
            )}
          </div>
          <button
            className="mt-2 px-3 py-1.5 bg-gray-300 text-[#040941] rounded-lg font-semibold hover:bg-gray-300 transition text-sm"
            onClick={onCollapse}
          >
            Hide Details
          </button>
          <a
            href="/user/coordinator/allocation"
            className="mt-1 underline text-[#040941] hover:text-blue-900 text-center block text-xs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Go to Allocation Page
          </a>
        </>
      )}
    </div>
  );
};

export default ApplicationCard;
