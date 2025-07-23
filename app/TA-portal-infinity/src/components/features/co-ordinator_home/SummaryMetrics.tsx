import React from 'react';
import { RxCrossCircled } from 'react-icons/rx';
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { IoBookOutline } from "react-icons/io5";
import { MdPendingActions } from "react-icons/md";
import { RiUserSharedLine } from "react-icons/ri";
import { GrDocumentUser } from "react-icons/gr";

interface SummaryMetricsProps {
  totalApps: number;
  pendingApplications: number;
  offerCount: number;
  confirmedCount: number;
  rejectedCount: number;
  sectionsInSystem: number;
}

const cardStyle = {
  borderTopColor: '#040941',
  minHeight: '60px', // smaller height
  paddingTop: '0.5rem',
  paddingBottom: '0.5rem',
};

const SummaryMetrics: React.FC<SummaryMetricsProps> = ({
  totalApps,
  pendingApplications,
  offerCount,
  confirmedCount,
  rejectedCount,
  sectionsInSystem,
}) => (
  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
    {/* Total Applications */}
    <div className="flex items-center bg-white rounded-2xl shadow-md px-3 py-2 border-t-4" style={cardStyle}>
      <GrDocumentUser size={20} style={{ color: '#040941' }} className="mr-3" />
      <div>
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Total Applications</div>
        <div className="text-lg font-bold text-[#040941]">{totalApps}</div>
      </div>
    </div>
    {/* Pending Reviews */}
    <div className="flex items-center bg-white rounded-2xl shadow-md px-3 py-2 border-t-4" style={cardStyle}>
      <MdPendingActions size={20} style={{ color: '#040941' }} className="mr-3" />
      <div>
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Pending Reviews</div>
        <div className="text-lg font-bold text-[#040941]">{pendingApplications}</div>
      </div>
    </div>
    {/* Offers Sent */}
    <div className="flex items-center bg-white rounded-2xl shadow-md px-3 py-2 border-t-4" style={cardStyle}>
      <RiUserSharedLine size={20} style={{ color: '#040941' }} className="mr-3" />
      <div>
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Offers Sent</div>
        <div className="text-lg font-bold text-[#040941]">{offerCount}</div>
      </div>
    </div>
    {/* Offers Confirmed */}
    <div className="flex items-center bg-white rounded-2xl shadow-md px-3 py-2 border-t-4" style={cardStyle}>
      <IoMdCheckmarkCircleOutline size={20} style={{ color: '#040941' }} className="mr-3" />
      <div>
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Offers Confirmed</div>
        <div className="text-lg font-bold text-[#040941]">{confirmedCount}</div>
      </div>
    </div>
    {/* Offers Rejected */}
    <div className="flex items-center bg-white rounded-2xl shadow-md px-3 py-2 border-t-4" style={cardStyle}>
      <RxCrossCircled size={20} style={{ color: '#040941' }} className="mr-3" />
      <div>
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Offers Rejected</div>
        <div className="text-lg font-bold text-[#040941]">{rejectedCount}</div>
      </div>
    </div>
    {/* Sections in System */}
    <div className="flex items-center bg-white rounded-2xl shadow-md px-3 py-2 border-t-4" style={cardStyle}>
      <IoBookOutline size={20} style={{ color: '#040941' }} className="mr-3" />
      <div>
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Total Sections</div>
        <div className="text-lg font-bold text-[#040941]">{sectionsInSystem}</div>
      </div>
    </div>
  </div>
);

export default SummaryMetrics;
