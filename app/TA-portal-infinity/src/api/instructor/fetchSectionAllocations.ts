import type { Allocation } from "../../interfaces/allocation/Allocation";

/**
 * Fetch all allocations for a specific section from the ApplicationService
 * This uses the endpoint that includes the proper status field
 */
export async function fetchSectionAllocations(sectionId: number): Promise<Allocation[] | null> {
  const token = localStorage.getItem("token");
  const url = `http://localhost:8080/allocations/filter/section/${sectionId}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) return null;
    
    const data = await res.json();
    console.log(`Fetched allocations for section ${sectionId}:`, data);
    
    return data;
  } catch (err) {
    console.error(`Error fetching allocations for section ${sectionId}:`, err);
    return null;
  }
}
