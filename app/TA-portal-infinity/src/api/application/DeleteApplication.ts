/**
 * Delete an application by student ID, year and semester.
 * @param studentId The ID of the student.
 * @param year The year of the application.
 * @param semester The semester of the application.
 * @param token The user's authentication token.
 * @param userId The requesting user's ID.
 * @param userRoles The user's roles.
 * @returns A promise that resolves to true if deleted, throws on error.
 */

export async function deleteApplication(
  studentId: number,
  year: number,
  semester: string,
  token: string,
  userId: number | string,
  userRoles: string[]
): Promise<boolean> {
  const rolesHeader = userRoles
    .map(r => r.startsWith('ROLE_') ? r : `ROLE_${r}`)
    .join(',');
  const res = await fetch(`http://localhost:8080/applications/delete/${studentId}/${year}/${semester}`, {
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