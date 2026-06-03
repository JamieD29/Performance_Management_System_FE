import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export interface StaffOkrItem {
  id: string;
  objective: string;
  status: string;
  totalScore: number;
  managerScore: number | null;
  cycleName: string | null;
}

export interface StaffOkrStatus {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  okrs: StaffOkrItem[];
}

export interface StaffEvaluationStatus {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  status: string | null;
  selfRating: string | null;
  managerRating: string | null;
  selfScoreTotal: number;
  principalScoreTotal: number;
  cycleName: string | null;
}

export interface OverviewObjective {
  id: string;
  title: string;
  type: string;
  progress: number;
  status: string;
  deadline?: string;
  keyResults: any[];
}

export interface DepartmentOverviewData {
  department: {
    id: string;
    name: string;
    code: string;
    memberCount: number;
  };
  metrics: {
    totalOkrs: number;
    completionRate: number;
    actionRequired: number;
  };
  objectives: OverviewObjective[];
  staffOkrStatus: StaffOkrStatus[];
  staffEvaluationStatus: StaffEvaluationStatus[];
}

export function useDepartmentOverviewData(deptId: string | null, cycleId?: string) {
  const [data, setData] = useState<DepartmentOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deptId) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `/okrs/department/${deptId}/overview`;
        if (cycleId) {
          url += `?cycleId=${cycleId}`;
        }
        const response = await api.get(url);
        setData(response.data);
      } catch (err: any) {
        console.error('Failed to fetch department overview', err);
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu tổng quan.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deptId, cycleId]);

  return { data, loading, error };
}
