import React from 'react';
import { Link } from 'react-router-dom';
import type { ApplicationDto } from '../../../interfaces/application/Application';
import type { Allocation } from '../../../interfaces/allocation/Allocation';

interface RecentApplicationsProps {
  recentApps: ApplicationDto[];
  recentAppAllocations: Record<number, Allocation[]>;
  topAllocations: Allocation[];
}

const RecentApplications: React.FC<RecentApplicationsProps> = ({ recentApps, recentAppAllocations, topAllocations }) => (
  <div className="bg-white rounded-lg shadow w-full">
    <div className="px-4 py-2 border-b"><h2 className="font-semibold text-gray-700">Recent Applications</h2></div>
    <div className="p-4">
      {recentApps.length === 0 ? (
        <p className="text-gray-500">No new applications.</p>
      ) : (
        <ul className="space-y-4">
          {recentApps.map(app => (
            <li key={app.id}>
              <div className="grid grid-cols-3 gap-x-6">
                <div>
                  <p className="font-medium text-gray-800">
                    <a
                      href={`http://localhost:5173/user/profile/${app.student.id}`}
                      className="text-blue-900 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {app.student.firstName} {app.student.lastName}
                    </a>
                  </p>
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(app.timeSubmitted).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Preferences: {app.preferences?.join(', ') || 'None'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Type: {app.applicationType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Hours Requested: {app.wantWorkingHours}
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    Status: {
                      (() => {
                        const allocs = recentAppAllocations[app.id ?? 0];
                        if (allocs && allocs.length > 0) {
                          if (allocs.some(a => a.status === 'CONFIRMED')) return 'Allocated';
                          if (allocs.some(a => a.status === 'SENT')) return 'Offer Sent';
                          if (allocs.some(a => a.status === 'REJECTED')) return 'Offer Rejected';
                          return allocs[0].status || 'Unknown';
                        }
                        const allocs2 = topAllocations.filter(a => a.application?.id === app.id);
                        if (allocs2.length > 0) {
                          if (allocs2.some(a => a.status === 'CONFIRMED')) return 'Allocated';
                          if (allocs2.some(a => a.status === 'SENT')) return 'Offer Sent';
                          if (allocs2.some(a => a.status === 'REJECTED')) return 'Offer Rejected';
                          return allocs2[0].status || 'Unknown';
                        }
                        return 'Not Allocated';
                      })()
                    }
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
    <div className="px-4 py-2 bg-gray-50 text-right">
      <Link to="/user/coordinator/applications" className="text-blue-900 hover:underline">View all applications</Link>
    </div>
  </div>
);

export default RecentApplications;
