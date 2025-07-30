export async function deallocateAllocation(allocationId: number, token?: string): Promise<boolean> {
  const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
  const resp = await fetch(`http://localhost:8080/allocations/deallocate/${allocationId}`, {
    method: 'DELETE',
    headers,
  });
  return resp.ok;
}
