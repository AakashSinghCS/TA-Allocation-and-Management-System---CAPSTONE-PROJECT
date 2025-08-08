import type { Course } from "../../interfaces/course/Course";

const BASE = "http://localhost:8080/courses/addCourse";

export interface CourseAddDtoRequest{
    deptCode? : string | undefined;
    name ?: string | undefined;
    courseNum? : string | undefined;
}

export async function fetchCreateCourse(req:CourseAddDtoRequest ): Promise<Course | null> {
  const token = localStorage.getItem("token");
  
  try {
    const res = await fetch(BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(req),

    });
    if (!res.ok) {
      console.error("Request failed with status:", res.status);
      return null;
    }
    return res.json();
  } catch {
    console.log("something went wrong");
    return null;
  }
}