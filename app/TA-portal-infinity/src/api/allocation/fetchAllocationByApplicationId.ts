import type { Allocation } from '../../interfaces/allocation/Allocation';

/**
 * Fetch allocations filtered by applicationId.
 * @param applicationId application id to filter by
 * @param token (optional) auth token for protected endpoints
 */
export async function fetchAllocationByApplicationId(applicationId: number, token?: string): Promise<Allocation[]> {
  const url = `http://localhost:8080/allocations/filter/application/${applicationId}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}
