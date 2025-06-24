import { mockDeptCodeQualificationResponse } from "../../mocked-objects/qualification/mockDeptCodeQualificationResponse";

const BASE = "http://localhost:8080/mock";

export async function fetchAllStudentQualifications(studentId: number): Promise<number[] | null> {
  const url = `${BASE}/${studentId}`;
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
    return [1];
    }
    const response : Response = await res.json();
    return [1];
  } catch (err) {
    console.error("Something went wrong:", err);
    // return null;
    return [1];
  }
}

