import type { StudentOrInstructorOrCoordinator } from "../../interfaces/user/User";

const BASE = "http://localhost:8080/users/students";

export async function fetchStudentDetails<StudentOrInstructorOrCoordinator>(userId: number): Promise<StudentOrInstructorOrCoordinator> {
  const url = `${BASE}/${userId}`;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await res.json();

    return data as StudentOrInstructorOrCoordinator;

  } catch (err) {
    console.error("Failed to fetch user details:", err);
    return ({} as StudentOrInstructorOrCoordinator);
  }
}
