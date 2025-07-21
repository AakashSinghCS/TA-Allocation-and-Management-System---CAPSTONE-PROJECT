
import React from "react";
import type Section from "../../../interfaces/section/Section";
import type { QualificationResponse } from "../../../api/instructor/fetchAllInstructorQualifications";

interface CoursesMissingQualificationsCardProps {
  sections: Section[];
  qualifications: QualificationResponse[];
  userId: string | undefined;
}

export const CoursesMissingQualificationsCard: React.FC<CoursesMissingQualificationsCardProps> = ({ sections, qualifications, userId }) => {
  // Calculate missing courses and percent
  const courseKeys = new Set<string>();
  sections.forEach(section => {
    if (section.course) {
      courseKeys.add(`${section.course.deptCode || ''}-${section.course.courseNum || ''}`);
    }
  });
  let missingCourses = 0;
  courseKeys.forEach(courseKey => {
    const courseSections = sections.filter(s => s.course && `${s.course.deptCode || ''}-${s.course.courseNum || ''}` === courseKey);
    if (courseSections.length === 0) return;
    const hasMissing = courseSections.some(section => {
      const qual = qualifications.find(q => q.section.id === section.id);
      return !qual || !qual.qualifications || qual.qualifications.length === 0;
    });
    if (hasMissing) missingCourses++;
  });
  const totalCourses = courseKeys.size;
  const percent = totalCourses > 0 ? Math.floor((missingCourses / totalCourses) * 100) : 0;
  let urgentColorHex = "#15803D"; // green
  if (missingCourses > 0 && missingCourses <= 2) urgentColorHex = "#F59E42"; // yellow
  if (missingCourses > 2) urgentColorHex = "#B91C1C"; // red

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center w-full max-w-xs">
      <h2 className="font-semibold text-gray-700 mt-1 mb-4">Courses Missing Skills/TA Qualifications</h2>
      <hr className="w-full border-gray-300 mb-4" />
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle className="text-gray-200" strokeWidth="6" stroke="currentColor" fill="none" cx="18" cy="18" r="15" />
            <circle
              strokeWidth="6"
              strokeDasharray={`${percent > 0 ? percent : 100},${percent > 0 ? 100 - percent : 0}`}
              stroke={urgentColorHex}
              fill="none"
              cx="18"
              cy="18"
              r="15"
            />
          </svg>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{textAlign: 'center', width: '100%'}}>
            <span
              className="font-bold text-2xl sm:text-3xl"
              style={{color: urgentColorHex}}>
              {missingCourses}
            </span>
            <span
              className="font-semibold text-xs sm:text-sm mt-0.5"
              style={{color: urgentColorHex, maxWidth: '80px', display: 'block', whiteSpace: 'normal'}}>
              missing
            </span>
          </div>
        </div>
        <div className="w-full flex justify-center mt-4 mb-4">
          <a
            href={`http://localhost:5173/user/instructorprofile/${userId}/qualifications`}
            className="text-xs sm:text-sm md:text-base text-blue-900 hover:underline font-medium"
            target="_blank"
            rel="noopener noreferrer"
            style={{ cursor: 'pointer' }}
          >
            View details
          </a>
        </div>
      </div>
    </div>
  );
};
