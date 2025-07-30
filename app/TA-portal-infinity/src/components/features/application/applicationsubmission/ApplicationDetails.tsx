import React from 'react';
import type { ApplicationDto } from '../../../../interfaces/application/Application';

interface ApplicationDetailsProps {
  savedApp: ApplicationDto;
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({ savedApp }) => (
  <div
    id="application-details-row"
    className="w-full border-x border-b border-[#040941] rounded-b-xl px-3 md:px-6 py-4 text-sm animate-slide-down relative overflow-hidden"
    role="region"
    aria-live="polite"
  >
    {/* View Application Details */}
    <div className="absolute left-1/2 top-0 -translate-x-1/2 w-16 h-2 bg-gray-300 rounded-b-xl shadow-md z-10 animate-fold-bar" aria-hidden="true"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      <div><span className="font-semibold">Student ID:</span> {savedApp.student?.studentNum || 'N/A'}</div>
      <div><span className="font-semibold">Preferences:</span> {savedApp.preferences?.join(', ') || 'N/A'}</div>
      <div><span className="font-semibold">Remote:</span> {savedApp.wantRemote ? 'Yes' : 'No'}</div>
      <div><span className="font-semibold">Requested Hours:</span> {savedApp.wantWorkingHours}</div>
      <div className="sm:col-span-2 md:col-span-3">
        <span className="font-semibold">Unavailability:</span>
        <ul className="list-disc list-inside ml-4 inline">
          {savedApp.unavailabilities?.length ? (
            savedApp.unavailabilities.map((u, i) => (
              <li key={i} className="inline-block mr-4">{u.day} {u.startTime}–{u.endTime}</li>
            ))
          ) : (
            <li>N/A</li>
          )}
        </ul>
      </div>
    </div>
  </div>
);

export default ApplicationDetails;
