import type { Semester } from "../../interfaces/semester/Semester";

/**
 * Get a specific semester by ID
 * GET localhost:8080/semesters/1
 */
export async function getSemesterById(id: number, token: string): Promise<Semester | null> {
  try {
    const response = await fetch(`http://localhost:8080/semesters/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch semester:", response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching semester:", error);
    return null;
  }
}
