import type { Allocation } from '../../interfaces/allocation/Allocation';

/**
 * Fetch allocation history for a student by studentId.
 * @param studentId The student's unique ID
 * @param token (optional) auth token for protected endpoints
 * @returns Promise<Allocation[]>
 */
export async function fetchStudentAllocationHistory(studentId: number, token?: string): Promise<Allocation[]> {
  const url = `http://localhost:8080/allocations/student/${studentId}/history`;
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
