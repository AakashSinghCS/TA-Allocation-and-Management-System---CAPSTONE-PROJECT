import React from 'react';
import { useAuditEvent } from '../../../../api/admin/audit/useAuditEvent';

type Props = { id: number | null; onClose: () => void; serviceFilter: string };

export default function AuditDetailModal({
  id,
  onClose,
  serviceFilter = "",
}: Props) {
  const { data, isLoading, error } =
    useAuditEvent(id!, id != null, serviceFilter);

  if (id == null) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-[90vw] max-w-4xl p-6 overflow-auto"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="float-right text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Audit Event #{id}</h2>

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
                <pre
                  className="bg-gray-100 rounded p-2 overflow-auto whitespace-pre-wrap break-words"
                  style={{ maxHeight: '60vh', fontSize: '0.9rem', lineHeight: 1.4 }}
                >
                  {data.beforeJson
                    ? JSON.stringify(JSON.parse(data.beforeJson), null, 2)
                    : 'N/A'}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-1">After</h3>
                <pre
                  className="bg-gray-100 rounded p-2 overflow-auto whitespace-pre-wrap break-words"
                  style={{ maxHeight: '60vh', fontSize: '0.9rem', lineHeight: 1.4 }}
                >
                  {data.afterJson
                    ? JSON.stringify(JSON.parse(data.afterJson), null, 2)
                    : 'N/A'}
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
