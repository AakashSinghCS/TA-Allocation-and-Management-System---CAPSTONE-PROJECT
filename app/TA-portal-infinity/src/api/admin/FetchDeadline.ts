import type { DeadlineDto } from "../../interfaces/admin/Deadline";

/**
 * Fetch all deadlines
 */
export async function fetchDeadlines(
  token: string,
//   roles: string[]
): Promise<DeadlineDto[]> {
//   const rolesHeader = roles.map(r => r.startsWith("ROLE_") ? r : `ROLE_${r}`).join(",");

  const resp = await fetch(`http://localhost:8080/config`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    //   "X-User-Roles": rolesHeader
    }
  });

  if (!resp.ok) {
    throw new Error(`Failed to fetch deadlines: ${resp.status}`);
  }

  return await resp.json();
}

/**
 * Update a deadline by name
 */
export async function updateDeadline(
  name: string,
  dto: DeadlineDto,
  token: string,
): Promise<DeadlineDto> {

  const resp = await fetch(
    `http://localhost:8080/config/update/${encodeURIComponent(name)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(dto)
    }
  );

  if (!resp.ok) {
    throw new Error(`Failed to update deadline: ${resp.status}`);
  }

  return await resp.json();
}

/**
 * Delete a deadline by name
 */
export async function deleteDeadline(
  name: string,
  token: string,
): Promise<DeadlineDto> {

  const resp = await fetch(
    `http://localhost:8080/config/delete/${encodeURIComponent(name)}`,
    {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    }
  );

  if (!resp.ok) {
    throw new Error(`Failed to delete deadline: ${resp.status}`);
  }

  return await resp.json();
}
