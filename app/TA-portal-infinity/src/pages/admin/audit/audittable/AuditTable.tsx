import type AuditEvent from "../../../../interfaces/admin/audit/AuditEvent";

type Props = {
  events: AuditEvent[];
  loading: boolean;
  onSelect: (id: number) => void;
};

export default function AuditTable({ events, loading, onSelect }: Props) {
  if (loading) return <div>Loading…</div>;
  return (
    <table className="min-w-full text-sm border rounded-lg">
      <thead className="bg-slate-100 text-left text-xs uppercase">
        <tr>
          <th className="px-3 py-2">When</th>
          <th className="px-3 py-2">Service</th>
          <th className="px-3 py-2">Actor Id</th>
          <th className="px-3 py-2">Action</th>
          <th className="px-3 py-2">Entity</th>
        </tr>
      </thead>
      <tbody>
        {events.map(ev => (
          <tr
            key={ev.id}
            className="hover:bg-slate-50 cursor-pointer"
            onClick={() => onSelect(ev.id)}
          >
            <td className="px-3 py-2">{new Date(ev.timestamp).toLocaleString()}</td>
            <td className="px-3 py-2">{ev.service}</td>
            <td className="px-3 py-2">{ev.actorId}</td>
            <td className="px-3 py-2">{ev.action}</td>
            <td className="px-3 py-2">
              {ev.entityType}, ID: {ev.entityId}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
