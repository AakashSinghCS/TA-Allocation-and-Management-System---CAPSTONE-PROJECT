import type Section from '../../interfaces/section/Section';
import type { SectionDetails } from '../../interfaces/section/SectionDetails';
import type SectionSchedule from '../../interfaces/section/SectionSchedule';
import type { Course } from '../../interfaces/course/Course';
import type { Need } from '../../interfaces/need/Need';

export async function fetchSectionInfo(
  sectionId: number,
  token: string
): Promise<Section> {
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch section details
  const sectionRes = await fetch(
    `http://localhost:8080/sections/get/${sectionId}`,
    { headers }
  );
  if (!sectionRes.ok) {
    throw new Error(`Failed to fetch section: ${sectionRes.status} ${sectionRes.statusText}`);
  }
  const sectionData = await sectionRes.json();

  const courseId = sectionData.course?.id!;
  const year     = sectionData.year;
  const semester = sectionData.semester;

  // Fetch schedules
  const scheduleRes = await fetch(
    `http://localhost:8080/sections/getSectionSchedules/${sectionId}`,
    { headers }
  );
  if (!scheduleRes.ok) {
    throw new Error(`Failed to fetch section schedules: ${scheduleRes.status} ${scheduleRes.statusText}`);
  }
  const sectionSchedules: SectionSchedule[] = await scheduleRes.json();

  // Fetch course details
  const courseRes = await fetch(
    `http://localhost:8080/courses/${courseId}`,
    { headers }
  );
  if (!courseRes.ok) {
    throw new Error(`Failed to fetch course: ${courseRes.status} ${courseRes.statusText}`);
  }
  const courseData: Course = await courseRes.json();

  // Fetch need
  const needRes = await fetch(
    `http://localhost:8080/needs/get/${courseId}/${year}/${semester}`,
    { headers }
  );
  if (!needRes.ok) {
    throw new Error(`Failed to fetch need: ${needRes.status} ${needRes.statusText}`);
  }
  const needData: Need = await needRes.json();

  // Assemble SectionDetails
  const sectionDetails: SectionDetails = {
    sectionId: sectionData.id,
    year:      sectionData.year,
    semester:  sectionData.semester,
    section:   sectionData.section,
    type:      sectionData.type,
    id:        courseData.id,
    deptCode:  courseData.deptCode,
    name:      courseData.name,
    courseNum: courseData.courseNum,
  };

  // Build full Section
  return {
    sectionDetails,
    sectionSchedule: sectionSchedules,
    need:            needData,
  };
}
