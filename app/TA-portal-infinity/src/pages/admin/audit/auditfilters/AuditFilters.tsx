import { useState, useEffect } from 'react';

type Props = {
  service: string;
  entity: string;
  onServiceChange: (s: string) => void;
  onEntityChange: (e: string) => void;
  onApply: () => void;
};

const SERVICE_OPTIONS = [
  "user-service",
  "course-service",
  "application-service",
  "notification-service",
  "profile-service",
];

export default function AuditFilters({
  service,
  entity,
  onServiceChange,
  onEntityChange,
  onApply,
}: Props) {
  // Local draft state
  const [draftService, setDraftService] = useState(service);
  const [draftEntity,  setDraftEntity]  = useState(entity);

  // Whenever parent “service” or “entity” props change,
  // reset our drafts to match.
  useEffect(() => {
    setDraftService(service);
    setDraftEntity(entity);
  }, [service, entity]);

  const handleApply = () => {
    // Push the drafts up
    onServiceChange(draftService);
    onEntityChange(draftEntity);
    onApply();
  };

  return (
    <div className="flex gap-4 items-end">
      {/* Service dropdown */}
      <div>
        <label className="block text-sm font-medium mb-1">Service</label>
        <select
          className="select select-bordered w-full"
          value={draftService}
          onChange={e => setDraftService(e.target.value)}
        >
          <option value="">Pick a service</option>
          {SERVICE_OPTIONS.map(svc => (
            <option key={svc} value={svc}>
              {svc}
            </option>
          ))}
        </select>
      </div>

      {/* Entity type text input */}
      <div>
        <label className="block text-sm font-medium mb-1">Entity Name</label>
        <input
          className="input input-bordered w-full"
          placeholder="Entity Name"
          value={draftEntity}
          onChange={e => setDraftEntity(e.target.value)}
        />
      </div>

      {/* Apply button */}
      <button
        className="btn btn-primary h-10 self-center"
        onClick={handleApply}
      >
        Apply
      </button>
    </div>
  );
}
