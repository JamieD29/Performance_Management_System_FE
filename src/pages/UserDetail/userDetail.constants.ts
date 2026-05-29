export const OKR_STATUS_MAP: Record<string, { label: string; color: string; bgcolor: string }> = {
  PENDING: { label: "Chờ duyệt", color: "#d97706", bgcolor: "#fef3c7" },
  NEGOTIATING: { label: "Đang đàm phán", color: "#2563eb", bgcolor: "#dbeafe" },
  ACCEPTED: { label: "Đã duyệt", color: "#059669", bgcolor: "#d1fae5" },
  REJECTED: { label: "Từ chối", color: "#dc2626", bgcolor: "#fee2e2" },
  SUBMITTED: { label: "Đã nộp tự khai", color: "#7c3aed", bgcolor: "#ede9fe" },
  COMPLETED: { label: "Đã chốt điểm", color: "#0f766e", bgcolor: "#ccfbf1" },
};

export const EVALUATION_STATUS_MAP: Record<string, { label: string; color: string; bgcolor: string }> = {
  DRAFT: { label: "Bản nháp", color: "#64748b", bgcolor: "#f1f5f9" },
  SUBMITTED: { label: "Chờ quản lý duyệt", color: "#d97706", bgcolor: "#fef3c7" },
  EVALUATED: { label: "Quản lý đã chấm", color: "#059669", bgcolor: "#d1fae5" },
  APPROVED: { label: "Đã chốt", color: "#0f766e", bgcolor: "#ccfbf1" },
};

export const RATING_LABELS: Record<string, string> = {
  A: "A - Hoàn thành xuất sắc",
  B: "B - Hoàn thành tốt",
  C: "C - Hoàn thành",
  D: "D - Không hoàn thành",
};
