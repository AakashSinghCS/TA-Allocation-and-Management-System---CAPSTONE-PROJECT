import type Section from "../../interfaces/section/Section";
import type { SectionType } from "../../interfaces/section/SectionDetails";

interface BackendCourse {
  id: number;
  deptCode: string;
  name: string;
  courseNum: string;
}

interface SectionDto {
  id: number;           // this is the section’s PK
  year: number;
  semester: string;
  section: string;      // e.g. "001"
  type: string;         // your SectionType
  course: BackendCourse;
}

export async function fetchGetInstructorSections(
  userId: number
): Promise<Section[]> {
  const url = `http://localhost:8080/sections/getInstructorSections/${userId}`;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      console.error("Request failed with status:", res.status);
      return [];
    }

    const dtos: SectionDto[] = await res.json();

    return dtos.map((d) => ({
      id: d.id,
      year: d.year,
      semester: d.semester,
      section: d.section,
      type: d.type as SectionType,
      course: {
        id: d.course.id,
        deptCode: d.course.deptCode,
        name: d.course.name,
        courseNum: d.course.courseNum,
      }
    }));
  } catch (err) {
    console.error("Failed to fetch instructor sections:", err);
    return [];
  }
}
