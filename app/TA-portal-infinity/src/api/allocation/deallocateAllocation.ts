// src/api/allocation/deallocateAllocation.ts

/**
 * Calls the backend to deallocate (remove) an allocation by its ID.
 * @param allocationId The allocation ID to deallocate
 * @param token Optional Bearer token for authentication
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function deallocateAllocation(allocationId: number, token?: string): Promise<boolean> {
  const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
  const resp = await fetch(`http://localhost:8080/allocations/deallocate/${allocationId}`, {
    method: 'DELETE',
    headers,
  });
  return resp.ok;
}
