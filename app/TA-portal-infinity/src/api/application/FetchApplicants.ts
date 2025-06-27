import type { Applicant } from '../../interfaces/applicant/Applicant';

export async function fetchApplicants(
  token: string
): Promise<Applicant[]> {
  const res = await fetch('http://localhost:8080/users/applicants', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error(`Failed fetching applicants: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
