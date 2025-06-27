import type { Course } from "../../interfaces/course/Course";
import type Qualification from "../../interfaces/qualification/Qualification";
import { mockDeptCodeQualificationResponse } from "../../mocked-objects/qualification/mockDeptCodeQualificationResponse";

const BASE = "http://localhost:8080/mock";

export interface DeptCodeQualificationResponse {
    qualification : Qualification,
    course: Course;
}

export async function fetchAllDeptCodeQualifications(): Promise<DeptCodeQualificationResponse[] | null> {
  const url = `${BASE}/`;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      console.error("Request failed with status:", res.status);
    //   return null;
    return mockDeptCodeQualificationResponse;
    }
    const response : Response = await res.json();
    return mockDeptCodeQualificationResponse;
  } catch (err) {
    console.error("Something went wrong:", err);
    // return null;
    return mockDeptCodeQualificationResponse;
  }
}

