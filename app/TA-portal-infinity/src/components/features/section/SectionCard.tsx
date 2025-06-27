import type Section from "../../../interfaces/section/Section";

export default function SectionCard({ section }: { section: Section }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 space-y-1 bg-slate-50">
      <h3 className="font-medium">{section.sectionDetails.name}</h3>
      <p>{`${section.sectionDetails.deptCode} ${section.sectionDetails.courseNum} ${section.sectionDetails.section}`}</p>
      <p className="text-slate-600">{section.sectionDetails.term}</p>
    </div>
  );
}

