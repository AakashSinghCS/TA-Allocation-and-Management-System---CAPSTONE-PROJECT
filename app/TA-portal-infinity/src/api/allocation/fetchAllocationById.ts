import type { Allocation } from '../../interfaces/allocation/Allocation';

export async function fetchAllocationById(id: number): Promise<Allocation> {
      const token = localStorage.getItem("token");
  const url = `http://localhost:8080/allocations/${id}`;
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
