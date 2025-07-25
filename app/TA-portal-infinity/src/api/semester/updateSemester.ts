import type { SemesterUpdate } from "../../interfaces/semester/Semester";

/**
 * Update a semester by ID
 * PUT localhost:8080/semesters/update/1
 */
export async function updateSemester(id: number, semester: SemesterUpdate, token: string): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:8080/semesters/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(semester),
    });

    if (!response.ok) {
      console.error("Failed to update semester:", response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating semester:", error);
    return false;
  }
}
