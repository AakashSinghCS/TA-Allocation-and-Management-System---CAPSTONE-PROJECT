import type { Allocation } from '../../interfaces/allocation/Allocation';

/**
 * Fetch allocations filtered by isConfirmed status.
 * @param isConfirmed true for confirmed, false for pending
 * @param token  auth token for protected endpoints
 */
export async function fetchAllocationByIsConfirmed(isConfirmed: boolean, token?: string): Promise<Allocation[]> {
  const url = `http://localhost:8080/allocations/filter/confirmed/${isConfirmed}`;
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
