/**
 * Delete a semester by ID
 * DELETE localhost:8080/semesters/delete/1
 */
export async function deleteSemester(id: number, token: string): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:8080/semesters/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      console.error("Failed to delete semester:", response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting semester:", error);
    return false;
  }
}
