import { Link } from 'react-router-dom';
import { sectionTypeOptions } from '../../../../interfaces/section/SectionDetails';
import React from 'react';
import type Section from '../../../../interfaces/section/Section';

interface Props {
  sections: Section[] | null;
  onDeleted?: (id: number, isCourse: boolean) => void;
  onSelect?: (u: Section) => void;
  onSelectCourse?: (cId: number, deptCode: string, courseNum: string, name: string) => void;
  mode?: 'coordinator' | 'instructorAddSection' | 'instructorPrereqCourse' | 'studentAddHistory' | 'studentAddEnrollment';
}

export default function SectionList({ sections, onDeleted, onSelect, onSelectCourse, mode = 'coordinator' }: Props) {
  if (!sections || sections.length === 0) {
    return <p className="p-4 text-center text-gray-500">No section found.</p>;
  }

  // Group sections by course ID
  const groups = sections.reduce<Record<number, Section[]>>((acc, sec) => {
    const cid = sec.sectionDetails?.id ?? 0;
    if (!acc[cid]) acc[cid] = [];
    acc[cid].push(sec);
    return acc;
  }, {});

  // Sort course IDs by their numeric courseNum
  const sortedCourseIds = Object.keys(groups)
    .map((id) => Number(id))
    .sort((a, b) => {
      const numA = Number(groups[a][0].sectionDetails?.courseNum);
      const numB = Number(groups[b][0].sectionDetails?.courseNum);
      return numA - numB;
    });

  const abbreviateDay = (day?: string | null) => {
    if (!day) return undefined;
    const abbr = day.length > 3 ? day.slice(0, 3) : day;
    return abbr.charAt(0).toUpperCase() + abbr.slice(1).toLowerCase();
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (
      !window.confirm(
        'Really delete entire course? This deletes all associated sections.'
      )
    )
      return;
    onDeleted?.(courseId, true);
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (
      !window.confirm(
        'Really delete this section?'
      )
    )
      return;
    onDeleted?.(sectionId, false);
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
          <th className="border px-3 py-2 text-left">Action</th>
        </tr>
      </thead>
      <tbody>
        {sortedCourseIds.map((courseId) => {
          const group = groups[courseId];

          // Sort this group's sections by type order
          const sortedSections = [...group].sort((a, b) => {
            const indexA = a.sectionDetails?.type
              ? sectionTypeOptions.indexOf(a.sectionDetails.type)
              : Infinity;
            const indexB = b.sectionDetails?.type
              ? sectionTypeOptions.indexOf(b.sectionDetails.type)
              : Infinity;
            return indexA - indexB;
          });

          // Course header info
          const { deptCode, courseNum, name } = group[0].sectionDetails || {};

          return (
            <React.Fragment key={courseId}>
              <tr className="bg-gray-100">
                <td
                  colSpan={5}
                  className="border px-3 py-2 font-semibold "
                >
                  {/* Left: course link */}
                  {courseId ? (
                    <Link
                      to={`/user/courseprofile/${courseId}`}
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
                <td colSpan={1} className="border px-3 py-2 text-right">
                  {mode == 'coordinator' ? (<button
                    type="button"
                    onClick={() => handleDeleteCourse(courseId)}
                    className="text-red-600 hover:underline text-sm whitespace-nowrap"
                  >
                    Delete Course
                  </button>) : (mode == 'instructorPrereqCourse' || 'studentAddEnrollment') ? <button
                    type="button"
                    onClick={() => {
                      if (!onSelectCourse) return;
                      if(groups[courseId].length<1) return;
                      return onSelectCourse(
                        courseId,
                        groups[courseId][0].sectionDetails?.deptCode ?? "",
                        groups[courseId][0].sectionDetails?.courseNum ?? "",
                        groups[courseId][0].sectionDetails?.name ?? "",
                      )
                    }}
                    className="text-red-600 hover:underline text-sm whitespace-nowrap"
                  >
                    Select
                  </button> : <></>
                  }
                </td>

              </tr>

              {mode !== 'instructorPrereqCourse' && sortedSections.map((sec) => {
                if (!sec.sectionDetails?.sectionId) return;

                const times = (sec.sectionSchedule ?? [])
                  .map((s) =>
                    s.day && s.startTime && s.endTime
                      ? `${abbreviateDay(s.day)}-${s.startTime}-${s.endTime}`
                      : ''
                  )
                  .filter((t) => t)
                  .join(', ');

                const sid = sec.sectionDetails?.sectionId;

                return (
                  <tr key={`${sid}-${times}`}>
                    <td className="border px-3 py-2 max-w-xs truncate">
                      {sid ? (
                        <Link
                          to={`/user/sectionprofile/${sid}`}
                          className="text-blue-600 hover:underline block truncate"
                        >
                          {sec.sectionDetails?.deptCode} {sec.sectionDetails?.courseNum}{' '}
                          {sec.sectionDetails?.section} – {sec.sectionDetails?.name}
                        </Link>
                      ) : (
                        <span className="block truncate">
                          {sec.sectionDetails?.deptCode} {sec.sectionDetails?.courseNum}{' '}
                          {sec.sectionDetails?.section} – {sec.sectionDetails?.name}
                        </span>
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      {sec.sectionDetails?.year}
                    </td>
                    <td className="border px-3 py-2">
                      {sec.sectionDetails?.semester}
                    </td>
                    <td className="border px-3 py-2 max-w-xs truncate">
                      {sec.sectionDetails?.type}
                    </td>
                    <td className="border px-3 py-2">{times}</td>
                    <td className="border px-3 py-2 text-right">
                      {sid && (
                        <>
                          {(mode === 'instructorAddSection' ||'studentAddHistory' || 'studentAddEnrollment') ? (
                            <button
                              type="button"
                              onClick={() => onSelect?.(sec)}
                              className="text-blue-600 hover:underline"
                            >
                              Select
                            </button>
                          ) : mode === 'coordinator' ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(sid)}
                              className="text-red-600 hover:underline text-sm "
                            >
                              Delete Section
                            </button>
                          ) : <></>}
                        </>
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
