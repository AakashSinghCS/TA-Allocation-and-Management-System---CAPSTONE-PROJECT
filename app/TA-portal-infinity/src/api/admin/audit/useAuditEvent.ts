import { useQuery } from '@tanstack/react-query';
import type AuditEvent from '../../../interfaces/admin/audit/AuditEvent';
import { SERVICE_PATHS } from './useAuditEvents';

export function useAuditEvent(id: number, enabled: boolean, serviceFilter:string) {
  const token = localStorage.getItem("token");

  const basePath = serviceFilter
    ? SERVICE_PATHS[serviceFilter] + '/audit'
    : '';

  return useQuery<AuditEvent, Error>({
    queryKey: ['auditEvent', serviceFilter, id],
    queryFn: () =>
      fetch(`http://localhost:8080/${basePath}/${id}`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
        .then(res => {
          if (!res.ok) throw new Error(res.statusText);
          return res.json() as Promise<AuditEvent>;
        }),
    enabled,
  });
}