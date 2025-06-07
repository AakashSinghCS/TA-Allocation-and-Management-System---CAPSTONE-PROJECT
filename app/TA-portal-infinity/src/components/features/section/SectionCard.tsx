import type Section from "../../../interfaces/Section";

export default function SectionCard({ section }: { section: Section }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 space-y-1 bg-slate-50">
      <h3 className="font-medium">{section.name}</h3>
      <p>{`${section.deptCode} ${section.courseNum} ${section.section}`}</p>
      <p className="text-slate-600">{section.term}</p>
    </div>
  );
}

