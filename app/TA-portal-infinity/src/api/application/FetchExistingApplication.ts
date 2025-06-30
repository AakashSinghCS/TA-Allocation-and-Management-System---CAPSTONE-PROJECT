import type { ApplicationDto } from '../../interfaces/application/Application';

export async function fetchExistingApplication(
  userId: number,
  year: number,
  token: string,
  roles: string[]
): Promise<ApplicationDto | null> {
  const rolesHeader = roles.map(r => r.startsWith('ROLE_') ? r : `ROLE_${r}`).join(',');

  const resp = await fetch(
    `http://localhost:8080/applications/get/${userId}/${year}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Id':     userId.toString(),
        'X-User-Roles':  rolesHeader
      }
    }
  );

  if (resp.ok) {
    return await resp.json();
  }

  return null;
}
