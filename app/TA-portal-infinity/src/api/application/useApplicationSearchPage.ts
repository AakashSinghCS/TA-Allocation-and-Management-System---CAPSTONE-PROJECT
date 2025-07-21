import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type PageableResponse from '../../interfaces/admin/audit/PageableResponse';
import type { ApplicationDto } from '../../interfaces/application/Application';
import { fetchApplicationsPage } from './FetchApplications';

export function useApplicationSearchPage(
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
) {
  const hasAnyFilter = Object.values(filters).some(v => v != null && v !== '');

  return useQuery<PageableResponse<ApplicationDto>, Error>({
    queryKey: ['applicationSearch', filters, page, size],
    queryFn: () => fetchApplicationsPage(filters, page, size, token),
    enabled: hasAnyFilter,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}
