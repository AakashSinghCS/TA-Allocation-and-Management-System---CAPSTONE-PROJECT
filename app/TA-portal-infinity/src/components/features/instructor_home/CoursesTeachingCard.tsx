import React from "react";
import type Section from "../../../interfaces/section/Section";

interface CoursesTeachingCardProps {
  sections: Section[];
  visibleTeaching: number;
  setVisibleTeaching: React.Dispatch<React.SetStateAction<number>>;
}

export const CoursesTeachingCard: React.FC<CoursesTeachingCardProps> = ({ sections, visibleTeaching, setVisibleTeaching }) => (
  <div className="bg-white rounded-lg shadow p-0 flex flex-col justify-between">
    <div className="rounded-t-lg bg-gray-100 w-full px-4 pt-3 pb-2">
      <h2 className="font-semibold text-gray-700">Courses Teaching</h2>
    </div>
    <div className="p-4 flex-1 pt-2">
      <ul className="divide-y divide-gray-300">
        {sections.slice(0, visibleTeaching).map(section => (
          <li key={section.id} className="py-2">
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">
                {section.course?.deptCode} {section.course?.courseNum} — {section.course?.name}
              </span>
              <span className="text-xs text-gray-500 mt-0.5">
                {section.year} {section.semester} | Section {section.section} | {section.type}
              </span>
            </div>
          </li>
        ))}
      </ul>
      {(sections.length > visibleTeaching || visibleTeaching > 5) && (
        <div className="mt-2 flex justify-end gap-2">
          {sections.length > visibleTeaching && (
            <button
              className="text-sm font-medium hover:underline"
              style={{ color: '#1D3557' }}
              onClick={() => setVisibleTeaching(prev => Math.min(prev + 5, sections.length))}
            >
              View More
            </button>
          )}
          {visibleTeaching > 5 && (
            <button
              className="text-sm font-medium hover:underline"
              style={{ color: '#4F8EDB' }}
              onClick={() => setVisibleTeaching(5)}
            >
              Show Less
            </button>
          )}
        </div>
      )}
    </div>
  </div>
);
