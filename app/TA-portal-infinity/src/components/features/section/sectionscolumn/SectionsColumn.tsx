import SectionCard from "../sectioncard/SectionCard";
import type Section from '../../../../interfaces/section/Section';
import type { Course } from "../../../../interfaces/course/Course";

interface SectionProps {
  sections?: Section[];
  className?: string;
  highlightCourseIds?: number[];
  exactMatchId?: number | null;
  neededCourses?: Course[];
  isStudentView?: boolean
}

export default function SectionsColumn({ sections = [], className = "", highlightCourseIds = [], exactMatchId = null, neededCourses = [] , isStudentView = false}: SectionProps) {

  const displayedIds = new Set(sections.map(s => s.sectionDetails?.id));
  const missing = neededCourses ? neededCourses.filter(c => !displayedIds.has(c.id)) : [];
  const exactMatchExists = sections.filter((sec)=> exactMatchId === sec.sectionDetails?.id).length > 0;

  return (
    <section className={"min-h-[30vh] "+className}>
      {highlightCourseIds.length > 0 && missing.length > 0 && neededCourses.length >0 && (
       <p className="text-xs text-red-600 mt-1 mb-1">
          Missing in section needs:&nbsp;
          {missing.map(c => `${c.deptCode} ${c.courseNum}`).join(', ')}
        </p>
      )}
      {exactMatchExists && (
        <p className="text-xs text-blue-600 mt-1 mb-1">
          There exists an exact match!
        </p>
      )}
      {highlightCourseIds.length > 0 && missing.length == 0 && neededCourses.length>0 && (
        <p className="text-xs text-green-600 mt-1 mb-1">
          No courses missing!
        </p>
      )}
      {sections.length ? (
        <div className="grid gap-1 max-h-[50vh] overflow-y-auto">
          {sections.map((sec) => {
            const cid = sec.sectionDetails?.id;
            const needMatch = cid !== undefined && highlightCourseIds.includes(cid);
            const exactMatch = exactMatchId === cid;
            let extra = "";
            if (exactMatch) extra = "outline-2 outline-offset-[-2px] outline-blue-400";
            else if (needMatch) extra = "outline-2 outline-offset-[-2px] outline-green-400";
            return <SectionCard key={sec.sectionDetails?.id} section={sec} className={extra} isStudentView={isStudentView} big={true}/>
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
