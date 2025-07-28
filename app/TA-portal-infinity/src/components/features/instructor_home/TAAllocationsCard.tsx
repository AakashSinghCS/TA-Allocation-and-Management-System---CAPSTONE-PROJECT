import React from "react";
import type Section from "../../../interfaces/section/Section";
import type { AllocationType } from "../../../interfaces/allocation/Allocation";

interface TAAllocationsCardProps {
  sections: Section[];
  visibleAlloc: number;
  setVisibleAlloc: React.Dispatch<React.SetStateAction<number>>;
  expandedAlloc: {sectionId: number, allocIdx: number} | null;
  setExpandedAlloc: React.Dispatch<React.SetStateAction<{sectionId: number, allocIdx: number} | null>>;
}
const TASK_LABEL: Record<AllocationType, string> = {
  LAB:      "Section Hours Allocated",
  GRADING:  "Grading Hours Allocated",
  LAB_PREP: "Lab Prep Hours Allocated"
};

export const TAAllocationsCard: React.FC<TAAllocationsCardProps> = ({ sections, visibleAlloc, setVisibleAlloc, expandedAlloc, setExpandedAlloc }) => (
  <div className="bg-white rounded-lg shadow p-0 flex flex-col justify-between">
    <div className="rounded-t-lg bg-gray-100 w-full px-4 pt-3 pb-2">
      <h2 className="font-semibold text-gray-700">TA Allocations</h2>
    </div>
    <div className="p-4 flex-1 pt-2">
      <ul className="divide-y divide-gray-300">
        {sections.slice(0, visibleAlloc).map(section => (
          <li key={section.id} className="py-2">
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">
                {section.course?.deptCode} {section.course?.courseNum} — {section.course?.name}
              </span>
              <span className="text-xs text-gray-500 mt-0.5">
                {section.year} {section.semester} | Section {section.section} | {section.type}
              </span>
              {section.allocations && section.allocations.length > 0 ? (
                <ul className="ml-4 mt-1">
                  {section.allocations.map((alloc, idx) => {
                    const tasksForThisSection = alloc.allocatedSections
                    ?.filter(as => as.sectionId === section.id) 
                    ?? [];
                    return(
                    <li key={alloc.id || idx} className="text-sm text-gray-700 mb-2">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          {alloc.student?.id ? (
                            <>
                              <a
                                href={`http://localhost:5173/user/profile/${alloc.student.id}`}
                                className="text-[#1D3557] hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {alloc.student.firstName || ''} {alloc.student.lastName || ''}
                              </a>
                              {alloc.student.email && (
                                <span className="block text-xs text-gray-500">{alloc.student.email}</span>
                              )}
                            </>
                          ) : (
                            <span>{alloc.student?.firstName || ''} {alloc.student?.lastName || ''}</span>
                          )}
                          <button
                            className="ml-2 text-xs font-medium hover:underline"
                            style={{ color: '#1D3557' }}
                            onClick={() => setExpandedAlloc(
                              expandedAlloc && expandedAlloc.sectionId === (section.id as number) && expandedAlloc.allocIdx === idx
                                ? null
                                : { sectionId: section.id as number, allocIdx: idx }
                            )}
                          >
                            {expandedAlloc && expandedAlloc.sectionId === (section.id as number) && expandedAlloc.allocIdx === idx ? 'Hide Details' : 'View Details'}
                          </button>
                        </div>
                        {expandedAlloc && expandedAlloc.sectionId === (section.id as number) && expandedAlloc.allocIdx === idx && (
                          <div className="bg-gray-50 rounded p-2 mt-1 text-xs text-gray-700 border border-gray-200 space-y-1">
                            <div><span className="font-semibold">Student Num:</span> {alloc.student?.studentNum ?? 'N/A'}</div>
                            <div><span className="font-semibold">Program:</span> {alloc.student?.program ?? 'N/A'}</div>
                            <div><span className="font-semibold">Enrollment Year:</span> {alloc.student?.enrollmentYear ?? 'N/A'}</div>
                            <div><span className="font-semibold">School Year:</span> {alloc.student?.schoolYear ?? 'N/A'}</div>
                            <div><span className="font-semibold">Email:</span> {alloc.student?.email ?? 'N/A'}</div>
                            <div><span className="font-semibold">Roles:</span> {alloc.student?.roles?.join(', ') ?? 'N/A'}</div>
                            {tasksForThisSection.map(taskAlloc => (
                              <div key={taskAlloc.task}>
                                <span className="font-semibold">
                                  {TASK_LABEL[taskAlloc.task]}:
                                </span>{" "}
                                {taskAlloc.hours}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                    );
                  })}
                </ul>
              ) : (
                <span className="text-sm text-gray-500 ml-4 mt-1">No TA allocated yet</span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {(sections.length > visibleAlloc || visibleAlloc > 3) && (
        <div className="mt-2 flex justify-end gap-2">
          {sections.length > visibleAlloc && (
            <button
              className="text-sm font-medium hover:underline"
              style={{ color: '#1D3557' }}
              onClick={() => setVisibleAlloc(prev => Math.min(prev + 5, sections.length))}
            >
              View More
            </button>
          )}
          {visibleAlloc > 3 && (
            <button
              className="text-sm font-medium hover:underline"
              style={{ color: '#1D3557' }}
              onClick={() => setVisibleAlloc(3)}
            >
              Show Less
            </button>
          )}
        </div>
      )}
    </div>
  </div>
);
