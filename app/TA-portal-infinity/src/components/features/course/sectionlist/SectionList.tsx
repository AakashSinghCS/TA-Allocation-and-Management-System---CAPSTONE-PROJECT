import { Link } from 'react-router-dom';
import { sectionTypeOptions } from '../../../../interfaces/section/SectionDetails';
import React from 'react';
import type Section from '../../../../interfaces/section/Section';
import ExportAllocationsCSV from '../../csv/ExportAllocationsCSV';

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

  const handleExportToCSV = (sectionId : number) =>{

  }

  return (<>
    <table className="min-w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="border border-gray-300 px-3 py-2 text-left">Section</th>
          <th className="border border-gray-300 px-3 py-2 text-left">Year</th>
          <th className="border border-gray-300 px-3 py-2 text-left">Semester</th>
          <th className="border border-gray-300 px-3 py-2 text-left">Type</th>
          <th className="border border-gray-300 px-3 py-2 text-left">Times</th>
          <th className="border border-gray-300 px-3 py-2 text-left">Action</th>
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
                  className="border border-gray-300 px-3 py-2 font-semibold "
                >
                  {/* Left: course link */}
                  {courseId ? (
                    
                    <Link
                      to={`/user/courseprofile/${courseId}`}
                      className="text-[#0089b2] hover:text-[#00b5bc] truncate inline whitespace-nowrap overflow-hidden"
                    >
                      {deptCode} {courseNum} — {name}
                    </Link>
                  ) : (
                    <span className="border-gray-300 truncate inline whitespace-nowrap overflow-hidden ">
                      {deptCode} {courseNum} — {name}
                    </span>
                  )}
                </td>
                <td colSpan={1} className="border border-gray-300 px-3 py-2 text-right">
                  {mode == 'coordinator' ? (<button
                    type="button"
                    onClick={() => handleDeleteCourse(courseId)}
                    className=" cursor-pointer text-red-600 hover:text-red-300 text-sm whitespace-nowrap"
                  >
                    Delete Course
                  </button>) : (mode == 'instructorPrereqCourse' || mode === 'studentAddEnrollment') ? <button
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
                    className="cursor-pointer text-[#0089b2] hover:text-[#00b5bc] text-sm whitespace-nowrap"
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
                    <td className="border border-gray-300 px-3 py-2 truncate">
                      {sid ? (
                        <Link
                          to={`/user/sectionprofile/${sid}`}
                          className="text-[#0089b2] hover:text-[#00b5bc] truncate inline whitespace-nowrap overflow-hidden"
                        >
                          {sec.sectionDetails?.deptCode} {sec.sectionDetails?.courseNum}{' '}
                          {sec.sectionDetails?.section} – {sec.sectionDetails?.name}
                        </Link>
                      ) : (
                        <span className="truncate inline whitespace-nowrap overflow-hidden">
                          {sec.sectionDetails?.deptCode} {sec.sectionDetails?.courseNum}{' '}
                          {sec.sectionDetails?.section} – {sec.sectionDetails?.name}
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-300  px-3 py-2">
                      {sec.sectionDetails?.year}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {sec.sectionDetails?.semester}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 max-w-xs truncate">
                      {sec.sectionDetails?.type}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">{times}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {sid && (
                        <>
                          {(mode === 'instructorAddSection' || mode === 'studentAddHistory' || mode === 'studentAddEnrollment') ? (
                            <button
                              type="button"
                              onClick={() => onSelect?.(sec)}
                              className="cursor-pointer text-[#0089b2] hover:text-[#00b5bc]"
                            >
                              Select
                            </button>
                          ) : (mode === 'coordinator') ? (
                            <div>
                              <ExportAllocationsCSV
                                courseId={groups[courseId][0].sectionDetails?.id ?? -1}
                                year={groups[courseId][0].sectionDetails?.year ?? -1}
                                semester={groups[courseId][0].sectionDetails?.semester ?? ""}
                                className="text-[#0089b2] hover:text-[#00b5bc] text-sm"
                                buttonLabel="Export to CSV"
                              />
                              {" "}
                              <button
                                type="button"
                                onClick={() => handleDeleteSection(sid)}
                                className="text-red-600 hover:text-red-300 text-sm "
                              >
                                Delete Section
                              </button>
                            </div>
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
    </>
  );
}
