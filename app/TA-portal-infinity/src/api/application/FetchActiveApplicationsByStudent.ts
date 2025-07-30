import type { ApplicationDto } from '../../interfaces/application/Application';

export async function fetchApplicationsByStudent(
  userId: number,
): Promise<ApplicationDto[]> {
      const token = localStorage.getItem("token");
  const res = await fetch(`http://localhost:8080/applications/getAllActive/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error(`Failed fetching active applications: ${res.status} ${res.statusText}`);
  }
  const applications = await res.json();
  console.log('Fetched active applications:', applications);
  return applications;
  
}
