import SectionCard from "../sectioncard/SectionCard";
import type Section from '../../../../interfaces/section/Section';

interface SectionProps {
  sections?: Section[];
  className?: string;
}

export default function SectionsColumn({ sections = [], className = "" }: SectionProps) {
  return (
    <section className={className}>
      {sections.length ? (
        <div className="grid gap-1">
          {sections.map(sec => (
            <SectionCard key={sectionKey(sec)} section={sec} />
          ))}
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