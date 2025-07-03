import React from 'react';
import type { ApplicationDto } from '../../interfaces/application/Application';
import type { Allocation } from '../../interfaces/allocation/Allocation';

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
    <div className={`bg-white rounded-2xl shadow-lg border border-blue-100 p-8 flex flex-col gap-6 hover:shadow-2xl transition relative ${isExpanded ? 'ring-2 ring-blue-400' : ''} w-full h-full min-h-[380px] sm:w-[98%] md:w-[98%] xl:w-[98%] mx-auto`}>
      {/* Unexpanded summary */}
      <div className="flex items-center gap-2 mb-1">
        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-[#040941]">
          {app.student.firstName[0]}{app.student.lastName[0]}
        </div>
        <div>
          <h2 className="font-semibold text-base text-[#040941] leading-tight">{app.student.firstName} {app.student.lastName}</h2>
          <p className="text-xs text-gray-500 leading-tight">ID: {app.student.studentNum}</p>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 text-xs">
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
          allocations.some(a => a.isConfirmed) ? <span className="text-green-600 font-semibold">Yes</span> : <span className="text-red-500 font-semibold">No</span>
        }</span>
        <span><strong>Allocated Hours:</strong> {
          allocations.reduce((total, alloc) => total + (alloc.numberOfHours ?? 0), 0)
        }</span>
      </div>
      {!isExpanded ? (
        <button
          className="mt-2 px-3 py-1.5 bg-[#040941] text-white rounded-lg font-semibold transition text-sm hover:opacity-80"
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
              <div><strong>Name:</strong> {app.student.firstName} {app.student.lastName}</div>
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
                {allocations.map((alloc, idx) => (
                  <li key={idx} className="ml-1">
                    <div className="text-xs space-y-0.5">
                      <div><strong>Section:</strong> {alloc.section?.sectionDetails?.deptCode} {alloc.section?.sectionDetails?.courseNum}</div>
                      <div><strong>Semester:</strong> {alloc.section?.sectionDetails?.semester ? alloc.section.sectionDetails.semester : <span className="text-gray-400">N/A</span>}</div>
                      <div><strong>Year:</strong> {alloc.section?.sectionDetails?.year ? alloc.section.sectionDetails.year : <span className="text-gray-400">N/A</span>}</div>
                      <div><strong>Type:</strong> {alloc.section?.sectionDetails?.type ? alloc.section.sectionDetails.type : <span className="text-gray-400">N/A</span>}</div>
                      <div><strong>Allocated Hours:</strong> {alloc.numberOfHours}</div>
                      <div><strong>Confirmed:</strong> {alloc.isConfirmed ? 'Yes' : 'No'}</div>
                      <div><strong>Instructor:</strong> {alloc.section?.instructor && typeof alloc.section.instructor === 'object' && 'firstName' in alloc.section.instructor
                        ? `${alloc.section.instructor.firstName} ${alloc.section.instructor.lastName}`
                        : 'N/A'}</div>
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
            href="/coordinator/allocations"
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
