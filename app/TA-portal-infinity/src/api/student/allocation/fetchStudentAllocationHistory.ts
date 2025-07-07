import type { Course } from "../../../interfaces/course/Course";
import type Section from "../../../interfaces/section/Section";
import type { Student } from "../../../interfaces/user/Student";

interface AllocationHistoryResponse {
  student: Student;
  course: Course;
  semester: string;
  year: number;
}

export async function fetchStudentAllocationHistory(studentId: number): Promise<Section[]> {
  const url = `http://localhost:8080/courses/studentTaught/${studentId}`;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if(!res.ok) return [];
    const data: AllocationHistoryResponse[] = await res.json();

    const sections: Section[] = data.map((d) => {
      return {
          semester: d.semester,
          year: d.year,
          course:{
            id: d.course.id,
            name: d.course.name,
            deptCode: d.course.deptCode,
            courseNum: d.course.courseNum,
          }
      };
    });

    return sections;
  } catch (err) {
    console.error("Failed to fetch user details:", err);
    return [];
  }
}
