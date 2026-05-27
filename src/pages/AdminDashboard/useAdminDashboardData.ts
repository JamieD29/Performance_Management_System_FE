import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";

// --- TYPES ---
export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
    incompleteProfile: number;
    completedProfile: number;
  };
}

export interface SystemHealth {
  cpu: {
    loadPercent: number;
    coreCount: number;
    model: string;
    measurementWindowMs: number;
  };
  memory: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    usagePercent: number;
    totalGB: number;
    usedGB: number;
    freeGB: number;
  };
  nodeProcess: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
    heapUsagePercent: number;
    pid: number;
    nodeVersion: string;
  };
  uptime: {
    totalSeconds: number;
    days: number;
    hours: number;
    minutes: number;
    label: string;
  };
  system: {
    platform: string;
    arch: string;
    hostname: string;
  };
  timestamp: string;
}

export interface SystemLog {
  id: string;
  action: string;
  resource: string;
  message: string;
  status: "SUCCESS" | "FAILED";
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface EvaluationCycle {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  progressPercent?: number;
  daysRemaining?: number | null;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats | null;
  systemHealth: SystemHealth | null;
  recentLogs: SystemLog[];
  currentCycle: EvaluationCycle | null;
}

const HEALTH_POLL_INTERVAL = 30_000; // 30 giây
const LOGS_POLL_INTERVAL  = 15_000; // 15 giây — logs cần realtime hơn

export function useAdminDashboardData() {
  const [data, setData] = useState<AdminDashboardData>({
    stats: null,
    systemHealth: null,
    recentLogs: [],
    currentCycle: null,
  });
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Lấy dữ liệu chính (một lần khi mount) ---
  const fetchMainData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, logsRes, cyclesRes] = await Promise.allSettled([
        api.get("/admin/dashboard"),
        api.get("/system-logs"),
        api.get("/performance/cycles"),
      ]);

      // Stats
      const stats =
        statsRes.status === "fulfilled" ? statsRes.value.data : null;

      // Logs — lấy 10 hành động gần nhất
      let recentLogs: SystemLog[] = [];
      if (logsRes.status === "fulfilled") {
        const raw = Array.isArray(logsRes.value.data)
          ? logsRes.value.data
          : logsRes.value.data?.data || [];
        recentLogs = raw.slice(0, 10);
      }

      // Chu kỳ hiện tại
      let currentCycle: EvaluationCycle | null = null;
      if (cyclesRes.status === "fulfilled") {
        const cycles: EvaluationCycle[] = Array.isArray(cyclesRes.value.data)
          ? cyclesRes.value.data
          : [];
        const openCycle = cycles.find((c) => c.status === "OPEN");
        const candidate = openCycle || cycles[0] || null;
        if (candidate) {
          // Tính daysRemaining nếu chưa có
          const daysRemaining = candidate.endDate
            ? Math.ceil(
                (new Date(candidate.endDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )
            : null;
          const progressPercent = candidate.startDate && candidate.endDate
            ? Math.max(
                0,
                Math.min(
                  100,
                  Math.round(
                    ((Date.now() - new Date(candidate.startDate).getTime()) /
                      (new Date(candidate.endDate).getTime() -
                        new Date(candidate.startDate).getTime())) *
                      100
                  )
                )
              )
            : 0;
          currentCycle = { ...candidate, daysRemaining, progressPercent };
        }
      }

      setData((prev) => ({ ...prev, stats, recentLogs, currentCycle }));
    } catch (err: any) {
      setError(err?.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Lấy system health (polling) ---
  const fetchSystemHealth = useCallback(async () => {
    try {
      setHealthLoading(true);
      const res = await api.get("/admin/system-health");
      setData((prev) => ({ ...prev, systemHealth: res.data }));
    } catch {
      // Không crash UI nếu system health lỗi
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // --- Lấy chỉ logs (dùng riêng để polling độc lập với data chính) ---
  const fetchLogs = useCallback(async () => {
    try {
      const logsRes = await api.get("/system-logs");
      const raw = Array.isArray(logsRes.data)
        ? logsRes.data
        : logsRes.data?.data || [];
      const recentLogs: SystemLog[] = raw.slice(0, 20);
      setData((prev) => ({ ...prev, recentLogs }));
    } catch {
      // Không crash UI nếu logs lỗi
    }
  }, []);

  useEffect(() => {
    fetchMainData();
    fetchSystemHealth();

    // Polling system health mỗi 30 giây
    const healthInterval = setInterval(fetchSystemHealth, HEALTH_POLL_INTERVAL);
    // Polling logs mỗi 15 giây — để bắt được login/logout mới
    const logsInterval  = setInterval(fetchLogs, LOGS_POLL_INTERVAL);

    return () => {
      clearInterval(healthInterval);
      clearInterval(logsInterval);
    };
  }, [fetchMainData, fetchSystemHealth, fetchLogs]);

  return {
    data,
    loading,
    healthLoading,
    error,
    refetch: fetchMainData,
    refetchHealth: fetchSystemHealth,
    refetchLogs: fetchLogs,
  };
}
