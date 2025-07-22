import React from "react";
import type Section from "../../../interfaces/section/Section";

interface CoursesMissingNeedsCardProps {
  missingNeeds: Section[];
  visibleMissing: number;
  setVisibleMissing: React.Dispatch<React.SetStateAction<number>>;
}

export const CoursesMissingNeedsCard: React.FC<CoursesMissingNeedsCardProps> = ({ missingNeeds, visibleMissing, setVisibleMissing }) => (
  <div className="bg-white rounded-lg shadow p-0 md:col-span-2 flex flex-col justify-between">
    <div className="rounded-t-lg bg-gray-100 w-full px-4 pt-3 pb-2">
      <h2 className="font-semibold text-gray-700">Courses Missing Needs</h2>
    </div>
    <div className="p-4 flex-1 pt-2">
      {missingNeeds.length === 0 ? (
        <p className="text-gray-500">All courses have needs specified.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-300">
            {missingNeeds.slice(0, visibleMissing).map(section => (
              <li key={section.id} className="py-2">
                <div className="flex flex-col">
                  <span className="font-medium text-red-700">
                    {section.course?.deptCode} {section.course?.courseNum} — {section.course?.name}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5">
                    {section.year} {section.semester} | Section {section.section} | {section.type}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {(missingNeeds.length > visibleMissing || visibleMissing > 3) && (
            <div className="mt-2 flex justify-end gap-2">
              {missingNeeds.length > visibleMissing && (
                <button
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#1D3557' }}
                  onClick={() => setVisibleMissing(prev => Math.min(prev + 5, missingNeeds.length))}
                >
                  View More
                </button>
              )}
              {visibleMissing > 3 && (
                <button
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#1D3557' }}
                  onClick={() => setVisibleMissing(3)}
                >
                  Show Less
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  </div>
);
