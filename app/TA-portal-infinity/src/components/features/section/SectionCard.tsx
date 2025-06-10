import type Section from "../../../interfaces/section/Section";

export default function SectionCard({ section }: { section: Section }) {
  return (
    <div className="grid rounded-lg text-sm border border-slate-200 p-1 space-y-1 bg-slate-50">

      <div className="flex flex-row">
        <h3 className="font-medium">{`${section.sectionDetails.deptCode} ${section.sectionDetails.courseNum} ${section.sectionDetails.section} - ${section.sectionDetails.name}`}</h3>
        <p className="ml-1">{` | ${section.sectionDetails.type} | ${section.sectionDetails.term}`}</p>
      </div>
      <div className="flex flex-row gap-1">
        <p>Section Schedule:</p>
        <div className="flex gap-x-1">
          {section.sectionSchedule.map((sch, index) => (
            <span key={index} className="">
              {sch.day}-{sch.startTime}-{sch.endTime}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

