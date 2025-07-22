import type { Course } from "../../interfaces/course/Course";

export async function fetchAllInstructorCourses(
  instructorId: number
): Promise<Course[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `http://localhost:8080/courses/allCourses/${instructorId}`,
    {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  if (!res.ok) return [];
  return (await res.json()) as Course[];
}
