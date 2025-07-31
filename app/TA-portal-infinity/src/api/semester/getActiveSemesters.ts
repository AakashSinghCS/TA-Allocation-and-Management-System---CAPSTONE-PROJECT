import type { Semester } from "../../interfaces/semester/Semester";

/**
 * Get active semesters
 * GET localhost:8080/semesters/getActive
 */
export async function getActiveSemesters(token: string): Promise<Semester[]> {
  const response = await fetch("http://localhost:8080/semesters/getActive", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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

  return await response.json();
}
