/**
 * Delete a semester by ID
 * DELETE localhost:8080/semesters/delete/1
 */
export async function deleteSemester(id: number, token: string): Promise<boolean> {
  const response = await fetch(`http://localhost:8080/semesters/delete/${id}`, {
    method: "DELETE",
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

  return true;
}
