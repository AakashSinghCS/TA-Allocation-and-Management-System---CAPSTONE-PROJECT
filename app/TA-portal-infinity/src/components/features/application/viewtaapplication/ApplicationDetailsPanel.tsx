import React from 'react';
import type { ApplicationDto } from '../../../../interfaces/application/Application';
import type { AllocatedSection, Allocation } from '../../../../interfaces/allocation/Allocation';

interface ApplicationDetailsPanelProps {
  selectedApp: ApplicationDto;
  allocations: Allocation[];
  allocationHistory: Allocation[];
  onClose: () => void;
}

const ApplicationDetailsPanel: React.FC<ApplicationDetailsPanelProps> = ({ selectedApp, allocations, allocationHistory, onClose }) => {
  
    if (!selectedApp) return null;

  const hasOffer = allocationHistory.some(
    (a) => a.application?.applicationId === selectedApp.applicationId
  );

  return (
    <div className="col-span-1 bg-white rounded-2xl shadow-lg border border-blue-100 p-6 absolute right-0 top-0 w-full md:w-[350px] xl:w-[400px] z-10 max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Application Details</h2>
      <div className="space-y-2 text-sm">
        <p><strong>Student Name:</strong> {selectedApp.student.firstName} {selectedApp.student.lastName}</p>
        <p><strong>Student ID:</strong> {selectedApp.student.studentNum}</p>
        <p><strong>Program:</strong> {selectedApp.student.program || 'N/A'}</p>
        <p><strong>Enrollment Year:</strong> {selectedApp.student.enrollmentYear || 'N/A'}</p>
        <p><strong>School Year:</strong> {selectedApp.student.schoolYear || 'N/A'}</p>
        <p><strong>Preferences:</strong> {selectedApp.preferences.join(', ')}</p>
        <p><strong>Remote Preference:</strong> {selectedApp.wantRemote ? 'Yes' : 'No'}</p>
        <p><strong>Hours Requested:</strong> {selectedApp.wantWorkingHours}</p>
        <p><strong>Submitted:</strong> {new Date(selectedApp.timeSubmitted).toLocaleString()}</p>
        <p><strong>Status:</strong> {
          allocationHistory.some(a => a.application?.applicationId === selectedApp.applicationId)
            ? <span className="text-green-600 font-semibold">Offer Sent</span>
            : <span className="text-gray-600">No Offer</span>
        }</p>
        {/* Allocations Section */}
        {allocations.length > 0 ? (
          <div className="mt-4">
            <h3 className="font-semibold">Allocations</h3>
            <ul className="list-disc list-inside space-y-1">
              {allocations.map((alloc) =>
                alloc.allocatedSections?.map((stub: AllocatedSection) => {
                  const sec = alloc.sections?.find(
                    (s) => s.id === stub.sectionId
                  );
                  return (
                    <li key={`${alloc.id}-${stub.id}`} className="ml-2">
                      <div>
                        <strong>Section:</strong>{' '}
                        {sec ? (
                          `${sec.course?.deptCode} ${sec.course?.courseNum} - ${sec.type} (${sec.semester} ${sec.year})`
                        ) : (
                          'Loading section...'
                        )}
                      </div>
                      <div>
                        <strong>Allocated Hours:</strong> {stub.hours}
                      </div>
                      <div>
                        <strong>Status:</strong>{' '}
                        {alloc.status
                          ? alloc.status.charAt(0) + alloc.status.slice(1).toLowerCase()
                          : 'N/A'}
                      </div>
                      <div>
                        <strong>Instructor:</strong>{' '}
                        {sec && sec.instructor
                          ? `${sec.instructor.firstName} ${sec.instructor.lastName}`
                          : 'N/A'}
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        ) : (
          <div className="mt-4 text-gray-500">No allocations for this application.</div>
        )}
      </div>
      <button
        className="mt-4 px-4 py-2 bg-[#040941] text-white rounded-lg font-semibold hover:bg-blue-800 transition w-full"
        onClick={onClose}>
        Close
      </button>
    </div>
  );
};

export default ApplicationDetailsPanel;
