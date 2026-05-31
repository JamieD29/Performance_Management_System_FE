import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";

// ============================================================
// TYPES
// ============================================================

export interface CycleInfo {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  progressPercent: number;
  daysRemaining: number | null;
}

export interface DashboardSummary {
  totalStaff: number;
  totalOkrs: number;
  pendingApproval: number;
  awaitingReview: number;
  completed: number;
  accepted: number;
  notStarted: number;
}

export interface DepartmentStat {
  deptId: string;
  deptName: string;
  deptCode: string;
  memberCount: number;
  completedCount: number;
  submittedCount: number;
  acceptedCount: number;
  pendingCount: number;
  avgScore: number | null;
  completionRate: number;
}

export interface StaffRankItem {
  okrId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  deptName: string;
  deptCode: string;
  jobTitle: string | null;
  objective: string;
  totalScore: number;
  managerScore: number | null;
  status: string;
}

export interface TimelinePoint {
  week: string;
  weekLabel: string;
  completed: number;
  submitted: number;
}

export interface ActionItem {
  type: string;
  count: number;
  label: string;
  route: string;
  severity: "error" | "warning" | "info" | "success";
}

export interface RatingPersonItem {
  userId: string;
  userName: string;
  userAvatar: string | null;
  deptName: string;
  selfScore: number | null;
  managerScore: number | null;
}

export interface DeanDashboardData {
  cycle: CycleInfo | null;
  allCycles: CycleInfo[];
  summary: DashboardSummary;
  okrsByStatus: Record<string, number>;
  departmentStats: DepartmentStat[];
  staffRanking: StaffRankItem[];
  ratingDistribution: Record<string, number>;
  ratingDetails: Record<string, RatingPersonItem[]>;
  timelineData: TimelinePoint[];
  actionItems: ActionItem[];
}

// ============================================================
// HOOK
// ============================================================

export function useDeanDashboardData(cycleId?: string) {
  const [data, setData] = useState<DeanDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = cycleId ? `/okrs/dean-dashboard?cycleId=${cycleId}` : "/okrs/dean-dashboard";
      const res = await api.get(url);
      setData(res.data);
    } catch (err: any) {
      console.error("Dean Dashboard fetch error:", err);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
