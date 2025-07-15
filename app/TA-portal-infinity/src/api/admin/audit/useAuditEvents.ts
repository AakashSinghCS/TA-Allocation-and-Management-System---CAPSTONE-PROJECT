import { useQuery } from '@tanstack/react-query';
import type AuditEvent from '../../../interfaces/admin/audit/AuditEvent';
import type PageableResponse from '../../../interfaces/admin/audit/PageableResponse';

export const SERVICE_PATHS: Record<string, string> = {
    "user-service": "users",
    "course-service": "courses",
    "application-service": "applications",
    "notification-service": "notifications",
    "profile-service": "profiles",
};

export function useAuditEvents(
    page: number,
    size: number,
    filters: { service?: string; entityType?: string }
) {
    const token = localStorage.getItem("token");

    const paramsObj: Record<string, string> = {
        page: String(page),
        size: String(size),
        sort: "timestamp,desc",
    };

    if (filters.entityType) {
        paramsObj.entityType = filters.entityType;
    }

    const params = new URLSearchParams(paramsObj).toString();
    const enabled = Boolean(filters.service);
    const basePath = filters.service
        ? SERVICE_PATHS[filters.service] + '/audit'
        : '';

    const url = enabled
        ? `http://localhost:8080/${basePath}?${params}`
        : '';

    return useQuery<PageableResponse<AuditEvent>, Error>({
        queryKey: ['auditEvents', page, filters],
        queryFn: () =>
            fetch(url, {
                method: "GET",
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            })
                .then(res => {
                    if (!res.ok) throw new Error(res.statusText);
                    return res.json() as Promise<PageableResponse<AuditEvent>>;
                }),
        enabled,
        placeholderData: {
            content: [],
            totalElements: 0,
            totalPages: 0,
            number: page,
            size: size,
        } as PageableResponse<AuditEvent>,
        staleTime: 60_000,               // ← data considered “fresh” for 60s
    });
}