import { Link } from 'react-router-dom';
import type { FilterSectionsProps } from '../../../../api/sectionfilter/fetchFilteredSections';
import { sectionTypeOptions } from '../../../../interfaces/section/SectionDetails';
import React from 'react';
interface Props {
  sections: FilterSectionsProps[] | null;
  onDeleted?: () => void;
}

export default function SectionList({ sections, onDeleted }: Props) {
  if (!sections || sections.length === 0) {
    return <p className="p-4 text-center text-gray-500">No section found.</p>;
  }
  const groups = sections.reduce<Record<number, FilterSectionsProps[]>>((acc, sec) => {
    const cid = sec.courseId ?? 0;
    if (!acc[cid]) acc[cid] = [];
    acc[cid].push(sec);
    return acc;
  }, {});

  const sortedCourseIds = Object.keys(groups)
    .map(id => Number(id))
    .sort((a, b) => {
      const numA = Number(groups[a][0].courseNum);
      const numB = Number(groups[b][0].courseNum);
      return numA - numB;
    });

  const abbreviateDay = (day: string | null | undefined) => {
    if (!day) return;
    const abbr = day.length > 3 ? day.slice(0, 3) : day;
    return abbr.charAt(0).toUpperCase() + abbr.slice(1).toLowerCase();
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!window.confirm('Really delete entire course? This deletes all associated sections. WAITING FOR BACKEND TO BE IMPLEMENTED')) return;
    // await mockDeleteApi('course', courseId);
    onDeleted?.();
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!window.confirm('Really delete this section? WAITING FOR BACKEND TO BE IMPLEMENTED')) return;
    // await mockDeleteApi('section', sectionId);
    onDeleted?.();
  };

  return (
    <table className="min-w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="border px-3 py-2 text-left">Section</th>
          <th className="border px-3 py-2 text-left">Year</th>
          <th className="border px-3 py-2 text-left">Semester</th>
          <th className="border px-3 py-2 text-left">Type</th>
          <th className="border px-3 py-2 text-left">Times</th>
          <th className="border px-3 py-2 text-left">Delete</th>
        </tr>
      </thead>
      <tbody>
        {sortedCourseIds.map((courseId) => {
          const group = groups[courseId];
          // sort this group by type order
          const sortedSections = [...group].sort((a, b) => {
            const indexA = a.type ? sectionTypeOptions.indexOf(a.type) : Infinity;
            const indexB = b.type ? sectionTypeOptions.indexOf(b.type) : Infinity;
            return indexA - indexB;
          });

          // render a header row for the course
          const { deptCode, courseNum, name } = group[0];
          return (
            <React.Fragment key={courseId}>
              <tr className="bg-gray-100">
                <td
                  className="border px-3 py-2 font-semiboldflex justify-between items-center"
                  colSpan={5}
                >
                    {courseId ? (
                      <Link
                        to={`/courses/${courseId}`}
                        className="text-blue-600 hover:underline block truncate"
                      >
                        {deptCode} {courseNum} — {name}
                      </Link>
                    ) : (
                      <span className="block truncate">
                        {deptCode} {courseNum} — {name}
                      </span>
                    )}
                    
                </td>
                <td className="border px-3 py-2">
                  <button
                      onClick={() => handleDeleteCourse(courseId)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete Course
                    </button>
                </td>
              </tr>
              {sortedSections.map((c) => {
                if (c.isCourse) return null;
                const times = (c.day && c.startTime && c.endTime)?`${abbreviateDay(c.day)}-${c.startTime}-${c.endTime}`:"";
                return (
                  <tr key={`${c.sectionId}-${c.day}`}>
                    <td className="border px-3 py-2 max-w-xs truncate">
                      {c.sectionId ? (
                        <Link
                          to={`/sections/${c.sectionId}`}
                          className="text-blue-600 hover:underline block truncate"
                        >
                          {c.deptCode} {c.courseNum} {c.section} – {c.name}
                        </Link>
                      ) : (
                        <span className="block truncate">
                          {c.deptCode} {c.courseNum} {c.section} – {c.name}
                        </span>
                      )}
                    </td>
                    <td className="border px-3 py-2">{c.year}</td>
                    <td className="border px-3 py-2">{c.semester}</td>
                    <td className="border px-3 py-2 max-w-xs truncate">
                      {c.type}
                    </td>
                    <td className="border px-3 py-2">{times}</td>
                    <td className="border px-3 py-2">
                      {c.sectionId && (
                        <button
                          onClick={() => handleDeleteSection(c.sectionId!)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete Section
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
