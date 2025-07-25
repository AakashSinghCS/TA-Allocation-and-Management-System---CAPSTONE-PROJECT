import type PageableResponse from '../../interfaces/admin/audit/PageableResponse';
import type { ApplicationDto } from '../../interfaces/application/Application';

export async function fetchApplications(
  userId: number,
  token: string
): Promise<ApplicationDto[]> {
  const res = await fetch(`http://localhost:8080/applications/getAll`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error(`Failed fetching applications: ${res.status} ${res.statusText}`);
  }
  const applications = await res.json();
  console.log('Fetched applications:', applications);
  return applications;
  
}

export async function fetchApplicationsPage(
  filters: {
    year?: number;
    wantRemote?: boolean;
    hours?: number;
    preference1?: string;
    preference2?: string;
    preference3?: string;
  },
  page: number,
  size: number,
  token: string
): Promise<PageableResponse<ApplicationDto>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    ...(filters.year != null ? { year: filters.year.toString() } : {}),
    ...(filters.wantRemote != null ? { wantRemote: String(filters.wantRemote) } : {}),
    ...(filters.hours != null ? { hours: filters.hours.toString() } : {}),
    ...(filters.preference1 ? { preference1: filters.preference1 } : {}),
    ...(filters.preference2 ? { preference2: filters.preference2 } : {}),
    ...(filters.preference3 ? { preference3: filters.preference3 } : {}),
  });

  const res = await fetch(`http://localhost:8080/applications/getAll/page?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status} fetching applications`);
  }
  return res.json();
}