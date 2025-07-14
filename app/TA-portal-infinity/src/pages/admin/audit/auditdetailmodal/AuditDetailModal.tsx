import { useQuery } from '@tanstack/react-query';
import type AuditEvent from '../../../../interfaces/admin/audit/AuditEvent';

type Props = {
  id: number | null;
  onClose: () => void;
};

/** Fetch a single AuditEvent by ID */
function useAuditEvent(
  id: number,
  enabled: boolean
) {
  return useQuery<AuditEvent, Error>({
    queryKey: ['auditEvent', id],
    queryFn: () =>
      fetch(`/api/audit-events/${id}`)
        .then(res => {
          if (!res.ok) throw new Error(res.statusText);
          return res.json() as Promise<AuditEvent>;
        }),
    enabled,
  });
}

export default function AuditDetailModal({ id, onClose }: Props) {
  const { data, isLoading, error } = useAuditEvent(id!, id != null);

  // nothing to render if no ID
  if (id === null) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="float-right text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">
          Audit Event #{id}
        </h2>

        {isLoading ? (
          <p>Loading…</p>
        ) : error ? (
          <p className="text-red-600">Error: {error.message}</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-600">
              <strong>{data!.service}</strong> – <strong>{data!.actor}</strong>{' '}
              {data!.action.toLowerCase()}{' '}
              {data!.entityType} #{data!.entityId} at{' '}
              {new Date(data!.timestamp).toLocaleString()}
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <h3 className="font-semibold mb-1">Before</h3>
                <pre className="bg-gray-100 rounded p-2 max-h-64 overflow-auto">
                  {data!.before
                    ? JSON.stringify(data!.before, null, 2)
                    : 'N/A'}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-1">After</h3>
                <pre className="bg-gray-100 rounded p-2 max-h-64 overflow-auto">
                  {data!.after
                    ? JSON.stringify(data!.after, null, 2)
                    : 'N/A'}
                </pre>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
