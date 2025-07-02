import type { Need } from "../../interfaces/need/Need";

export async function fetchGetNeed(courseId: number, year: number,  semester : string): Promise<Need | null> {
  const BASE = `http://localhost:8080/needs/get/${courseId}/${year}/${semester}`;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(BASE, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if(!res.ok) return null;

    const data = await res.json();
    return data;
    // return data as Instructor;
    // return mockInstructorChed;
    
  } catch (err) {
    console.error("Failed to fetch details:", err);
    // return ({} as Instructor);
    // return mockInstructorChed;
    return null;
  }
}
