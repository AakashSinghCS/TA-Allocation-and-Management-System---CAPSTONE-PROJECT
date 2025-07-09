import type { Allocation as AllocationHistoryDto } from '../../interfaces/allocation/Allocation';

/**
 * Import past allocations.
 * @param data json body
 * @param token auth token for protected endpoints
 */
export async function fetchImportAllocations(
  data: Record<string, string>[],
  token?: string
): Promise<AllocationHistoryDto[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch('http://localhost:8080/allocations/import', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(` ${message}`);
  }

  return await response.json();
}