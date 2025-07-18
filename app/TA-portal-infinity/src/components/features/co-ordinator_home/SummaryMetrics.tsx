import React from 'react';

interface SummaryMetricsProps {
  totalApps: number;
  pendingApplications: number;
  offerCount: number;
  confirmedCount: number;
  rejectedCount: number;
  sectionsInSystem: number;
}

const SummaryMetrics: React.FC<SummaryMetricsProps> = ({
  totalApps,
  pendingApplications,
  offerCount,
  confirmedCount,
  rejectedCount,
  sectionsInSystem,
}) => (
  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
    {/* Total Applications */}
    <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-600">Total Applications</p>
        <p className="text-xl font-semibold text-gray-900">{totalApps}</p>
      </div>
    </div>
    {/* Pending Reviews */}
    <div className="bg-yellow-50 rounded-lg p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-600">Pending Reviews</p>
        <p className="text-xl font-semibold text-gray-900">{pendingApplications}</p>
      </div>
    </div>
    {/* Offers Sent */}
    <div className="bg-green-50 rounded-lg p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-600">Offers Sent</p>
        <p className="text-xl font-semibold text-gray-900">{offerCount}</p>
      </div>
    </div>
    {/* Offers Confirmed */}
    <div className="bg-red-50 rounded-lg p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-600">Offers Confirmed</p>
        <p className="text-xl font-semibold text-gray-900">{confirmedCount}</p>
      </div>
    </div>
    {/* Offers Rejected */}
    <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-600">Offers Rejected</p>
        <p className="text-xl font-semibold text-gray-900">{rejectedCount}</p>
      </div>
    </div>
    {/* Sections in System */}
    <div className="bg-yellow-50 rounded-lg p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-600">Sections in System</p>
        <p className="text-xl font-semibold text-gray-900">{sectionsInSystem}</p>
      </div>
    </div>
  </div>
);

export default SummaryMetrics;
