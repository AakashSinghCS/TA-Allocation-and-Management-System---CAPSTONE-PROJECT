import type { Allocation } from '../../interfaces/allocation/Allocation';
import type RawAllocationDto from '../../interfaces/allocation/RawAllocationDto';

export async function fetchAllocationByApplicationId(applicationId: number, noContentAllowed=false): Promise<Allocation | null> {
  const url = new URL(`http://localhost:8080/allocations/filter/application/${applicationId}`);
  const token = localStorage.getItem("token");
  url.searchParams.set('noContentAllowed', String(noContentAllowed));

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url.toString(), { headers });

  if (res.status === 204) {
    return null;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  const raw: RawAllocationDto = await res.json();

    const allocation: Allocation = {
      id: raw.id,
      student: raw.student,
      application: raw.applicationDto,
      status: raw.status as any,
      labPrepHours: raw.labPrepHours,
      gradingHours: raw.gradingHours,
      sectionHours: raw.sectionHours,
      allocatedSections: raw.allocatedSections,
    };

    console.log(allocation);
    return allocation;

}
