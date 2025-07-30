import React, { useEffect, useMemo, useState } from 'react';
import type { ApplicationDto } from '../../../../interfaces/application/Application';
import type { AllocatedSection, Allocation, AllocationType } from '../../../../interfaces/allocation/Allocation';
import type { ApplicationStatus } from '../../../../interfaces/enum/ApplicationStatus';
import { fetchSectionIncludeInstructorId } from '../../../../api/section/fetchSectionIncludeInstructorId';
import type Section from '../../../../interfaces/section/Section';
import { getTaskLabel } from '../../../../utility/calendar/gettasklabels/getTaskLabel';
import type { EnrichedAllocatedSection } from '../../../../pages/coordinator/applicationviewpage/ApplicationViewPage';

interface ApplicationCardProps {
  app: ApplicationDto;
  // allocation: Allocation;
  allocations: EnrichedAllocatedSection[];
  isAllocated: boolean;
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ app, isAllocated, allocations, isExpanded, onExpand, onCollapse }) => {
  const sectionGroups = useMemo(() => {
    const groups: Record<number, {
      section?: Section;
      gradingHours: number;
      labPrepHours: number;
      sectionHours: number;
      status?: ApplicationStatus;
    }> = {};

    allocations.forEach(stub => {
      const id = stub.sectionId;
      if (!groups[id]) {
        groups[id] = {
          section: stub.section,
          gradingHours: 0,
          labPrepHours: 0,
          sectionHours: 0,
          status: stub.status as ApplicationStatus,
        };
      }
      switch (stub.task) {
        case 'GRADING':
          groups[id].gradingHours += stub.hours;
          break;
        case 'LAB_PREP':
          groups[id].labPrepHours += stub.hours;
          break;
        case 'LAB':
          groups[id].sectionHours += stub.hours;
          break;
      }
    });

    return Object.entries(groups).map(([sectionId, data]) => ({
      sectionId: Number(sectionId),
      ...data,
    }));
  }, [allocations]);
    
  // const entries = allocations.map((stub) => ({
  //   id: stub.id,
  //   section: stub.section,
  //   taskLabel: getTaskLabel(stub.task),
  //   hours: stub.hours,
  //   status: stub.status as ApplicationStatus,
  // }));

const totalGrading = allocations.reduce(
    (sum, s) => sum + (s.task === 'GRADING' ? s.hours : 0),
    0
  );
  const totalLabPrep = allocations.reduce(
    (sum, s) => sum + (s.task === 'LAB_PREP' ? s.hours : 0),
    0
  );
  const totalSection = allocations.reduce(
    (sum, s) => sum + (s.task === 'LAB' ? s.hours : 0),
    0
  );

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-blue-100 p-4 flex flex-col gap-2 hover:shadow-2xl transition relative ${isExpanded ? 'ring-2 ring-blue-400' : ''} w-full h-full min-h-[240px] sm:w-[98%] md:w-[98%] xl:w-[98%] mx-auto`}>
      {/* Unexpanded summary */}
      <div className="flex items-center gap-2 mb-1">
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
        <span><strong>Preferences:</strong> {app.preferences.join(', ')}</span>
        <span><strong>Remote:</strong> {app.wantRemote ? 'Yes' : 'No'}</span>
        <span><strong>Hours Requested:</strong> {app.wantWorkingHours}</span>
        <span><strong>Submitted:</strong> {new Date(app.timeSubmitted).toLocaleString()}</span>
      </div>
      <div className="flex flex-col gap-0.5 mt-1 text-xs">
        <span><strong>Offer Sent:</strong> {
          isAllocated ? <span className="text-green-600 font-semibold">Yes</span> : <span className="text-red-500 font-semibold">No</span>
        }</span>
        <span><strong>Allocation Confirmed:</strong> {allocations.length >0 && allocations[0].status === 'CONFIRMED'
          ? <span className="text-green-600">Yes</span>
          : <span className="text-red-500">No</span>}</span>
        <span><strong>Allocated Grading Hours:</strong> {totalGrading}h</span>
        <span><strong>Allocated Lab‑Prep Hours:</strong> {totalLabPrep}h</span>
        <span><strong>Allocated Section Hours:</strong> {totalSection}h</span>
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
            {sectionGroups.length>0 ? (
              <ul className="list-none space-y-1">
                {sectionGroups?.map((entry,idx) => {
                  const sec = entry.section;
                  const sectionText = sec
                    ? `${sec.course?.deptCode} ${sec.course?.courseNum} ${sec.section}`
                    : 'Loading section...';
                  const statusText = entry.status
                    ? entry.status.charAt(0) + entry.status.slice(1).toLowerCase()
                    : 'Unknown';
    
                  return (
                    <li key={idx} className="ml-1">
                    <div className="text-xs space-y-0.5">
                      <div><strong>Section:</strong> {sectionText}</div>
                      <div><strong>Semester:</strong> {sec?.semester ? sec.semester : <span className="text-gray-400">N/A</span>}</div>
                      <div><strong>Year:</strong> {sec?.year ? sec.year : <span className="text-gray-400">N/A</span>}</div>
                      <div><strong>Type:</strong> {sec?.type ?sec.type : <span className="text-gray-400">N/A</span>}</div>
                      <div><strong>Grading:</strong> {entry.gradingHours}h</div>
                      <div><strong>Lab‑Prep:</strong> {entry.labPrepHours}h</div>
                      <div><strong>TA:</strong> {entry.sectionHours}h</div>
                      <div><strong>Status:</strong> {statusText}</div>
                      <div><strong>Instructor:</strong> {sec?.instructor && typeof sec.instructor === 'object' && 'firstName' in sec.instructor
                        ? `${sec.instructor.firstName} ${sec.instructor.lastName}`
                        : 'N/A'}</div>
                    </div>
                    <hr className="my-1 border-t border-dotted border-gray-500" />
                  </li>
                  );
                })}
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
