import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

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
    if (!draftService) {
      toast.error('Please pick a service before applying filters.');
      return;
    }
    onServiceChange(draftService);
    onEntityChange(draftEntity);
    onEntityIdChange(draftEntityId);
    onActionChange(draftAction);
    onActorIdChange(draftActorId);
    onWhenChange(draftWhen);
    onApply();
  };



  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 text-sm">
  {/* Service */}
  <div className="flex flex-col">
    <label htmlFor="service-choose" className="text-xs font-medium mb-1">Service</label>
    <select
      className="border border-gray-300 rounded-sm px-2 py-1 focus:ring-1 focus:ring-blue-500"
      id="service-choose"
      value={draftService}
      onChange={e => setDraftService(e.target.value)}
    >
      <option value="">Pick service…</option>
      {SERVICE_OPTIONS.map(svc => (
        <option key={svc} value={svc}>{svc}</option>
      ))}
    </select>
  </div>

  {/* Entity Name */}
  <div className="flex flex-col">
    <label htmlFor="audit-entity" className="text-xs font-medium mb-1">Entity</label>
    <input
      type="text"
      id="audit-entity"
      className="border border-gray-300 rounded-sm px-2 py-1 focus:ring-1 focus:ring-blue-500"
      placeholder="Entity Name"
      value={draftEntity}
      onChange={e => setDraftEntity(e.target.value)}
    />
  </div>

  {/* Entity ID */}
  <div className="flex flex-col">
    <label htmlFor="audit-entity-id" className="text-xs font-medium mb-1">Entity ID</label>
    <input
      type="number"
      id="audit-entity-id"
      className="border border-gray-300 rounded-sm px-2 py-1 focus:ring-1 focus:ring-blue-500"
      placeholder="Entity ID"
      value={draftEntityId}
      onChange={e => setDraftEntityId(+e.target.value)}
    />
  </div>

  {/* Action */}
  <div className="flex flex-col">
    <label htmlFor="audit-action" className="text-xs font-medium mb-1">Action</label>
    <select
      className="border border-gray-300 rounded-sm px-2 py-1 focus:ring-1 focus:ring-blue-500"
      id="audit-action"
      value={draftAction}
      onChange={e => setDraftAction(e.target.value)}
    >
      <option value="">Pick action…</option>
      {ACTION_OPTIONS.map(a => (
        <option key={a} value={a}>{a}</option>
      ))}
    </select>
  </div>

  {/* Actor ID */}
  <div className="flex flex-col">
    <label htmlFor="audit-actor-id" className="text-xs font-medium mb-1">Actor ID</label>
    <input
      type="number"
      id="audit-actor-id"
      className="border border-gray-300 rounded-sm px-2 py-1 focus:ring-1 focus:ring-blue-500"
      placeholder="Actor ID"
      value={draftActorId}
      onChange={e => setDraftActorId(+e.target.value)}
    />
  </div>

  {/* When */}
  <div className="flex flex-col">
    <label  htmlFor="audit-date" className="text-xs font-medium mb-1">Date</label>
    <input
      type="date"
      id="audit-date"
      className="border border-gray-300 rounded-sm px-2 py-1 focus:ring-1 focus:ring-blue-500"
      value={draftWhen}
      onChange={e => setDraftWhen(e.target.value)}
    />
  </div>

  {/* Apply Button spans full width on small, auto-size on large */}
  <div className="flex items-end">
    <button
      className="bg-[#040941] text-white text-sm px-3 py-1 rounded-sm hover:bg-[#040491] transition-colors w-full sm:w-auto"
      onClick={handleApply}
    >
      Apply
    </button>
  </div>
</div>
  );
}
