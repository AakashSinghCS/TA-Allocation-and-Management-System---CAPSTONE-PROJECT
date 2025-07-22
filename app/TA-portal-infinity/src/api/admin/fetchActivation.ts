export async function fetchActivate(
  userId: number
): Promise<String> {

  const token = localStorage.getItem("token");
  const resp = await fetch(`http://localhost:8080/users/activate/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  if (!resp.ok) {
    throw new Error(`Failed to fetch activate: ${resp.status}`);
  }

  return await resp.text();
}

export async function fetchDeactivate(
  userId: number
): Promise<String> {

  const token = localStorage.getItem("token");
  const resp = await fetch(`http://localhost:8080/users/deactivate/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  if (!resp.ok) {
    throw new Error(`Failed to fetch deactivate: ${resp.status}`);
  }

  return await resp.text();
}