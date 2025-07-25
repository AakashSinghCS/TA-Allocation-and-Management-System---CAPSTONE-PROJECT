import type { Semester } from "../../interfaces/semester/Semester";

/**
 * Get all semesters
 * GET localhost:8080/semesters/getAll
 */
export async function getAllSemesters(token: string): Promise<Semester[]> {
  try {
    const response = await fetch("http://localhost:8080/semesters/getAll", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch semesters:", response.status);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching semesters:", error);
    return [];
  }
}
