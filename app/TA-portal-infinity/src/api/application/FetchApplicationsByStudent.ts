import type { ApplicationDto } from '../../interfaces/application/Application';

export async function fetchApplicationsByStudent(
  userId: number,
  token: string
): Promise<ApplicationDto[]> {
  const res = await fetch(`http://localhost:8080/applications/getAll/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error(`Failed fetching applications: ${res.status} ${res.statusText}`);
  }
  const applications = await res.json();
  console.log('Fetched applications:', applications);
  return applications;
  
}
