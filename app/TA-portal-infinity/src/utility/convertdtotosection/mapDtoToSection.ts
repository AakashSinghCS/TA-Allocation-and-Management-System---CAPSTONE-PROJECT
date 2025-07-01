// src/utils/sectionMapper.ts

import type { SectionDetails, SectionType } from '../../interfaces/section/SectionDetails';
import type { Course } from '../../interfaces/course/Course';
import type { Instructor } from '../../interfaces/user/Instructor';
import type SectionSchedule from '../../interfaces/section/SectionSchedule';
import type Section from '../../interfaces/section/Section';

export interface SectionDtoWithInstructorId{
    id: number;
    instructorId : number;
    year: number;
    semester : string;
    section : string;
    type : SectionType;
    course: Course;
}


/**
 * Merge a SectionDtoWithInstructorId + schedules + instructor into our UI Section type.
 * Instructor may be null (in which case we leave section.instructor undefined).
 */
export function mapDtoToSection(
  dto: SectionDtoWithInstructorId,
  schedules: SectionSchedule[],
  instructor: Instructor | null
): Section {
  // Flatten CourseDto + SectionDto into our SectionDetails
  const details: SectionDetails = {
    id: dto.course.id,
    sectionId:        dto.id,
    name:             dto.course.name,
    deptCode:         dto.course.deptCode,
    courseNum:        dto.course.courseNum,
    year:             dto.year,
    semester:         dto.semester,
    section:          dto.section,
    type:             dto.type,
  };

  return {
    sectionDetails:  details,
    sectionSchedule: schedules,
    // instructorId was on the DTO; if you fetched an instructor, pass it in, otherwise undefined:
    instructor:      instructor ?? undefined,
    // need, hasCompleted, allocations all remain undefined
  };
}
