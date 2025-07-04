import type { Allocation } from '../../interfaces/allocation/Allocation';

/**
 * Fetch allocations filtered by applicationId.
 * @param applicationId application id to filter by
 * @param token (optional) auth token for protected endpoints
 */
import type Section from '../../interfaces/section/Section';
import type { SectionType } from '../../interfaces/section/SectionDetails';
import type { ApplicationDto } from '../../interfaces/application/Application';

interface RawAllocationDto {
  id: number;
  student: Allocation['student'];
  applicationDto: ApplicationDto;
  status?: string;
  numberOfHours: number;
  section: {
    id: number;
    term: string | null;
    section: string;
    type: SectionType;
    course: {
      deptCode: string;
      name: string;
      courseNum: string;
    };
  };
}

export async function fetchAllocationByApplicationId(applicationId: number, token?: string): Promise<Allocation[]> {
  const url = `http://localhost:8080/allocations/filter/application/${applicationId}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  const rawList: RawAllocationDto[] = await res.json();

  return rawList.map(raw => {
    const mappedSection: Section = {
      sectionDetails: {
        sectionId: raw.section.id,
        deptCode: raw.section.course.deptCode,
        courseNum: raw.section.course.courseNum,
        name: raw.section.course.name,
        section: raw.section.section,
        type: raw.section.type,
        semester: raw.section.term ?? undefined,
      },
    };

    const allocation: Allocation = {
      id: raw.id,
      student: raw.student,
      application: raw.applicationDto,
      status: raw.status as any,
      numberOfHours: raw.numberOfHours,
      section: mappedSection,
    };

    return allocation;
  });
}
