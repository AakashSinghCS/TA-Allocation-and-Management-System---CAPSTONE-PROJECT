import { useState } from 'react';
import { useAuditEvents } from '../../../../api/admin/audit/useAuditEvents';
import AuditTable from '../audittable/AuditTable';
import Pagination from '../../../../utility/pagination/pagination/Pagination';
import AuditFilters from '../auditfilters/AuditFilters';
import AuditDetailModal from '../auditdetailmodal/AuditDetailModal';
import { ToastContainer, toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { MousePointerClick } from 'lucide-react';

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

  const hasAnyFilter = Boolean(
    serviceFilter || entityFilter || entityIdFilter || actionFilter || actorIdFilter || whenFilter
  );
  return (
    <div className="container mx-auto p-4 z-10 space-y-6 -mt-6 max-w-7xl">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
      <div className="flex items-end w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-[#040941]">Audit Logs</h1>
        <a href="http://localhost:3000" target="_blank" rel="noopener"  
          className="ml-auto inline-flex items-center justify-center px-3 py-1 bg-[#040941] text-white rounded hover:bg-[#c7fcec] hover:text-[#040941] transition">
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

      {!hasAnyFilter ? (
        <div className="flex flex-col items-center justify-center py-12">
          {/* You can use any icon here, e.g. Lucide's FileText or ClipboardList */}
          <MousePointerClick className="w-20 h-20 text-gray-200 mb-4" />
          <p className="text-xl text-gray-300 text-center font-medium max-w-xl">
            Please select a filter to view audit logs.
          </p>
        </div>
      ) : (
        <>
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
        </>
      )}
      <AuditDetailModal id={selectedId} onClose={() => setSelectedId(null)} serviceFilter={serviceFilter}/>
    </div>
  );
}
