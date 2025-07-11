import type { FilterSectionsProps } from "../../api/sectionfilter/fetchFilteredSections";
import type Section from "../../interfaces/section/Section";
import type { SectionDetails } from "../../interfaces/section/SectionDetails";
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
  scheduleDay: string;
  startTime: string;
  endTime: string;
  isCourse: boolean;
}


export function convertFilterSectionsToSections(
  filters: CourseSectionScheduleDto[]
): Section[] {
  // Use a Map keyed by sectionId (or a fallback key if null)
  const bySection = new Map<number, Section>();

  for (const f of filters) {
    // key on sectionId if present, otherwise on a fixed string
    const key = f.sectionId;

    // if we haven't seen this section yet, create its container
    if (!bySection.has(key)) {
      const details: SectionDetails = {
        // fields from Course
        id:         f.courseId,
        name:       f.name,
        deptCode:   f.deptCode,
        courseNum:  f.courseNum,
        // fields specific to SectionDetails
        sectionId:  f.sectionId,
        semester:   f.semester,
        section:    f.section,
        type:       f.type as any,
        year:       f.year,
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
      day:       f.scheduleDay,
      startTime: f.startTime,
      endTime:   f.endTime,
      sectionId: f.sectionId,
    };
    
    if(sec.sectionSchedule)sec.sectionSchedule.push(sched);
  }

  // return as a plain array
  return Array.from(bySection.values());
}
