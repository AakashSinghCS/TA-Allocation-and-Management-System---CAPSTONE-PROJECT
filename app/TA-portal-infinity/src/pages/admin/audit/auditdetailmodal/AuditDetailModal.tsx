import { useAuditEvent } from '../../../../api/admin/audit/useAuditEvent';


type Props = { 
  id: number | null; 
  onClose: () => void;
  serviceFilter :string; 
};

export default function AuditDetailModal({ id, onClose, serviceFilter="" }: Props) {
  const { data, isLoading, error } = useAuditEvent(id!, id != null, serviceFilter);

  if (id == null) return null;

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
        ) : data ? (
          <>
            <p className="mb-4 text-sm text-gray-600">
              <strong>{data.service}</strong> – <strong>{data.actorId}</strong>{' '}
              {data.action.toLowerCase()}{' '}
              {data.entityType} #{data.entityId} at{' '}
              {new Date(data.timestamp).toLocaleString()}
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <h3 className="font-semibold mb-1">Before</h3>
                <pre className="bg-gray-100 rounded p-2 max-h-64 overflow-auto">
                  {data.beforeJson ?? 'N/A'}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-1">After</h3>
                <pre className="bg-gray-100 rounded p-2 max-h-64 overflow-auto">
                  {data.afterJson ?? 'N/A'}
                </pre>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-600">No details available.</p>
        )}
      </div>
    </div>
  );
}
