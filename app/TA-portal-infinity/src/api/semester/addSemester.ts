import type { SemesterCreate } from "../../interfaces/semester/Semester";

/**
 * Add a new semester
 * POST localhost:8080/semesters/add
 */
export async function addSemester(semester: SemesterCreate, token: string): Promise<boolean> {
  const response = await fetch("http://localhost:8080/semesters/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(semester),
  });

  if (!response.ok) {
    // Create error object with response details for proper error handling
    const errorData = await response.text();
    const error = new Error(errorData || `HTTP ${response.status}`);
    (error as any).response = {
      status: response.status,
      data: errorData
    };
    throw error;
  }

  return true;
}
