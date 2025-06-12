import SectionCard from "../sectioncard/SectionCard";
import type Section from '../../../../interfaces/section/Section';

interface SectionProps {
  sections?: Section[];
  className?: string;
  highlightCourseIds? : number[];
  exactMatchId? : number | null;
}

export default function SectionsColumn({ sections = [], className = "",highlightCourseIds=[], exactMatchId=null }: SectionProps) {
  return (
    <section className={className}>
      {sections.length ? (
        <div className="grid gap-1">
          {sections.map((sec) => {
            const cid = sec.sectionDetails.id;
            const needMatch = highlightCourseIds.includes(cid);
            const exactMatch = exactMatchId === cid;
            let extra = "";
            if (exactMatch)      extra = "outline-2 outline-blue-500";     
            else if (needMatch)  extra = "outline-2 outline-green-400";
            return <SectionCard key={sectionKey(sec)} section={sec} className={extra}/>
          })}
        </div>
      ) : (
        <div className="p-4 text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
          No courses to display
        </div>
      )}
    </section>
  );
}
const sectionKey = (s: Section) => `${s.sectionDetails.deptCode}-${s.sectionDetails.courseNum}-${s.sectionDetails.section}`;