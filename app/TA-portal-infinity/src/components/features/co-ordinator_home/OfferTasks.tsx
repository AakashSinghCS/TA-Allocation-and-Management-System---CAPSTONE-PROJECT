import React from 'react';
import { Link } from 'react-router-dom';
import type { Allocation } from '../../../interfaces/allocation/Allocation';

interface OfferTasksProps {
  topAllocations: Allocation[];
}

const OfferTasks: React.FC<OfferTasksProps> = ({ topAllocations }) => (
  <div className="bg-white rounded-lg shadow w-full">
    <div className="px-4 py-2 border-b"><h2 className="font-semibold text-gray-700">Offer Tasks</h2></div>
    <div className="p-4">
      {topAllocations.length > 0 ? (
        <ul className="space-y-4">
          {topAllocations.map(a => (
            <li key={a.id}>
              <div className="grid grid-cols-3 gap-x-6 p-2 rounded">
                <div>
                  <p className="font-medium text-gray-800">
                    <a
                      href={`http://localhost:5173/user/profile/${a.student?.id}`}
                      className="text-blue-900 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {a.student?.firstName} {a.student?.lastName}
                    </a>
                  </p>
                  <p className="text-xs text-gray-500">{a.student?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hours Allocated: {a.numberOfHours}</p>
                  <p className="text-sm text-gray-600">
                    Status: {a.status === 'SENT' ? 'Offer Sent' : a.status === 'CONFIRMED' ? 'Offer Confirmed' : a.status === 'REJECTED' ? 'Offer Rejected' : a.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Section: {a.section?.year} {a.section?.semester}, {a.section?.type} — {a.section?.course?.deptCode} {a.section?.course?.courseNum} ({a.section?.course?.name})
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No recent allocations.</p>
      )}
    </div>
    <div className="px-4 py-2 bg-gray-50 text-right">
      <Link to="/user/coordinator/allocation" className="text-blue-900 hover:underline">Manage allocations</Link>
    </div>
  </div>
);

export default OfferTasks;
