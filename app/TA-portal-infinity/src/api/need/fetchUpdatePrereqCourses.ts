import type { Need } from "../../interfaces/need/Need";

export async function fetchUpdatePrereqCourses(courseId: number, year : number, semester:string, ids:number[]): Promise<boolean | null> {
  const token = localStorage.getItem("token");
//   const BASE = `http://localhost:8080/needs/update/${need.courseId}/${need.year}/${need.semester}/aaa`;
const BASE = '';

  try {
    const res = await fetch(BASE, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    //   body: JSON.stringify(need),
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