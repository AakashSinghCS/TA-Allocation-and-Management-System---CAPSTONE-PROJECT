import type { CourseEnrollmentOverview } from "../../interfaces/course/CourseEnrollment";


export async function fetchAllStudentEnrollmentOverview(studentId: number): Promise<CourseEnrollmentOverview | null> {
  const BASE = `http://localhost:8080/enrollments/overview/${studentId}`;
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
    const response : CourseEnrollmentOverview = await res.json();
    return response;
  } catch (err) {
    console.error("Something went wrong:", err);
    return null;
  }
}

