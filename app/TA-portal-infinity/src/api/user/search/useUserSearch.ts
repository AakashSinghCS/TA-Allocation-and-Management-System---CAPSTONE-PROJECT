import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { SearchCriteria } from '../../../components/ui/user/searchuserbar/SearchUserBar';
import { fetchSearchUsers } from './fetchSearchUsers';
import type PageableResponse from '../../../interfaces/admin/audit/PageableResponse';
import type User from '../../../interfaces/user/User';

export function useUserSearchPage(
    criteria: SearchCriteria,
    page: number,
    size: number
) {

    const hasAnyFilter = Boolean(
        criteria.userId
        || criteria.universityNumber
        || criteria.role
    );

    return useQuery<PageableResponse<User>, Error>({
        queryKey: ['userSearch', criteria, page, size],
        queryFn: () => fetchSearchUsers(criteria, page, size),
        enabled: hasAnyFilter,
        placeholderData: keepPreviousData,
        staleTime: 0,
        gcTime: 0,
    });
}