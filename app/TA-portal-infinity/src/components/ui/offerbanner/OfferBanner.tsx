import React from 'react';
import type { ApplicationDto } from '../../../interfaces/application/Application';
import type { SectionDetails } from '../../../interfaces/section/SectionDetails';

interface OfferBannerProps {
  visible: boolean;
  student: ApplicationDto['student'];
  section: SectionDetails;
  hours: number;
  onClose: () => void;
}

export default function OfferBanner({
  visible,
  student,
  section,
  hours,
  onClose,
}: OfferBannerProps) {
  if (!visible) return null;

  return (
    <div className="fixed top-4 inset-x-4 z-40">
      <div className="bg-green-50 border-l-4 border-green-400 p-4 shadow-lg flex justify-between items-center">
        <div className="flex-1">
          <p className="font-semibold text-green-800">
            Offer Sent!
          </p>
          <p className="mt-1 text-green-700">
            {student.firstName} {student.lastName} has been assigned <strong>{hours}h</strong> to{' '}
            <strong>
              {section.deptCode}{section.courseNum} Section {section.section}
            </strong>.
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-green-600 hover:text-green-800 focus:outline-none"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
