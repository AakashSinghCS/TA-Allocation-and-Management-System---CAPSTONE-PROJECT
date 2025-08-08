import React from 'react';

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface ApplicationStatsProps {
  totalApplications: number;
  appsWithOffer: number;
  appsWithConfirmed: number;
  appsWithOfferWaiting: number;
  filteredCount: number;
  compact?: boolean;
}

const ApplicationStats: React.FC<ApplicationStatsProps> = ({
  totalApplications,
  appsWithOffer,
  appsWithConfirmed,
  appsWithOfferWaiting,
  filteredCount,
  compact = false,
}) => {
  const statCards: StatCard[] = [
    {
      label: 'Total Applications',
      value: totalApplications,
      icon: (
        <svg className="w-7 h-7 text-blue-600 p-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4.13a4 4 0 10-8 0 4 4 0 008 0z" /></svg>
      ),
      color: 'from-blue-100 to-blue-50 border-blue-300',
    },
    {
      label: 'Offer Sent',
      value: appsWithOffer,
      icon: (
        <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      ),
      color: 'from-green-100 to-green-50 border-green-300',
    },
    {
      label: 'Allocation Completed',
      value: appsWithConfirmed,
      icon: (
        <svg className="w-7 h-7 text-indigo-600 p-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2"/></svg>
      ),
      color: 'from-indigo-100 to-indigo-50 border-indigo-300',
    },
    {
      label: 'Waiting on Allocation',
      value: appsWithOfferWaiting,
      icon: (
        <svg className="w-7 h-7 text-yellow-600 p-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2"/></svg>
      ),
      color: 'from-yellow-100 to-yellow-50 border-yellow-300',
    },
    {
      label: 'Filtered Applications',
      value: filteredCount,
      icon: (
        <svg className="w-7 h-7 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 019 17v-4.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
      ),
      color: 'from-cyan-100 to-cyan-50 border-cyan-300',
    },
  ];
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 mb-2 ${compact ? '' : 'gap-4 mb-4'}`}>
      {statCards.map((stat, idx) => (
        <div
          key={idx}
          className={`flex items-center gap-3 bg-gradient-to-br ${stat.color} border rounded-xl shadow ${compact ? 'p-2 min-h-[48px]' : 'p-3 min-h-[70px]'}`}
        >
          <div className={`flex-shrink-0 ${compact ? 'w-6 h-6' : 'w-7 h-7'}`}>{stat.icon}</div>
          <div>
            <div className={compact ? 'text-[17px] font-bold text-[#040941]' : 'text-lg font-bold text-[#040941]'}>{stat.value}</div>
            <div className={compact ? 'text-xs text-gray-600 font-medium' : 'text-xs text-gray-600 font-medium'}>{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApplicationStats;
