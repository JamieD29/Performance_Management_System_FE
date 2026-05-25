// ⚠️ FALLBACK VALUES — Chỉ sử dụng khi API /users/profile-options không khả dụng.
// 📌 Nguồn chính thức (Single Source of Truth): Backend → user.entity.ts
// 👉 Khi cần thêm/sửa giá trị, sửa enum ở BE, FE sẽ tự động cập nhật qua API.

import type { EnumOption } from "../../hooks/useProfileOptions";

export const FALLBACK_ACADEMIC_RANKS: EnumOption[] = [
  { value: "Giáo sư", label: "Giáo sư (GS)", key: "GS" },
  { value: "Phó giáo sư", label: "Phó Giáo sư (PGS)", key: "PGS" },
  { value: "Không", label: "Không có học hàm", key: "NONE" },
];

export const FALLBACK_DEGREES: EnumOption[] = [
  { value: "Tiến sĩ", label: "Tiến sĩ (TS)", key: "TS" },
  { value: "Thạc sĩ", label: "Thạc sĩ (ThS)", key: "THS" },
  { value: "Cử nhân", label: "Cử nhân (CN)", key: "CN" },
];

export const FALLBACK_JOB_TITLES: EnumOption[] = [
  { value: "Giảng viên chính", label: "Giảng viên chính", key: "SENIOR_LECTURER" },
  { value: "Giảng viên", label: "Giảng viên", key: "LECTURER" },
  { value: "Trợ giảng", label: "Trợ giảng", key: "ASSISTANT" },
  { value: "Chuyên viên", label: "Chuyên viên", key: "SPECIALIST" },
  { value: "Nghiên cứu viên", label: "Nghiên cứu viên", key: "RESEARCHER" },
  { value: "Giáo vụ", label: "Giáo vụ", key: "STAFF" },
  { value: "Kỹ thuật viên", label: "Kỹ thuật viên", key: "TECHNICIAN" },
  { value: "Nhân viên hỗ trợ", label: "Nhân viên hỗ trợ", key: "SUPPORT_STAFF" },
];

