import type { ApplicationDto } from '../../interfaces/application/Application';

export async function fetchApplications(
  userId: number,
  token: string
): Promise<ApplicationDto[]> {
  const res = await fetch(`http://localhost:8080/applications/getAll`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error(`Failed fetching applications: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
