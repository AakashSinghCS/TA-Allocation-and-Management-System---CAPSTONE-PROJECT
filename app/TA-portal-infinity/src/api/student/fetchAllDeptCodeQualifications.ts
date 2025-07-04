import type { Course } from "../../interfaces/course/Course";
import type Qualification from "../../interfaces/qualification/Qualification";

export interface DeptCodeQualificationResponse {
  qualification: Qualification;
  course: Course;
}

interface BackendQualification {
  id: number;
  description: string;
  deptCode: string;
  course: {
    id: number;
    name: string;
    deptCode: string;
    courseNum: string;
  };
}

export async function fetchAllDeptCodeQualifications(
  deptCode: string
): Promise<DeptCodeQualificationResponse[] | null> {
  const BASE = `http://localhost:8080/qualifications/byDepartment/${deptCode}`;
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

    // parse once into the raw backend shape
    const rawList: BackendQualification[] = await res.json();
    console.log(rawList);
    // transform into DeptCodeQualificationResponse[]
    return rawList.map((bq) => ({
      qualification: {
        id:          bq.id,
        description: bq.description,
        deptCode:    bq.course.deptCode,
      },
      course: {
        id:       bq.course.id,
        name:     bq.course.name,
        deptCode: bq.course.deptCode,
        courseNum:bq.course.courseNum,
      },
    }));
  } catch (err) {
    console.error("Something went wrong:", err);
    return null;
  }
}
