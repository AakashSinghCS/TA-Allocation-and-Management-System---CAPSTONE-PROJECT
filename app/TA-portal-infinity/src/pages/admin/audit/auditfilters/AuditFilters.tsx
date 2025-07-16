import { useState, useEffect } from 'react';

type Props = {
  service: string;
  entity: string;
  entityId: number;
  action: string;
  actorId: number;
  when: string; // ISO string that can be used with input[type="datetime-local"]
  onServiceChange: (s: string) => void;
  onEntityChange: (e: string) => void;
  onEntityIdChange: (id: number) => void;
  onActionChange: (action: string) => void;
  onActorIdChange: (id: number) => void;
  onWhenChange: (when: string) => void;
  onApply: () => void;
};

const SERVICE_OPTIONS = [
  "user-service",
  "course-service",
  "application-service",
  "notification-service",
  "profile-service",
];

export const ACTION_OPTIONS = [
  "UPDATE",
  "DELETE",
  "CREATE"
]

export default function AuditFilters({
  service,
  entity,
  entityId,
  action,
  actorId,
  when,
  onServiceChange,
  onEntityChange,
  onEntityIdChange,
  onActionChange,
  onActorIdChange,
  onWhenChange,
  onApply,
}: Props) {
  // Local draft state
  const [draftService, setDraftService] = useState(service);
  const [draftEntity, setDraftEntity] = useState(entity);
  const [draftEntityId, setDraftEntityId] = useState(entityId);
  const [draftAction, setDraftAction] = useState(action);
  const [draftActorId, setDraftActorId] = useState(actorId);
  const [draftWhen, setDraftWhen] = useState(when);

  // Whenever parent props change, reset drafts
  useEffect(() => {
    setDraftService(service);
    setDraftEntity(entity);
    setDraftEntityId(entityId);
    setDraftAction(action);
    setDraftActorId(actorId);
    setDraftWhen(when);
  }, [service, entity, entityId, action, actorId, when]);

  const handleApply = () => {
    onServiceChange(draftService);
    onEntityChange(draftEntity);
    onEntityIdChange(draftEntityId);
    onActionChange(draftAction);
    onActorIdChange(draftActorId);
    onWhenChange(draftWhen);
    onApply();
  };



  return (
    <div className="flex flex-wrap gap-4 items-end">
      {/* Service */}
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

      {/* Entity Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Entity Name</label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Entity Name"
          value={draftEntity}
          onChange={e => setDraftEntity(e.target.value)}
        />
      </div>

      {/* Entity Id */}
      <div>
        <label className="block text-sm font-medium mb-1">Entity ID</label>
        <input
          type="number"
          className="input input-bordered w-full"
          placeholder="Entity Id"
          value={draftEntityId}
          onChange={e => setDraftEntityId(Number(e.target.value))}
        />
      </div>

      {/* Action */}
      <div>
        <label className="block text-sm font-medium mb-1">Action</label>
        <select
          className="select select-bordered w-full"
          value={draftAction}
          onChange={e => setDraftAction(e.target.value)}
        >
            <option value="">Pick an Action</option>
            {ACTION_OPTIONS.map(ac => (
              <option key={ac} value={ac}>
                {ac}
              </option>
            ))}
        </select>
      </div>

      {/* Actor Id */}
      <div>
        <label className="block text-sm font-medium mb-1">Actor ID</label>
        <input
          type="number"
          className="input input-bordered w-full"
          placeholder="Actor Id"
          value={draftActorId}
          onChange={e => setDraftActorId(Number(e.target.value))}
        />
      </div>

      {/* When */}
      <div>
        <label className="block text-sm font-medium mb-1">When</label>
        <input
          type="date"
          className="input input-bordered w-full"
          value={draftWhen}
          onChange={e => setDraftWhen(e.target.value)}
        />
      </div>

      {/* Apply */}
      <button
        className="btn btn-primary h-10 self-center"
        onClick={handleApply}
      >
        Apply
      </button>
    </div>
  );
}
