// src/utils/sectionMapper.ts


import type { Course } from '../../interfaces/course/Course';
import type { Instructor } from '../../interfaces/user/Instructor';
import type SectionSchedule from '../../interfaces/section/SectionSchedule';
import type Section from '../../interfaces/section/Section';
import type { SectionType } from '../../interfaces/section/SectionDetails';
import type SectionDetails from '../../interfaces/section/SectionDetails';

export interface SectionDtoWithInstructorId{
    id: number;
    instructorId : number;
    year: number;
    semester : string;
    section : string;
    type : SectionType;
    course: Course;
    numberOfTAsAllocated: number;
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
    id:        dto.id,
    year:             dto.year,
    semester:         dto.semester,
    section:          dto.section,
    type:             dto.type,
    course:{
      id: dto.course.id,
      name:             dto.course.name,
      deptCode:         dto.course.deptCode,
      courseNum:        dto.course.courseNum,
    },
    numberOfTAsAllocated: dto.numberOfTAsAllocated
  };

  return {
    ...details,
    sectionSchedule: schedules,
    // instructorId was on the DTO; if you fetched an instructor, pass it in, otherwise undefined:
    instructor:      instructor ?? undefined,
    // need, hasCompleted, allocations all remain undefined
  };
}
