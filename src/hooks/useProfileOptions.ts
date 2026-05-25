// src/hooks/useProfileOptions.ts
// Single Source of Truth: Fetch enum options từ BE thay vì hardcode ở FE.
// Khi cần thêm/sửa giá trị enum, chỉ cần sửa ở user.entity.ts (BE).

import { useState, useEffect } from "react";
import { api } from "../services/api";

export interface EnumOption {
  value: string;
  label: string;
  key: string;
}

export interface ProfileOptions {
  jobTitles: EnumOption[];
  academicRanks: EnumOption[];
  degrees: EnumOption[];
  genders: EnumOption[];
}

const EMPTY_OPTIONS: ProfileOptions = {
  jobTitles: [],
  academicRanks: [],
  degrees: [],
  genders: [],
};

export function useProfileOptions() {
  const [options, setOptions] = useState<ProfileOptions>(EMPTY_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get("/users/profile-options");
        if (!cancelled) {
          setOptions(res.data);
        }
      } catch (err) {
        console.error("Failed to load profile options:", err);
        if (!cancelled) {
          setError("Không thể tải danh sách tùy chọn hồ sơ.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { options, loading, error };
}
