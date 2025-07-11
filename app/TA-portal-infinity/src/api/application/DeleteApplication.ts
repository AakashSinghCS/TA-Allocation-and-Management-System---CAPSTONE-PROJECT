/**
 * Delete an application by its ID.
 * @param applicationId The ID of the application to delete.
 * @param token The user's authentication token.
 * @returns A promise that resolves to true if deleted, throws on error.
 */

export async function deleteApplication(
  studentId: number,
  token: string,
  userId: number | string,
  userRoles: string[]
): Promise<boolean> {
  const rolesHeader = userRoles
    .map(r => r.startsWith('ROLE_') ? r : `ROLE_${r}`)
    .join(',');
  const res = await fetch(`http://localhost:8080/applications/delete/${studentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-User-Id': userId.toString(),
      'X-User-Roles': rolesHeader,
    },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete application: ${res.status} ${errText}`);
  }
  return true;
}