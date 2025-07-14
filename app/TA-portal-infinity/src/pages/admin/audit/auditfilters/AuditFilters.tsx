type Props = {
  service: string;
  entity: string;
  onServiceChange: (s: string) => void;
  onEntityChange: (e: string) => void;
  onApply: () => void;
};

export default function AuditFilters({
  service,
  entity,
  onServiceChange,
  onEntityChange,
  onApply,
}: Props) {
  return (
    <div className="flex gap-4">
      <input
        className="input input-bordered"
        placeholder="Service"
        value={service}
        onChange={e => onServiceChange(e.target.value)}
      />
      <input
        className="input input-bordered"
        placeholder="Entity Type"
        value={entity}
        onChange={e => onEntityChange(e.target.value)}
      />
      <button className="btn btn-primary" onClick={onApply}>
        Apply
      </button>
    </div>
  );
}
