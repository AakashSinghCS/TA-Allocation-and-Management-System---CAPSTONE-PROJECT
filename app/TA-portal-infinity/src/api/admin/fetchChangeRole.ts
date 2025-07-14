

export async function changeRole(
  userId: number,
  token: string,
): Promise<Boolean[]> {

  const resp = await fetch(`http://localhost:8080//users/changeRole/${userId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!resp.ok) {
    throw new Error(`Failed to fetch change roles: ${resp.status}`);
  }

  return await resp.json();
}
