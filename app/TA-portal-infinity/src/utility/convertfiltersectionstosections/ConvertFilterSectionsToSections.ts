import type { FilterSectionsProps } from "../../api/sectionfilter/fetchFilteredSections";
import type Section from "../../interfaces/section/Section";
import type { SectionDetails } from "../../interfaces/section/SectionDetails";
import type SectionSchedule from "../../interfaces/section/SectionSchedule";


export function convertFilterSectionsToSections(
  filters: FilterSectionsProps[]
): Section[] {
  // Use a Map keyed by sectionId (or a fallback key if null)
  const bySection = new Map<number | string, Section>();

  for (const f of filters) {
    // key on sectionId if present, otherwise on a fixed string
    const key = f.sectionId ?? "__NO_SECTION_ID__";

    // if we haven't seen this section yet, create its container
    if (!bySection.has(key)) {
      const details: SectionDetails = {
        // fields from Course
        id:         f.courseId   ?? undefined,
        name:       f.name       ?? undefined,
        deptCode:   f.deptCode   ?? undefined,
        courseNum:  f.courseNum  ?? undefined,
        // fields specific to SectionDetails
        sectionId:  f.sectionId  ?? undefined,
        semester:   f.semester   ?? undefined,
        section:    f.section    ?? undefined,
        type:       f.type       ?? undefined,
        year:       f.year       ?? undefined,
      };

      bySection.set(key, {
        sectionDetails:  details,
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
      day:       f.day       ?? undefined,
      startTime: f.startTime ?? undefined,
      endTime:   f.endTime   ?? undefined,
      sectionId: f.sectionId ?? undefined,
    };
    
    if(sec.sectionSchedule)sec.sectionSchedule.push(sched);
  }

  // return as a plain array
  return Array.from(bySection.values());
}
