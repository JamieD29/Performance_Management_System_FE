import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../services/api";
import type { UserDetailData } from "./userDetail.types";

export const useUserDetailData = () => {
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");

  useEffect(() => {
    if (!userId) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {};
        if (selectedCycleId) {
          params.cycleId = selectedCycleId;
        }

        const response = await api.get(`/users/${userId}/detail`, { params });
        const result: UserDetailData = response.data;
        
        setData(result);
        
        if (!selectedCycleId && result.allCycles && result.allCycles.length > 0) {
          setSelectedCycleId(result.allCycles[0].id);
        }
      } catch (err: any) {
        console.error("Lỗi khi tải chi tiết nhân sự:", err);
        setError(err.response?.data?.message || "Không thể tải thông tin nhân sự");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [userId, selectedCycleId]);

  return {
    userId,
    data,
    loading,
    error,
    selectedCycleId,
    setSelectedCycleId,
  };
};
