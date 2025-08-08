import type { StudentOrInstructorOrCoordinator } from "../../interfaces/user/User";

//TODO: when backend unifies the two mappings, instructor and student, change the mapping here as well.
const BASE = "http://localhost:8080/users/profile";


export async function fetchUserDetails<StudentOrInstructorOrCoordinator>(userId: number): Promise<StudentOrInstructorOrCoordinator> {
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
    // console.log(data);
    return data as StudentOrInstructorOrCoordinator;

  } catch (err) {
    console.error("Failed to fetch user details:", err);
    return ({} as StudentOrInstructorOrCoordinator);
  }
}
