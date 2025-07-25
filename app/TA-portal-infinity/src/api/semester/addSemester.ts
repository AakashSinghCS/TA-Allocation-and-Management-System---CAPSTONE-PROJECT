import type { SemesterCreate } from "../../interfaces/semester/Semester";

/**
 * Add a new semester
 * POST localhost:8080/semesters/add
 */
export async function addSemester(semester: SemesterCreate, token: string): Promise<boolean> {
  try {
    const response = await fetch("http://localhost:8080/semesters/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(semester),
    });

    if (!response.ok) {
      console.error("Failed to add semester:", response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error adding semester:", error);
    return false;
  }
}
