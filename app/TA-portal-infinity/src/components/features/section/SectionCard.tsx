import type Section from "../../../interfaces/section/Section";

import { useState } from "react";

export default function SectionCard({ section }: { section: Section }) {
  const [expanded, setExpanded] = useState(false);

  const courseCodeAndName = `${section.sectionDetails.deptCode} ${section.sectionDetails.courseNum} ${section.sectionDetails.section} - ${section.sectionDetails.name}`;
  const metaInfo = `| ${section.sectionDetails.type} | ${section.sectionDetails.term}`;

  return (
    <div
      className="w-full overflow-hidden rounded-lg text-sm border border-slate-200 p-2 bg-slate-50"
    >
      {expanded ? (
        <>
          <h3 className="font-medium">{courseCodeAndName}</h3>
          <div className="flex flex-row items-center">
            <span className="text-blue-500 text-xs cursor-pointer" onClick={() => setExpanded(!expanded)}>–</span>
            <p className="ml-1 whitespace-nowrap text-xs text-slate-600">{metaInfo}</p>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-center">
          {/* <div className="items-center md:w-full"> */}
            <h3 className="font-medium truncate flex-1 whitespace-nowrap" >
              {courseCodeAndName}
            </h3>
            <span className="text-blue-500 text-xs cursor-pointer" onClick={() => setExpanded(!expanded)}>+</span>
          {/* </div> */}
          <p className="ml-1 whitespace-nowrap text-xs text-slate-600 ">{metaInfo}</p>
        </div>
      )}

      <div className="flex flex-row gap-1 flex-wrap mt-1">
        <p className="font-medium text-slate-700">Section Schedule:</p>
        <div className="flex gap-x-1 flex-wrap text-slate-800">
          {section.sectionSchedule.map((sch, index) => (
            <span key={index}>
              {sch.day}-{sch.startTime}-{sch.endTime}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
