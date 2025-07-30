import React from 'react';
import { generatePath, Link, useNavigate } from 'react-router-dom';
import type Section from '../../../../interfaces/section/Section';
import ExportAllocationsCSV from '../../csv/exportallocationscsv/ExportAllocationsCSV';
import { sectionTypeOptions } from '../../../../interfaces/section/SectionDetails';

interface Props {
  sections: Section[] | null;
  onDeleted?: (id: number, isCourse: boolean) => void;
  onSelect?: (u: Section) => void;
  onSelectCourse?: (cId: number, deptCode: string, courseNum: string, name: string) => void;
  mode?: 'coordinator' | 'instructorAddSection' | 'instructorPrereqCourse' | 'studentAddHistory' | 'studentAddEnrollment';
  askForConfirmation? : boolean;
}


// Add prop for selectedSections (for highlighting/UX)
interface SectionListProps extends Props {
  selectedSections?: Section[];
}

export default function SectionList({ sections, onDeleted, onSelect, onSelectCourse, mode = 'coordinator', askForConfirmation = false, selectedSections = [] }: SectionListProps) {
  if (!sections || sections.length === 0) {
    return <p className="p-4 text-center text-gray-500">No section found.</p>;
  }
  const navigate = useNavigate();
  // Group sections by course ID
  const groups = sections.reduce<Record<number, Section[]>>((acc, sec) => {
    const cid = sec.course?.id ?? 0;
    if (!acc[cid]) acc[cid] = [];
    acc[cid].push(sec);
    return acc;
  }, {});

  // Sort course IDs by their numeric courseNum
  const sortedCourseIds = Object.keys(groups)
    .map((id) => Number(id))
    .sort((a, b) => {
      const numA = Number(groups[a][0].course?.courseNum);
      const numB = Number(groups[b][0].course?.courseNum);
      return numA - numB;
    });

  const abbreviateDay = (day?: string | null) => {
    if (!day) return undefined;
    const abbr = day.length > 3 ? day.slice(0, 3) : day;
    return abbr.charAt(0).toUpperCase() + abbr.slice(1).toLowerCase();
  };

  const handleDeleteCourse = async (courseId: number) => {
    onDeleted?.(courseId, true);
  };

  const handleDeleteSection = async (sectionId: number) => {
    onDeleted?.(sectionId, false);
  };

  const handleExportToCSV = (sectionId : number) =>{

  }

  const  handleAskForConfirmation = (e: React.MouseEvent<HTMLAnchorElement>, address:string) =>{
    if (!askForConfirmation) {
      return;
    }
    e.preventDefault();
    const ok = window.confirm(
      'Would you really like to navigate away from this page? You will lose all changes.'
    );
    if (ok) {
      navigate(address);
    }
  }
  return (<>
    <table className="min-w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="border border-gray-300 px-3 py-2 text-left">Course</th>
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
            const indexA = a?.type
              ? sectionTypeOptions.indexOf(a.type)
              : Infinity;
            const indexB = b?.type
              ? sectionTypeOptions.indexOf(b.type)
              : Infinity;
            return indexA - indexB;
          });
          // Course header info
          const { deptCode, courseNum, name } = group[0].course || {};
          return (
            <React.Fragment key={courseId}>
              <tr className="bg-gray-100">
                <td colSpan={7} className="border border-gray-300 px-3 py-2 font-semibold ">
                  {/* Left: course link */}
                  {courseId ? (
                  <Link to={`/user/courseprofile/${courseId}`}
                  onClick={(e) => handleAskForConfirmation(e, `/user/courseprofile/${courseId}`)}
                    className="text-[#0089b2] hover:text-[#00b5bc] truncate inline whitespace-nowrap overflow-hidden">
                      {deptCode} {courseNum} - {name}
                  </Link>
                  ) : (
                    <span className="border-gray-300 truncate inline whitespace-nowrap overflow-hidden ">
                      {deptCode} {courseNum} - {name}
                    </span>
                  )}
                  {mode == 'coordinator' ? (
                    <span className="float-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(courseId)}
                        className=" cursor-pointer text-red-600 hover:text-red-300 text-sm whitespace-nowrap"
                      >
                        Delete Course
                      </button>
                    </span>
                  ) : (mode == 'instructorPrereqCourse' || mode === 'studentAddEnrollment') ? (
                    <span className="float-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (!onSelectCourse) return;
                          if(groups[courseId].length<1) return;
                          return onSelectCourse(
                            courseId,
                            groups[courseId][0].course?.deptCode ?? "",
                            groups[courseId][0].course?.courseNum ?? "",
                            groups[courseId][0].course?.name ?? "",
                          )
                        }}
                        className="cursor-pointer text-[#0089b2] hover:text-[#00b5bc] text-sm whitespace-nowrap"
                      >
                        Select
                      </button>
                    </span>
                  ) : <></>}
                </td>
              </tr>
              {mode !== 'instructorPrereqCourse' && sortedSections.map((sec) => {
                if (!sec?.id) return;
                // Format time to HH:mm (remove seconds if present)
                const formatTime = (t: string) => t.length === 8 && t[2] === ':' && t[5] === ':' ? t.slice(0,5) : t;
                const times = (sec.sectionSchedule ?? [])
                  .map((s) =>
                    s.day && s.startTime && s.endTime
                      ? `${abbreviateDay(s.day) ?? "?"}-${formatTime(s.startTime)}-${formatTime(s.endTime)}`
                      : ''
                  )
                  .filter((t) => t)
                  .join(', ');
                const sid = sec?.id;
                const isSelected = selectedSections.some(s => s.id === sid);
                return (
                  <tr key={`${sid}-${times}`} className={isSelected ? "bg-blue-100" : undefined}>
                    <td className="border border-gray-300 px-3 py-2 truncate">
                      {sec.course?.deptCode} {sec.course?.courseNum} - {sec.course?.name}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 truncate">
                      {sid ? (
                        <Link to={`/user/sectionprofile/${sid}`} onClick={(e) => handleAskForConfirmation(e, `/user/sectionprofile/${sid}`)}
                        className="text-[#0089b2] hover:text-[#00b5bc] truncate inline whitespace-nowrap overflow-hidden">
                          {sec?.section}
                        </Link>
                      ) : (
                        <span className="truncate inline whitespace-nowrap overflow-hidden">
                          {sec?.section}
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-300  px-3 py-2">
                      {sec?.year}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {sec?.semester}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 max-w-xs truncate">
                      {sec?.type}
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
                              {isSelected ? 'Selected' : 'Select'}
                            </button>
                          ) : (mode === 'coordinator') ? (
                            <div>
                              {/*
                              <ExportAllocationsCSV
                                courseId={groups[courseId][0].course?.id ?? -1}
                                year={groups[courseId][0]?.year ?? -1}
                                semester={groups[courseId][0]?.semester ?? ""}
                                className="text-[#0089b2] hover:text-[#00b5bc] text-sm"
                                buttonLabel="Export to CSV"
                              />
                              {" "}
                              */}
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
