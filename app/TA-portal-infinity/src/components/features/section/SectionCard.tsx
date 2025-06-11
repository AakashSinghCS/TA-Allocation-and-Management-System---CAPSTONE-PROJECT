import type Section from "../../../interfaces/section/Section";

export default function SectionCard({ section }: { section: Section }) {

  return (
    <div
      className="w-full overflow-hidden rounded-lg text-sm border border-slate-200 p-2 bg-slate-50"
    >
      <div className="flex flex-wrap items-center">
        <h3 className="font-medium truncate flex-1 whitespace-nowrap" >
          {section.sectionDetails.deptCode} {section.sectionDetails.courseNum} {section.sectionDetails.section} - {section.sectionDetails.name}
        </h3>
        <p className="ml-1 whitespace-nowrap text-xs text-slate-600 ">| {section.sectionDetails.type} | {section.sectionDetails.term}</p>
      </div>
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
