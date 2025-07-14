export default interface AuditEvent {
  id: number;
  timestamp: string;          // ISO date-time
  actor: string;              // createdBy / lastModifiedBy
  action: "CREATE" | "UPDATE" | "DELETE";
  entityType: string;         // e.g. "Book"
  entityId: string | number;
  summary: string;            // short description
  service: string;
  beforeJson?: string;   // raw JSON blobs stored in the DB
  afterJson?: string;
  // before?: Record<string, any>; // optional diff
  // after?: Record<string, any>;
}