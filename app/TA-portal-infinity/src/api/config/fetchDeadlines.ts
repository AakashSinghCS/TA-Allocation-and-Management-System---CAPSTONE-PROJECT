import type { Allocation } from '../../interfaces/allocation/Allocation';

/**
 * Fetch deadline configurations (allocations with deadlines) from server.
 * GET http://localhost:8080/config
 * @param token Optional auth token
 * @returns Array of Allocation objects or null on error
 */
export async function fetchDeadlines(token?: string): Promise<Allocation[] | null> {
  const url = 'http://localhost:8080/config';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) {
      console.error('Failed to fetch deadlines, status:', res.status);
      return null;
    }
    const data = await res.json();
    return data as Allocation[];
  } catch (err) {
    console.error('Error fetching deadlines:', err);
    return null;
  }
}
