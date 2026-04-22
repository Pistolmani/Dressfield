import api from "./api";
import type { AuditLogPageDto } from "@/types/audit-log";

export async function getAuditLogs(params: {
  page?: number;
  pageSize?: number;
  entityType?: string;
  action?: string;
}): Promise<AuditLogPageDto> {
  const { data } = await api.get<AuditLogPageDto>("/api/admin/audit-logs", { params });
  return data;
}
