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

export async function fetchAllSectionsAndNeedAndAllocations(instructorId: number): Promise<Section[] | null> {
  const token = localStorage.getItem("token");
  const url = `http://localhost:8080/courses/needAndAllocations/${instructorId}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data: SectionsAndNeedAndAllocations[] = await res.json();

    if (!res.ok) return null;
    const sections: Section[] = data.map((res) => {
      const sectionDetails: Section = {
        id: res.section.id,
        semester: res.section.semester,
        section: res.section.section,
        type: res.section.type,
        year: res.section.year,
        course: {
          deptCode: res.section.course.deptCode,
          courseNum: res.section.course.courseNum,
          name: res.section.course.name,
          id: res.section.course.id
        }

      }
      const section: Section = { ...sectionDetails, need: res.need, allocations: res.allocations }
      return section;
    })

    if (Array.isArray(data)) return sections;
    return null;
  } catch (err) {
    return null;
  }
}
