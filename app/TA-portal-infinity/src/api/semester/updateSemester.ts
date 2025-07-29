import type { SemesterUpdate } from "../../interfaces/semester/Semester";

/**
 * Update a semester by ID
 * PUT localhost:8080/semesters/update/1
 */
export async function updateSemester(id: number, semester: SemesterUpdate, token: string): Promise<boolean> {
  const response = await fetch(`http://localhost:8080/semesters/update/${id}`, {
    method: "PUT",
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
