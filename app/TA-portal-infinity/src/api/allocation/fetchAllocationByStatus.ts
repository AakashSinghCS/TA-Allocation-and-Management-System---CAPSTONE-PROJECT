import type { Allocation } from '../../interfaces/allocation/Allocation';

/**
 * Fetch allocations filtered by status.
 * @param status ApplicationStatus string (e.g. 'CONFIRMED', 'REJECTED', 'SENT')
 * @param token  auth token for protected endpoints
 */
export async function fetchAllocationByStatus(status: string, token?: string): Promise<Allocation[]> {
  const url = `http://localhost:8080/allocations/filter/status/${status}`;
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
