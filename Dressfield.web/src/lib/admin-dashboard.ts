import api from "@/lib/api";
import type { AdminDashboardSummaryDto } from "@/types/admin-dashboard";

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummaryDto> {
  const { data } = await api.get<AdminDashboardSummaryDto>("/api/admin/dashboard/summary");
  return data;
}

