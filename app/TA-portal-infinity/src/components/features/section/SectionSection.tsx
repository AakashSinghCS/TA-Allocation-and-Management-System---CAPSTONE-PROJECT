import type Section from "../../../interfaces/Section";

interface Props {
  sections?: Section[];      
  className?: string;
}

export default function SectionSection({ sections = [], className = "" }: Props) {
  return (
    <section className={className}>
      <h2 className="text-xl font-semibold mb-2">Courses</h2>

      {sections.length ? (
        <div className="grid gap-3">
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

function SectionCard({ section }: { section: Section }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 space-y-1 bg-slate-50">
      <h3 className="font-medium">{section.name}</h3>
      <p>{`${section.deptCode} ${section.courseNum} ${section.section}`}</p>
      <p className="text-slate-600">{section.term}</p>
    </div>
  );
}

const sectionKey = (s: Section) => `${s.deptCode}-${s.courseNum}-${s.section}`;
