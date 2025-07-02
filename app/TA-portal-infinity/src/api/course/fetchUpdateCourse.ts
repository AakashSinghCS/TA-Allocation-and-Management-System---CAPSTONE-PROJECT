import type { Course } from "../../interfaces/course/Course";

export async function fetchUpdateCourse(courseId:number, req: Course): Promise<boolean | null> {
    const BASE = `http://localhost:8080/courses/updateCourse/${courseId}`;
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(BASE, {
      method: "PUT",
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
    return res.ok;
  } catch {
    console.log("something went wrong");
    return null;
  }
}