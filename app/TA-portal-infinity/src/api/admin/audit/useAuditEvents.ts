import { useQuery } from '@tanstack/react-query';
import type AuditEvent from '../../../interfaces/admin/audit/AuditEvent';
import type PageableResponse from '../../../interfaces/admin/audit/PageableResponse';

export function useAuditEvents(
    page: number,
    size: number,
    filters: { service?: string; entityType?: string }
) {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        ...filters,
    }).toString();

    return useQuery<PageableResponse<AuditEvent>, Error>({
        queryKey: ['auditEvents', page, filters],
        queryFn: () =>
            fetch(`http://localhost:8080/users/audit?${params}`,{
                method: "GET",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            })
                .then(res => {
                    if (!res.ok) throw new Error(res.statusText);
                    return res.json() as Promise<PageableResponse<AuditEvent>>;
                }),
        placeholderData: old => old,      // ← keep showing previous page
        staleTime: 60_000,               // ← data considered “fresh” for 60s
    });
}