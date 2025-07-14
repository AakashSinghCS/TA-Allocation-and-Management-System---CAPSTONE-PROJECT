
import type { FilterSectionsProps } from "../../api/course/sectionfilter/fetchFilteredSections";
import type Section from "../../interfaces/section/Section";

import type SectionSchedule from "../../interfaces/section/SectionSchedule";

// Interface matching the backend CourseSectionScheduleDto
interface CourseSectionScheduleDto {
  sectionId: number;
  courseId: number;
  deptCode: string;
  name: string;
  courseNum: string;
  section: string;
  year: number;
  semester: string;
  type: string;
  day: string;
  startTime: string;
  endTime: string;
  isCourse: boolean;
}


export function convertFilterSectionsToSections(
  filters: FilterSectionsProps[]
): Section[] {
  // Use a Map keyed by sectionId (or a fallback key if null)
  const bySection = new Map<number, Section>();

  for (const f of filters) {
    // key on sectionId if present, otherwise on a fixed string
    if(!f.sectionId) continue;
    const key = f.sectionId;

    // if we haven't seen this section yet, create its container
    if (!bySection.has(key)) {
      const details: Section = {
        // fields from Course
        course:{
        id:         f.courseId   ?? undefined,
        name:       f.name       ?? undefined,
        deptCode:   f.deptCode   ?? undefined,
        courseNum:  f.courseNum  ?? undefined,
        },

        id:  f.sectionId  ?? undefined,
        semester:   f.semester   ?? undefined,
        section:    f.section    ?? undefined,
        type:       f.type as any       ?? undefined,
        year:       f.year       ?? undefined,
      };

      bySection.set(key, {
        ...details,
        sectionSchedule: [],       // start empty
        // you can omit or leave these undefined if you don't need them right now:
        need:            undefined,
        hasCompleted:    undefined,
        allocations:     undefined,
        instructor:      undefined,
      });
    }

    // now push this row’s schedule info into that section’s schedule array
    const sec = bySection.get(key)!;
    const sched: SectionSchedule = {
      day: f.day ?? (f as any).scheduleDay ?? "",
      startTime: f.startTime ?? "",
      endTime:   f.endTime ?? "",
      sectionId: f.sectionId,
    };
    
    if(sec.sectionSchedule)sec.sectionSchedule.push(sched);
  }

  // return as a plain array
  return Array.from(bySection.values());
}
