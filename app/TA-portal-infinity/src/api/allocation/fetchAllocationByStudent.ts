import { type AllocatedSection, type Allocation } from '../../interfaces/allocation/Allocation';
import type { ApplicationDto } from '../../interfaces/application/Application';
import type Section from '../../interfaces/section/Section';
import type { ApplicationStatus } from '../../interfaces/enum/ApplicationStatus';



interface RawAllocationHistoryDto {
  id: number;
  student: Allocation['student'];
  applicationDto: ApplicationDto;
  status?: ApplicationStatus;
  labPrepHours : number;
  gradingHours : number;
  sectionHours : number;
  allocatedSections: AllocatedSection[];
}

export async function fetchAllocationsByStudent(
  studentId: number,
  token: string,
  noContentAllowed = false 
): Promise<Allocation> {
  const url = new URL(
    `http://localhost:8080/allocations/student/${studentId}/history`
  );
  url.searchParams.set('noContentAllowed', String(noContentAllowed));

  const res = await fetch(
    url.toString(),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  if (res.status === 204) {
    return {};
  }
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || res.statusText);
  }

  const raw: RawAllocationHistoryDto = await res.json();
  const allocation: Allocation = {
    id: raw.id,
    student: raw.student,
    application: raw.applicationDto,
    status: raw.status,
    labPrepHours: raw.labPrepHours,
    gradingHours: raw.gradingHours,
    sectionHours: raw.sectionHours,
    allocatedSections: raw.allocatedSections
  };

  return allocation;
}
