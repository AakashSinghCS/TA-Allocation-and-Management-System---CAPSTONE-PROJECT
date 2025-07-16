import type Section from '../../interfaces/section/Section';
import type  SectionDetails  from '../../interfaces/section/SectionDetails';
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

  // Fetch need (handle 404)
  let needData: Need | undefined = undefined;
  try {
    const needRes = await fetch(
      `http://localhost:8080/needs/get/${courseId}/${year}/${semester}`,
      { headers }
    );
    if (needRes.ok) {
      needData = await needRes.json();
    } else if (needRes.status !== 404) {
      throw new Error(`Failed to fetch need: ${needRes.status} ${needRes.statusText}`);
    }
    // If 404, needData as undefined
  } catch (err) {
    if (!(err instanceof Response && err.status === 404)) {
      throw err;
    }
    // else, ignore 404
  }

  // Assemble SectionDetails
  const sectionDetails: SectionDetails = {
    id: sectionData.id,
    year:      sectionData.year,
    semester:  sectionData.semester,
    section:   sectionData.section,
    type:      sectionData.type,
    course:{
      id:        courseData.id,
     deptCode:  courseData.deptCode,
      name:      courseData.name,
      courseNum: courseData.courseNum,
    }
  };

  // Build full Section
  return {
    ...sectionDetails,
    sectionSchedule: sectionSchedules,
    need:            needData,
  };
}
