import type { Allocation } from '../../interfaces/allocation/Allocation';
import type { ApplicationDto } from '../../interfaces/application/Application';
import type { SectionType } from '../../interfaces/section/SectionDetails';
import type Section from '../../interfaces/section/Section';

interface RawAllocationHistoryDto {
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

export async function fetchAllocationsByStudent(
  studentId: number,
  token: string
): Promise<Allocation[]> {
  const res = await fetch(
    `http://localhost:8080/allocations/student/${studentId}/history`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || res.statusText);
  }

  const rawList: RawAllocationHistoryDto[] = await res.json();

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
      status: raw.status as any as import('../../interfaces/enum/ApplicationStatus').ApplicationStatus,
      numberOfHours: raw.numberOfHours,
      section: mappedSection,
    };

    return allocation;
  });
}
