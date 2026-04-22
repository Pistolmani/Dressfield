export interface AuditLogDto {
  id: number;
  action: string;
  entityType: string;
  entityId: string | null;
  entityName: string | null;
  actorEmail: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditLogPageDto {
  items: AuditLogDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}
