const BASE_URL = "http://localhost:8080/users/delete";

export async function fetchDeleteUser(id: number): Promise<boolean> {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      console.error("Failed to delete user. Status:", res.status);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error during delete:", err);
    return false;
  }
}
