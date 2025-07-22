import type { Allocation } from "../../interfaces/allocation/Allocation";
import type { Course } from "../../interfaces/course/Course";
import type { Need } from "../../interfaces/need/Need";
import type Section from "../../interfaces/section/Section";
import type { SectionType } from "../../interfaces/section/SectionDetails";

interface SectionDto {
  id: number,
  year: number,
  semester: string,
  section: string,
  type: SectionType,
  course: Course
}

interface SectionsAndNeedAndAllocations {
  section: SectionDto,
  need: Need,
  allocations: Allocation[]
}

export interface SectionsNeedsAndAllocations {
  section: Section[];
  need: Need;
  allocations: Allocation[];
}

export async function fetchSectionNeedAndAllocations(instructorId: number, courseId:number | null, year: number, semester:string): Promise<Section[] | null> {
    const token = localStorage.getItem("token");
  let url = `http://localhost:8080/courses/needAndAllocations/specific/${instructorId}`
          + `?year=${year}&semester=${semester}`;
  if (courseId != null) {
    url += `&courseId=${courseId}`;
  }

  try {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) return null;
  const data: SectionsAndNeedAndAllocations[] = await res.json();

  return data.map((entry) => ({
    id: entry.section.id,
    semester: entry.section.semester,
    section: entry.section.section,
    type: entry.section.type,
    year: entry.section.year,
    course: {
      id: entry.section.course.id,
      deptCode: entry.section.course.deptCode,
      courseNum: entry.section.course.courseNum,
      name: entry.section.course.name,
    },
    need: entry.need,
    allocations: entry.allocations,
  }));
  } catch (err) {
    return null;
  }
}
