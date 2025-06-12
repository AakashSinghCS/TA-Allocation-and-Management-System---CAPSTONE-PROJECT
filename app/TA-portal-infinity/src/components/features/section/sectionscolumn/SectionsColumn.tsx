import SectionCard from "../sectioncard/SectionCard";
import type Section from '../../../../interfaces/section/Section';

interface SectionProps {
  sections?: Section[];
  className?: string;
  highlightCourseIds? : number[];
}

export default function SectionsColumn({ sections = [], className = "",highlightCourseIds=[] }: SectionProps) {
  return (
    <section className={className}>
      {sections.length ? (
        <div className="grid gap-1">
          {sections.map((sec) => {
            const matched = highlightCourseIds.includes(sec.sectionDetails.id); 
            const extra = matched ? "outline-1 outline-green-400" : ""; 
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