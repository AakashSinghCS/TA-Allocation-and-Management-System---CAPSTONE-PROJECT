import type Qualification from "../../interfaces/qualification/Qualification";
import type Section from "../../interfaces/section/Section";
import type { SectionType } from "../../interfaces/section/SectionDetails";
import { mockInstructorQualificationResponse } from "../../mocked-objects/qualification/mockInstructorQualificationResponse";

interface BackendResponse {
  courseId: number;
  sectionId: number;
  year: number;
  semester: string;
  sectionName: string;
  sectionType: SectionType;
  qualificationId: number;
  courseDeptCode: string;
  qualificationDescription: string;
}

export interface QualificationResponse {
  section: Section;
  qualifications: Qualification[];
}

export async function fetchAllInstructorQualifications(
  instructorId: number
): Promise<QualificationResponse[] | null> {
  const BASE = `http://localhost:8080/qualifications/instructor/${instructorId}`;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(BASE, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      console.error("Request failed with status:", res.status);
      return null;
    }

    const data: BackendResponse[] = await res.json();

    const grouped = new Map<string, QualificationResponse>();

    data.forEach((d) => {
      const key = `${d.courseId}::${d.sectionId}::${d.year}::${d.semester}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          section: {
            id: d.sectionId,
            year: d.year,
            semester: d.semester,
            type: d.sectionType,
            course: {
              id: d.courseId,
              name: d.sectionName,
              deptCode: d.courseDeptCode,
            }
          },
          qualifications: [],
        });
      }

      // now push this qualification onto that section’s list
      grouped.get(key)!.qualifications.push({
        id: d.qualificationId,
        description: d.qualificationDescription,
        deptCode: d.courseDeptCode,
      });
    });

    // return an array of your grouped values
    return Array.from(grouped.values());
  } catch (err) {
    console.error("something went wrong", err);
    return null;
  }
}
