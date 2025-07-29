import { useState } from 'react';
import { useAuditEvents } from '../../../../api/admin/audit/useAuditEvents';
import AuditTable from '../audittable/AuditTable';
import Pagination from '../../../../utility/pagination/pagination/Pagination';
import AuditFilters from '../auditfilters/AuditFilters';
import AuditDetailModal from '../auditdetailmodal/AuditDetailModal';
import { ToastContainer, toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);

  const [serviceFilter, setServiceFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [entityIdFilter, setEntityIdFilter] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [actorIdFilter, setActorIdFilter] = useState(0);
  const [whenFilter, setWhenFilter] = useState(''); 

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useAuditEvents(page, 10, {
    service: serviceFilter || undefined,
    entityType: entityFilter || undefined,
    entityId: entityIdFilter > 0 ? entityIdFilter : undefined,
    action: actionFilter || undefined,
    actorId: actorIdFilter > 0 ? actorIdFilter : undefined,
    dateOnly: whenFilter,
  });


  const handleApply = () => {
    setPage(0);
    refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
      <div className="flex items-end w-full">
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        <a href="http://localhost:3000" target="_blank" rel="noopener"  
          className=" ml-auto inline-flex items-center justify-center px-3 py-1 
             hover:text-[#0089b2] bg-[#00c89c] text-white rounded hover:bg-[#c7fcec] transition">
          Open Grafana
        </a>
      </div>
      <AuditFilters
        service={serviceFilter}
        onServiceChange={setServiceFilter}
        entity={entityFilter}
        onEntityChange={setEntityFilter}
        entityId={entityIdFilter}
        onEntityIdChange={setEntityIdFilter}
        action={actionFilter}
        onActionChange={setActionFilter}
        actorId={actorIdFilter}
        onActorIdChange={setActorIdFilter}
        when={whenFilter}
        onWhenChange={setWhenFilter}
        onApply={handleApply}
      />

      <AuditTable
        events={data?.content || []}
        loading={isLoading}
        onSelect={setSelectedId}
      />

      <Pagination
        page={page}
        pageCount={data?.totalPages || 0}
        onPrev={() => setPage(p => Math.max(0, p - 1))}
        onNext={() =>
          setPage(p => Math.min((data?.totalPages || 1) - 1, p + 1))
        }
      />

      <AuditDetailModal id={selectedId} onClose={() => setSelectedId(null)} serviceFilter={serviceFilter}/>
    </div>
  );
}
