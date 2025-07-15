import { useState } from 'react';
import { useAuditEvents } from '../../../../api/admin/audit/useAuditEvents';
import AuditTable from '../audittable/AuditTable';
import Pagination from '../pagination/Pagination';
import AuditFilters from '../auditfilters/AuditFilters';
import AuditDetailModal from '../auditdetailmodal/AuditDetailModal';

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const [serviceFilter, setServiceFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  //increase 10 to 25 when Production starts. 
  const { data, isLoading } = useAuditEvents(page, 10, {
    service: serviceFilter || undefined,
    entityType: entityFilter || undefined,
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Audit Logs</h1>
      <AuditFilters
        service={serviceFilter}
        onServiceChange={setServiceFilter}
        entity={entityFilter}
        onEntityChange={setEntityFilter}
        onApply={() => setPage(0)}
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
